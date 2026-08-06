import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

vi.mock("workflow", () => {
  class FatalError extends Error {}
  class RetryableError extends Error {}
  return {
    FatalError,
    RetryableError,
    getStepMetadata: () => ({ attempt: 0 }),
  };
});

const customerRow = {
  consent_confirmed: true,
  consent_given_at: "2026-08-06T00:00:00.000Z",
  contact_preference: "email",
  created_at: "2026-08-06T00:00:00.000Z",
  customer_confirmation_sent_at: null,
  customer_confirmation_status: "pending",
  email: "maya@example.test",
  full_name: "Maya Test",
  id: "11111111-1111-4111-8111-111111111111",
  internal_notes: null,
  internal_notification_sent_at: null,
  internal_notification_status: "pending",
  phone: null,
  questionnaire_answers: {
    primaryNeed: "practitioner",
    outcomes: ["rest-reset"],
    extras: [],
    timing: "planning",
    location: "ubud",
    locationDetail: "",
    group: "solo",
    modalities: ["yoga"],
    budget: "flexible",
    notes: "",
  },
  source: "website",
  status: "new",
  submission_token: "22222222-2222-4222-8222-222222222222",
  updated_at: "2026-08-06T00:00:00.000Z",
};

function supabaseWithCustomerRow() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: customerRow, error: null }),
        })),
      })),
    })),
  };
}

describe("Airtable CRM write reliability", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("AIRTABLE_BASE_ID", "appMRnCvpFjFUlOyw");
    vi.stubEnv("AIRTABLE_API_KEY", "test-airtable-key");
    mocks.createClient.mockReturnValue(supabaseWithCustomerRow());
    vi.stubGlobal("fetch", mocks.fetch);
  });

  it("uses one atomic Airtable upsert keyed by Source submission ID", async () => {
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({
      records: [{ id: "recTestRecord" }],
      createdRecords: ["recTestRecord"],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const { syncAirtableSubmission } = await import("@/lib/airtable-sync");
    await syncAirtableSubmission({
      source: "customer_enquiry",
      sourceId: customerRow.id,
      sourceSubmissionId: customerRow.submission_token,
      isTestRecord: true,
    });

    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = mocks.fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.airtable.com/v0/appMRnCvpFjFUlOyw/tbl5dq4uV5D1slrUe");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toMatchObject({
      performUpsert: { fieldsToMergeOn: ["fldRP8toFgdJeCeVM"] },
      records: [{
        fields: {
          fldRP8toFgdJeCeVM: customerRow.submission_token,
          fld2fImnmsiTB08t9: "Maya Test",
          fldEN7U0OR9bF1e2s: true,
        },
      }],
      typecast: false,
    });
  });

  it("classifies Airtable rate limits as retryable", async () => {
    mocks.fetch.mockResolvedValue(new Response("rate limited", { status: 429 }));

    const { RetryableError } = await import("workflow");
    const { syncAirtableSubmission } = await import("@/lib/airtable-sync");
    await expect(syncAirtableSubmission({
      source: "customer_enquiry",
      sourceId: customerRow.id,
      sourceSubmissionId: customerRow.submission_token,
      isTestRecord: true,
    })).rejects.toBeInstanceOf(RetryableError);
  });
});
