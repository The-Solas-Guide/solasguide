// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({ id: "admin" })),
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  getOperationalRecord,
  getOperationalRecords,
  removeOperationalRecord,
  saveOperationalRecord,
  setOperationalArchive,
} from "@/lib/admin/operational-actions";

const recordId = "00000000-0000-4000-8000-000000000001";
const enquiry = {
  id: recordId,
  full_name: "Ava Example",
  email: "ava@example.com",
  phone: null,
  contact_preference: "email",
  consent_confirmed: true,
  consent_given_at: "2026-09-03T10:00:00.000Z",
  questionnaire_answers: {},
  source: "website",
  status: "new",
  internal_notes: null,
  customer_confirmation_sent_at: null,
  internal_notification_sent_at: null,
  customer_confirmation_status: "pending",
  internal_notification_status: "pending",
  submission_token: "00000000-0000-4000-8000-000000000002",
  created_at: "2026-09-03T10:00:00.000Z",
  updated_at: "2026-09-03T10:00:00.000Z",
  archived_at: null,
};

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function clientFor({
  list = [enquiry],
  record = enquiry,
  saveId = recordId,
  rpcResult = { data: recordId, error: null },
}: {
  list?: unknown[];
  record?: unknown;
  saveId?: string;
  rpcResult?: { data: unknown; error: { message: string } | null };
} = {}) {
  const queries: Record<string, ReturnType<typeof queryFor>> = {};
  const from = vi.fn((table: string) => {
    queries[table] ??= queryFor(table);
    return queries[table];
  });
  const rpc = vi.fn(async () => rpcResult);
  function queryFor(table: string) {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn(() => query);
    query.order = vi.fn(() => query);
    query.range = vi.fn(async () => ({ data: table === "customer_enquiries" ? list : [], error: null }));
    query.eq = vi.fn(() => query);
    query.maybeSingle = vi.fn(async () => ({ data: table === "customer_enquiries" ? record : null, error: null }));
    query.single = vi.fn(async () => ({ data: { id: saveId }, error: null }));
    query.insert = vi.fn(() => query);
    query.update = vi.fn(() => query);
    query.delete = vi.fn(() => query);
    return query;
  }
  return { client: { from, rpc }, from, rpc, queries };
}

describe("operational admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads private records and the configured table", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    await expect(getOperationalRecords("customer-enquiries")).resolves.toMatchObject({ ok: true, data: [enquiry] });
    expect(mocked.from).toHaveBeenCalledWith("customer_enquiries");
    await expect(getOperationalRecord("customer-enquiries", recordId)).resolves.toMatchObject({ ok: true, data: enquiry });
  });

  it("creates an administrator record with consent evidence and an admin source", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    const result = await saveOperationalRecord("customer-enquiries", form({
      full_name: "  Ava Example  ",
      email: "ava@example.com",
      contact_preference: "email",
      consent_confirmed: "on",
      consent_given_at: "2026-09-03T10:00:00.000Z",
      questionnaire_answers: JSON.stringify({ manual_context: "Called the office." }),
      source: "website",
      status: "contacted",
      internal_notes: "Follow up tomorrow.",
    }));
    expect(result).toEqual({ ok: true, data: { id: recordId } });
    expect(mocked.queries.customer_enquiries.insert).toHaveBeenCalledWith(expect.objectContaining({
      full_name: "Ava Example",
      source: "admin",
      consent_confirmed: true,
      consent_given_at: "2026-09-03T10:00:00.000Z",
      questionnaire_answers: { manual_context: "Called the office." },
    }));
  });

  it("rejects an invalid administrator record before writing", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    const result = await saveOperationalRecord("customer-enquiries", form({ email: "bad", consent_confirmed: "on" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toMatchObject({ full_name: expect.any(String), email: expect.any(String), consent_given_at: expect.any(String) });
    expect(mocked.from).not.toHaveBeenCalled();
  });

  it("updates only workflow and internal notes on an existing record", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    const result = await saveOperationalRecord("customer-enquiries", form({
      id: recordId,
      status: "closed",
      internal_notes: "Done",
      full_name: "Changed by an untrusted form",
      consent_confirmed: "false",
      source: "admin",
      archived_at: "2020-01-01T00:00:00.000Z",
    }));
    expect(result).toEqual({ ok: true, data: { id: recordId } });
    expect(mocked.queries.customer_enquiries.update).toHaveBeenCalledWith({ status: "closed", internal_notes: "Done" });
  });

  it("changes archive state without changing workflow status", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    await expect(setOperationalArchive("customer-enquiries", recordId, true)).resolves.toEqual({ ok: true });
    expect(mocked.queries.customer_enquiries.update).toHaveBeenCalledWith({ archived_at: expect.any(String) });
  });

  it("requires an archived record, exact name, and CRM acknowledgement before privacy removal", async () => {
    const mocked = clientFor();
    mocks.createClient.mockResolvedValue(mocked.client);
    await expect(removeOperationalRecord("customer-enquiries", recordId, "Ava Example", false)).resolves.toMatchObject({ ok: false });
    expect(mocked.rpc).not.toHaveBeenCalled();
    await expect(removeOperationalRecord("customer-enquiries", recordId, "Wrong", true)).resolves.toMatchObject({ ok: false });
    expect(mocked.rpc).not.toHaveBeenCalled();
  });

  it("uses the guarded privacy removal RPC after local checks", async () => {
    const archivedRecord = { ...enquiry, archived_at: "2026-09-04T00:00:00.000Z" };
    const mocked = clientFor({ record: archivedRecord });
    mocks.createClient.mockResolvedValue(mocked.client);
    await expect(removeOperationalRecord("customer-enquiries", recordId, "Ava Example", true)).resolves.toEqual({ ok: true });
    expect(mocked.rpc).toHaveBeenCalledWith("remove_admin_customer_enquiry", {
      p_enquiry_id: recordId,
      p_confirmation: "Ava Example",
      p_acknowledged: true,
    });
  });
});
