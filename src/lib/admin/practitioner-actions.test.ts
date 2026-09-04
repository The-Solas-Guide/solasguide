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
  deletePractitioner,
  reorderFeaturedPractitioners,
  savePractitioner,
} from "@/lib/admin/practitioner-actions";
import { featuredOrderIsCurrent, validatePractitionerFields } from "@/lib/admin/practitioner-cms";

const adminId = "00000000-0000-4000-8000-000000000001";
const termId = "00000000-0000-4000-8000-000000000002";

function form(fields: Record<string, string>, portrait?: File) {
  const value = new FormData();
  for (const [key, item] of Object.entries(fields)) value.set(key, item);
  if (portrait) value.set("portrait", portrait);
  return value;
}

describe("practitioner admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid publish fields before any mutation", () => {
    const value = form({ name: "", slug: "Bad Slug", summary: "", about: "", status: "published" });
    expect(validatePractitionerFields(value, "published", false, false)).toEqual({
      name: "Name is required.",
      slug: "Use lowercase words separated by hyphens.",
      summary: "Summary is required before publishing.",
      about: "About text is required before publishing.",
      image: "An approved portrait is required before publishing.",
      location: "At least one active location is required before publishing.",
    });
  });

  it("rejects a stale featured order without calling the RPC", async () => {
    const from = vi.fn(() => ({ select: vi.fn(() => ({ not: vi.fn(async () => ({ data: [{ id: adminId, status: "published", featured_position: 1 }], error: null })) })) }));
    const rpc = vi.fn();
    const schema = vi.fn(() => ({ rpc }));
    mocks.createClient.mockResolvedValue({ from, schema });
    const result = await reorderFeaturedPractitioners([termId]);
    expect(result).toEqual({ ok: false, error: "Featured ordering is stale. Refresh and try again." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses one atomic RPC for a valid featured order", async () => {
    const from = vi.fn(() => ({ select: vi.fn(() => ({ not: vi.fn(async () => ({ data: [{ id: adminId, status: "published", featured_position: 1 }, { id: termId, status: "published", featured_position: 2 }], error: null })) })) }));
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    const schema = vi.fn(() => ({ rpc }));
    mocks.createClient.mockResolvedValue({ from, schema });
    const result = await reorderFeaturedPractitioners([termId, adminId]);
    expect(result).toEqual({ ok: true });
    expect(schema).toHaveBeenCalledWith("admin_api");
    expect(rpc).toHaveBeenCalledWith("reorder_admin_featured", { p_practitioner_ids: [termId, adminId] });
  });

  it("returns a cleanup warning after replacing a portrait", async () => {
    const oldPath = `${adminId}/old.jpg`;
    const practitionerQuery = { eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: adminId, image_path: oldPath, featured_position: null }, error: null })) })) };
    const termQuery = { in: vi.fn(async () => ({ data: [{ id: termId, type: "location", is_active: true, archived_at: null }], error: null })) };
    const storage = { upload: vi.fn(async () => ({ error: null })), remove: vi.fn(async () => ({ error: { message: "object is locked" } })) };
    const rpc = vi.fn(async () => ({ data: adminId, error: null }));
    const schema = vi.fn(() => ({ rpc }));
    const supabase = {
      from: vi.fn((table: string) => table === "practitioners" ? { select: vi.fn(() => practitionerQuery) } : table === "practitioner_terms" ? { select: vi.fn(() => termQuery) } : { select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })) }),
      storage: { from: vi.fn(() => storage) },
      schema,
    };
    mocks.createClient.mockResolvedValue(supabase);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000003");
    const result = await savePractitioner(form({ id: adminId, name: "Updated practitioner", slug: "updated-practitioner", status: "draft", termIds: JSON.stringify([termId]), imageApproved: "on" }, new File([new Uint8Array([1])], "new.jpg", { type: "image/jpeg" })));
    expect(result.ok).toBe(true);
    expect(result.warning).toContain("previous image could not be removed");
    expect(schema).toHaveBeenCalledWith("admin_api");
    expect(rpc).toHaveBeenCalledWith("save_admin_practitioner", expect.objectContaining({ p_image_path: expect.stringMatching(new RegExp(`^${adminId}/[0-9a-f-]{36}\\.jpg$`)), p_term_ids: [termId] }));
    vi.restoreAllMocks();
  });

  it("deletes the newly uploaded object when the database save fails", async () => {
    const practitionerQuery = { eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: adminId, image_path: `${adminId}/old.jpg`, featured_position: null }, error: null })) })) };
    const termQuery = { in: vi.fn(async () => ({ data: [], error: null })) };
    const storage = { upload: vi.fn(async () => ({ error: null })), remove: vi.fn(async () => ({ error: null })) };
    const rpc = vi.fn(async () => ({ data: null, error: { message: "database rejected the update" } }));
    const schema = vi.fn(() => ({ rpc }));
    const supabase = {
      from: vi.fn((table: string) => table === "practitioners" ? { select: vi.fn(() => practitionerQuery) } : table === "practitioner_terms" ? { select: vi.fn(() => termQuery) } : { select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })) }),
      storage: { from: vi.fn(() => storage) },
      schema,
    };
    mocks.createClient.mockResolvedValue(supabase);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000004");
    const result = await savePractitioner(form({ id: adminId, name: "Updated practitioner", slug: "updated-practitioner", status: "draft", termIds: "[]", imageApproved: "on" }, new File([new Uint8Array([1])], "new.jpg", { type: "image/jpeg" })));
    expect(result.ok).toBe(false);
    expect(storage.remove).toHaveBeenCalledWith([`${adminId}/00000000-0000-4000-8000-000000000004.jpg`]);
    vi.restoreAllMocks();
  });

  it("cleans the portrait folder before deleting an archived practitioner", async () => {
    const clear = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { status: "archived", featured_position: null, image_path: `${adminId}/portrait.jpg` }, error: null })) })) })), update: vi.fn(() => ({ eq: clear })), delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) })),
      storage: { from: vi.fn(() => ({ list: vi.fn(async () => ({ data: [{ name: "portrait.jpg" }], error: null })), remove })) },
    };
    mocks.createClient.mockResolvedValue(supabase);
    const result = await deletePractitioner(adminId);
    expect(result).toEqual({ ok: true });
    expect(remove).toHaveBeenCalledWith([`${adminId}/portrait.jpg`]);
    expect(clear).toHaveBeenCalledWith("id", adminId);
  });

  it("compares featured IDs as a set for stale-order protection", () => {
    expect(featuredOrderIsCurrent([adminId, termId], [termId, adminId])).toBe(true);
    expect(featuredOrderIsCurrent([adminId], [adminId, termId])).toBe(false);
  });
});
