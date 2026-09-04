import type { Tables } from "@/types/database";

export const taxonomyTypes = ["support_area", "approach", "modality", "works_with", "location", "language"] as const;
export type TaxonomyType = (typeof taxonomyTypes)[number];
export type TaxonomyWithUsage = Tables<"practitioner_terms"> & { usageCount: number };

const taxonomyLabels: Record<TaxonomyType, string> = {
  support_area: "Support area",
  approach: "Approach",
  modality: "Modality",
  works_with: "Works with",
  location: "Location",
  language: "Language",
};

export function taxonomyTypeLabel(type: string) {
  return taxonomyLabels[type as TaxonomyType] ?? type.replaceAll("_", " ");
}

export function taxonomyDeleteBlocker(term: Pick<TaxonomyWithUsage, "name" | "usageCount">) {
  if (term.usageCount === 0) return null;
  return {
    type: "Practitioner",
    name: `${term.usageCount} practitioner record${term.usageCount === 1 ? "" : "s"}`,
    href: `/admin/practitioners?filter.term=${encodeURIComponent(term.name.toLowerCase())}`,
    reason: "Remove the practitioner links before permanently deleting this term.",
  };
}

