import { describe, expect, it } from "vitest";
import {
  getPractitionerLifecycle,
  getTaxonomyLifecycle,
  getPortraitExtension,
  validatePortraitFile,
  createPortraitPath,
  parseListField,
  slugifyTerm,
  getFeaturedReadiness,
} from "@/lib/admin/practitioner-cms";

describe("admin practitioner and taxonomy helpers", () => {
  it("maps practitioner lifecycle states", () => {
    expect(getPractitionerLifecycle({ status: "draft", archived_at: null })).toBe("draft");
    expect(getPractitionerLifecycle({ status: "published", archived_at: null })).toBe("published");
    expect(getPractitionerLifecycle({ status: "archived", archived_at: "2026-09-04T00:00:00Z" })).toBe("archived");
  });

  it("maps taxonomy lifecycle states and restores archived terms to inactive", () => {
    expect(getTaxonomyLifecycle({ is_active: true, archived_at: null })).toBe("active");
    expect(getTaxonomyLifecycle({ is_active: false, archived_at: null })).toBe("inactive");
    expect(getTaxonomyLifecycle({ is_active: true, archived_at: "2026-09-04T00:00:00Z" })).toBe("archived");
  });

  it("validates portrait files before upload", () => {
    expect(getPortraitExtension("image/jpeg")).toBe("jpg");
    expect(getPortraitExtension("image/png")).toBe("png");
    expect(getPortraitExtension("image/webp")).toBe("webp");
    expect(validatePortraitFile(new File([new Uint8Array(5)], "portrait.gif", { type: "image/gif" }))).toContain("JPEG");
    expect(validatePortraitFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "portrait.jpg", { type: "image/jpeg" }))).toContain("5 MB");
    expect(validatePortraitFile(new File([new Uint8Array(5)], "portrait.jpg", { type: "image/jpeg" }))).toBeNull();
  });

  it("creates random practitioner-owned portrait paths", () => {
    const path = createPortraitPath("00000000-0000-0000-0000-000000000001", "image/jpeg");
    expect(path).toMatch(/^00000000-0000-0000-0000-000000000001\/[0-9a-f-]{36}\.jpg$/);
  });

  it("normalizes list fields and term slugs", () => {
    expect(parseListField(" Yoga, breathwork\nYoga ")).toEqual(["Yoga", "breathwork"]);
    expect(slugifyTerm("Women's Wellbeing & Care")).toBe("womens-wellbeing-and-care");
  });

  it("reports initial featured readiness without requiring eight records", () => {
    expect(getFeaturedReadiness(3)).toEqual({ count: 3, required: 8, ready: false });
    expect(getFeaturedReadiness(8)).toEqual({ count: 8, required: 8, ready: true });
  });
});
