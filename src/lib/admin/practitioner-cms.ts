import type { Tables } from "@/types/database";
import type { PublicLifecycle, TaxonomyLifecycle } from "@/lib/admin/types";

export type PractitionerRow = Tables<"practitioners">;
export type TaxonomyRow = Tables<"practitioner_terms">;
export type PractitionerLinkRow = Tables<"practitioner_term_links">;

export const PORTRAIT_MAX_BYTES = 5 * 1024 * 1024;
export const PORTRAIT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getPractitionerLifecycle(row: Pick<PractitionerRow, "status" | "archived_at">): PublicLifecycle {
  if (row.archived_at || row.status === "archived") return "archived";
  return row.status === "published" ? "published" : "draft";
}

export function getTaxonomyLifecycle(row: Pick<TaxonomyRow, "is_active" | "archived_at">): TaxonomyLifecycle {
  if (row.archived_at) return "archived";
  return row.is_active ? "active" : "inactive";
}

export function getPortraitExtension(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export function validatePortraitFile(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return "Choose a portrait image before uploading.";
  if (!getPortraitExtension(file.type)) return "Portraits must be JPEG, PNG, or WebP files.";
  if (file.size > PORTRAIT_MAX_BYTES) return "Portraits must be 5 MB or smaller.";
  return null;
}

export function createPortraitPath(practitionerId: string, mime: string) {
  const ext = getPortraitExtension(mime) ?? "jpg";
  return `${practitionerId}/${crypto.randomUUID()}.${ext}`;
}

export function parseListField(value: FormDataEntryValue | string | null | undefined): string[] {
  if (typeof value !== "string") return [];
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

export function slugifyTerm(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function getFeaturedReadiness(count: number) {
  return { count, required: 8, ready: count === 8 };
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-NZ", { dateStyle: "medium" }).format(new Date(value));
}

export function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

