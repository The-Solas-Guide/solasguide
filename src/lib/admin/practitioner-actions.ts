"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createPortraitPath,
  parseListField,
  validatePortraitFile,
  type PractitionerLinkRow,
  type PractitionerRow,
  type TaxonomyRow,
} from "@/lib/admin/practitioner-cms";
import type { TablesInsert, TablesUpdate } from "@/types/database";

const practitionerSelect = "*";
const taxonomySelect = "*";

export type AdminActionResult<T = null> = {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
  warning?: string;
};

export type AdminPractitionerRecord = PractitionerRow & { terms: TaxonomyRow[] };
export type AdminTaxonomyRecord = TaxonomyRow & { usageCount: number };

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value || null;
}

function parseTermIds(formData: FormData) {
  const raw = stringValue(formData, "termIds");
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids)
      ? [...new Set(ids.filter((id): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)))]
      : [];
  } catch {
    return [];
  }
}

function numberValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function practitionerPayload(formData: FormData, imagePath?: string | null): TablesInsert<"practitioners"> {
  return {
    slug: stringValue(formData, "slug"),
    name: stringValue(formData, "name"),
    descriptor: optionalValue(formData, "descriptor"),
    years_active: numberValue(formData, "yearsActive"),
    summary: optionalValue(formData, "summary"),
    about: optionalValue(formData, "about"),
    credentials: parseListField(formData.get("credentials")),
    significant_training: parseListField(formData.get("significantTraining")),
    offers_in_person: formData.get("offersInPerson") === "on",
    offers_online: formData.get("offersOnline") === "on",
    website_url: optionalValue(formData, "websiteUrl"),
    instagram_url: optionalValue(formData, "instagramUrl"),
    image_path: imagePath,
    image_alt: optionalValue(formData, "imageAlt"),
    status: "draft",
  };
}

function validatePractitionerFields(formData: FormData, status: string, hasImage: boolean, hasLocation: boolean) {
  const fieldErrors: Record<string, string> = {};
  const name = stringValue(formData, "name");
  const slug = stringValue(formData, "slug");
  if (!name) fieldErrors.name = "Name is required.";
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fieldErrors.slug = "Use lowercase words separated by hyphens.";
  if (status === "published") {
    if (!stringValue(formData, "summary")) fieldErrors.summary = "Summary is required before publishing.";
    if (!stringValue(formData, "about")) fieldErrors.about = "About text is required before publishing.";
    if (!hasImage) fieldErrors.image = "An approved portrait is required before publishing.";
    if (!hasLocation) fieldErrors.location = "At least one active location is required before publishing.";
  }
  return fieldErrors;
}

async function loadTermsForPractitioners(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, rows: PractitionerRow[]) {
  if (!rows.length) return [] as AdminPractitionerRecord[];
  const { data: links, error: linksError } = await supabase.from("practitioner_term_links").select("*").in("practitioner_id", rows.map((row) => row.id));
  if (linksError) throw new Error(linksError.message);
  const typedLinks = (links ?? []) as PractitionerLinkRow[];
  if (typedLinks.length === 0) return rows.map((row) => ({ ...row, terms: [] }));
  const { data: terms, error: termsError } = await supabase.from("practitioner_terms").select(taxonomySelect).in("id", typedLinks.map((link) => link.term_id));
  if (termsError) throw new Error(termsError.message);
  const termMap = new Map((terms ?? []).map((term) => [term.id, term as TaxonomyRow]));
  const linksMap = new Map<string, TaxonomyRow[]>();
  for (const link of typedLinks) {
    const term = termMap.get(link.term_id);
    if (!term) continue;
    const current = linksMap.get(link.practitioner_id) ?? [];
    current.push(term);
    linksMap.set(link.practitioner_id, current);
  }
  return rows.map((row) => ({ ...row, terms: linksMap.get(row.id) ?? [] }));
}

export async function getAdminPractitioners(): Promise<AdminActionResult<AdminPractitionerRecord[]>> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("practitioners").select(practitionerSelect).order("updated_at", { ascending: false });
  if (error) return { ok: false, error: error.message };
  try {
    return { ok: true, data: await loadTermsForPractitioners(supabase, (data ?? []) as PractitionerRow[]) };
  } catch (loadError) {
    return { ok: false, error: loadError instanceof Error ? loadError.message : "Practitioners could not be loaded." };
  }
}

