"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugifyTerm, type TaxonomyRow } from "@/lib/admin/practitioner-cms";
import { taxonomyTypes, type TaxonomyType } from "@/lib/admin/taxonomy-cms";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import type { AdminActionResult, AdminTaxonomyRecord } from "@/lib/admin/practitioner-actions";

export type { AdminTaxonomyRecord } from "@/lib/admin/practitioner-actions";

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function validType(input: string): input is TaxonomyType {
  return taxonomyTypes.includes(input as TaxonomyType);
}

export async function getAdminTaxonomy(): Promise<AdminActionResult<AdminTaxonomyRecord[]>> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const [{ data: terms, error: termError }, { data: links, error: linkError }] = await Promise.all([
    supabase.from("practitioner_terms").select("*").order("type").order("sort_order").order("name"),
    supabase.from("practitioner_term_links").select("term_id,practitioner_id"),
  ]);
  if (termError) return { ok: false, error: termError.message };
  if (linkError) return { ok: false, error: linkError.message };
  const counts = new Map<string, number>();
  for (const link of links ?? []) counts.set(link.term_id, (counts.get(link.term_id) ?? 0) + 1);
  return { ok: true, data: (terms ?? []).map((term) => ({ ...(term as TaxonomyRow), usageCount: counts.get(term.id) ?? 0 })) };
}

export async function saveTaxonomy(formData: FormData): Promise<AdminActionResult<{ id: string }>> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const id = value(formData, "id");
  const type = value(formData, "type");
  const name = value(formData, "name");
  const slug = value(formData, "slug") || slugifyTerm(name);
  const state = value(formData, "state") || "active";
  if (!validType(type)) return { ok: false, fieldErrors: { type: "Choose a valid taxonomy type." } };
  if (!name) return { ok: false, fieldErrors: { name: "Name is required." } };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, fieldErrors: { slug: "Use lowercase words separated by hyphens." } };
  if (!["active", "inactive", "archived"].includes(state)) return { ok: false, error: "Choose a valid taxonomy state." };
  const isActive = state === "active";
  const payload = { type, name, slug, sort_order: Number(value(formData, "sortOrder")) || 0, is_active: isActive, archived_at: state === "archived" ? new Date().toISOString() : null };
  let result;
  if (id) {
    const update: TablesUpdate<"practitioner_terms"> = payload;
    result = await supabase.from("practitioner_terms").update(update).eq("id", id).select("id").single();
  } else {
    const insert: TablesInsert<"practitioner_terms"> = payload;
    result = await supabase.from("practitioner_terms").insert(insert).select("id").single();
  }
  if (result.error || !result.data) return { ok: false, error: result.error?.message ?? "The taxonomy term could not be saved." };
  revalidatePath("/admin/taxonomy");
  revalidatePath("/admin/practitioners");
  revalidatePath("/practitioners");
  return { ok: true, data: { id: result.data.id } };
}

export async function archiveTaxonomy(id: string, restore = false): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const update: TablesUpdate<"practitioner_terms"> = restore ? { archived_at: null, is_active: false } : { archived_at: new Date().toISOString(), is_active: false };
  const { error } = await supabase.from("practitioner_terms").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/taxonomy");
  revalidatePath("/admin/practitioners");
  revalidatePath("/practitioners");
  return { ok: true };
}

export async function deleteTaxonomy(id: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data: term, error: loadError } = await supabase.from("practitioner_terms").select("id,archived_at").eq("id", id).maybeSingle();
  if (loadError || !term) return { ok: false, error: loadError?.message ?? "The taxonomy term no longer exists." };
  if (!term.archived_at) return { ok: false, error: "Archive the taxonomy term before permanently deleting it." };
  const { count, error: countError } = await supabase.from("practitioner_term_links").select("term_id", { count: "exact", head: true }).eq("term_id", id);
  if (countError) return { ok: false, error: countError.message };
  if ((count ?? 0) > 0) return { ok: false, error: "This term is still linked to practitioner records. Remove those links first." };
  const { error } = await supabase.from("practitioner_terms").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/taxonomy");
  return { ok: true };
}
