import { describe, expect, it } from "vitest";
import { taxonomyTypes, taxonomyTypeLabel, taxonomyDeleteBlocker } from "@/lib/admin/taxonomy-cms";

describe("taxonomy CMS helpers", () => {
  it("keeps controlled taxonomy types explicit", () => {
    expect(taxonomyTypes).toEqual(["support_area", "approach", "modality", "works_with", "location", "language"]);
    expect(taxonomyTypeLabel("support_area")).toBe("Support area");
  });

  it("explains linked-term deletion blockers", () => {
    expect(taxonomyDeleteBlocker({ id: "00000000-0000-4000-8000-000000000001", name: "Bali", usageCount: 2 })).toEqual({
      type: "Practitioner",
      name: "2 practitioner records",
      href: "/admin/practitioners?filter.term=00000000-0000-4000-8000-000000000001",
      reason: "Remove the practitioner links before permanently deleting this term.",
    });
    expect(taxonomyDeleteBlocker({ id: "00000000-0000-4000-8000-000000000001", name: "Bali", usageCount: 0 })).toBeNull();
  });
});