export async function getAdminPractitioner(id: string): Promise<AdminActionResult<AdminPractitionerRecord | null>> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "This practitioner ID is invalid." };
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("practitioners").select(practitionerSelect).eq("id", id).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: true, data: null };
  const records = await loadTermsForPractitioners(supabase, [data as PractitionerRow]);
  return { ok: true, data: records[0] ?? null };
}

async function uploadPortrait(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, practitionerId: string, file: File) {
  const path = createPortraitPath(practitionerId, file.type);
  const { error } = await supabase.storage.from("profile-images").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

async function removePortrait(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, path: string) {
  const { error } = await supabase.storage.from("profile-images").remove([path]);
  return error?.message;
}

export async function savePractitioner(formData: FormData): Promise<AdminActionResult<{ id: string }>> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const id = stringValue(formData, "id");
  const status = stringValue(formData, "status") || "draft";
  if (!["draft", "published", "archived"].includes(status)) return { ok: false, error: "Choose a valid practitioner status." };
  const existingResult = id ? await supabase.from("practitioners").select(practitionerSelect).eq("id", id).maybeSingle() : { data: null, error: null };
  if (existingResult.error) return { ok: false, error: existingResult.error.message };
  const existing = existingResult.data as PractitionerRow | null;
  if (id && !existing) return { ok: false, error: "That practitioner no longer exists." };

  const termIds = parseTermIds(formData);
  const { data: terms, error: termError } = termIds.length ? await supabase.from("practitioner_terms").select("id,type,is_active,archived_at").in("id", termIds) : { data: [], error: null };
  if (termError) return { ok: false, error: termError.message };
  const validTerms = (terms ?? []) as Pick<TaxonomyRow, "id" | "type" | "is_active" | "archived_at">[];
  if (validTerms.length !== termIds.length) return { ok: false, error: "One or more selected taxonomy terms no longer exist." };
  const hasLocation = validTerms.some((term) => term.type === "location" && term.is_active && !term.archived_at);
  const fileEntry = formData.get("portrait");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  const portraitError = file ? validatePortraitFile(file) : null;
  if (portraitError) return { ok: false, fieldErrors: { image: portraitError } };
  if (file && formData.get("imageApproved") !== "on") return { ok: false, fieldErrors: { image: "Confirm that this portrait is approved before uploading." } };
  const fieldErrors = validatePractitionerFields(formData, status, Boolean(file || existing?.image_path), hasLocation);
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  let practitionerId = existing?.id;
  let created = false;
  let newPath: string | null = null;
  const oldPath: string | null = existing?.image_path ?? null;
  try {
    if (!practitionerId) {
      const { data, error } = await supabase.from("practitioners").insert(practitionerPayload(formData)).select("id").single();
      if (error || !data) throw new Error(error?.message ?? "The practitioner could not be created.");
      practitionerId = data.id;
      created = true;
    }
    if (!practitionerId) throw new Error("The practitioner ID is missing.");
    if (file) newPath = await uploadPortrait(supabase, practitionerId, file);

    const currentLinksResult = await supabase.from("practitioner_term_links").select("*").eq("practitioner_id", practitionerId);
    if (currentLinksResult.error) throw new Error(currentLinksResult.error.message);
    const currentLinks = (currentLinksResult.data ?? []) as PractitionerLinkRow[];
    const currentIds = new Set(currentLinks.map((link) => link.term_id));
    const linksToAdd = termIds.filter((termId) => !currentIds.has(termId)).map((termId, index) => ({ practitioner_id: practitionerId as string, term_id: termId, display_order: index }));
    if (linksToAdd.length) {
      const { error } = await supabase.from("practitioner_term_links").insert(linksToAdd);
      if (error) throw new Error(error.message);
    }

    const update: TablesUpdate<"practitioners"> = {
      ...practitionerPayload(formData, newPath ?? oldPath),
      status,
      image_path: newPath ?? oldPath,
    };
    const { error: updateError } = await supabase.from("practitioners").update(update).eq("id", practitionerId);
    if (updateError) throw new Error(updateError.message);
    const linksToRemove = currentLinks.filter((link) => !termIds.includes(link.term_id)).map((link) => link.term_id);
    if (linksToRemove.length) {
      const { error } = await supabase.from("practitioner_term_links").delete().eq("practitioner_id", practitionerId).in("term_id", linksToRemove);
      if (error) throw new Error(error.message);
    }

    let warning: string | undefined;
    if (newPath && oldPath && oldPath !== newPath) {
      const cleanupError = await removePortrait(supabase, oldPath);
      if (cleanupError) warning = `Saved the new portrait, but the previous image could not be removed: ${cleanupError}`;
    }
    revalidatePath("/admin/practitioners");
    revalidatePath(`/admin/practitioners/${practitionerId}`);
    revalidatePath("/practitioners");
    return { ok: true, data: { id: practitionerId }, warning };
  } catch (error) {
    if (newPath) await removePortrait(supabase, newPath);
    if (created && practitionerId) await supabase.from("practitioners").delete().eq("id", practitionerId);
    return { ok: false, error: error instanceof Error ? error.message : "The practitioner could not be saved." };
  }
}

export async function archivePractitioner(id: string, restore = false): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const update: TablesUpdate<"practitioners"> = restore ? { status: "draft", archived_at: null } : { status: "archived", featured_position: null };
  const { error } = await supabase.from("practitioners").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/practitioners");
  revalidatePath(`/admin/practitioners/${id}`);
  revalidatePath("/practitioners");
  return { ok: true };
}

export async function setPractitionerFeaturedPosition(id: string, position: number | null): Promise<AdminActionResult> {
  await requireAdmin();
  if (position !== null && (!Number.isInteger(position) || position < 1 || position > 8)) return { ok: false, error: "Featured positions run from 1 to 8." };
  const supabase = await createServerSupabaseClient();
  const { data: row, error: loadError } = await supabase.from("practitioners").select("status").eq("id", id).maybeSingle();
  if (loadError || !row) return { ok: false, error: loadError?.message ?? "The practitioner no longer exists." };
  if (position !== null && row.status !== "published") return { ok: false, error: "Only published practitioners can be featured." };
  const { error } = await supabase.from("practitioners").update({ featured_position: position }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/practitioners");
  revalidatePath("/practitioners");
  return { ok: true };
}

export async function reorderFeaturedPractitioners(ids: string[]): Promise<AdminActionResult> {
  await requireAdmin();
  const orderedIds = [...new Set(ids)].slice(0, 8);
  const supabase = await createServerSupabaseClient();
  const { data: rows, error: loadError } = await supabase.from("practitioners").select("id,status").in("id", orderedIds);
  if (loadError) return { ok: false, error: loadError.message };
  if ((rows ?? []).some((row) => row.status !== "published")) return { ok: false, error: "Only published practitioners can be featured." };
  if (orderedIds.length) {
    const { error: clearError } = await supabase.from("practitioners").update({ featured_position: null }).in("id", orderedIds);
    if (clearError) return { ok: false, error: clearError.message };
    for (const [index, practitionerId] of orderedIds.entries()) {
      const { error } = await supabase.from("practitioners").update({ featured_position: index + 1 }).eq("id", practitionerId);
      if (error) return { ok: false, error: error.message };
    }
  }
  revalidatePath("/admin/practitioners");
  revalidatePath("/practitioners");
  return { ok: true };
}

export async function deletePractitioner(id: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data: row, error: loadError } = await supabase.from("practitioners").select("status,featured_position,image_path").eq("id", id).maybeSingle();
  if (loadError || !row) return { ok: false, error: loadError?.message ?? "The practitioner no longer exists." };
  if (row.status !== "archived") return { ok: false, error: "Archive the practitioner before permanently deleting it." };
  if (row.featured_position !== null) return { ok: false, error: "Remove the practitioner from Featured before permanently deleting it." };
  // Cleanup is deliberately attempted through Storage before clearing the
  // database path. Browser code never receives a service-role client.
  const paths = row.image_path ? [row.image_path] : [];
  const { data: storedObjects, error: listError } = await supabase.storage.from("profile-images").list(id, { limit: 100 });
  if (listError) return { ok: false, error: `Portrait cleanup could not be checked: ${listError.message}` };
  for (const object of storedObjects ?? []) {
    if (object.name) paths.push(`${id}/${object.name}`);
  }
  if (paths.length) {
    const { error: removeError } = await supabase.storage.from("profile-images").remove([...new Set(paths)]);
    if (removeError) return { ok: false, error: `Portrait cleanup failed. Nothing was deleted: ${removeError.message}` };
  }
  if (row.image_path) {
    const { error: clearError } = await supabase.from("practitioners").update({ image_path: null }).eq("id", id);
    if (clearError) return { ok: false, error: `The portrait was removed, but the practitioner could not be deleted: ${clearError.message}` };
  }
  const { error } = await supabase.from("practitioners").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/practitioners");
  return { ok: true };
}
