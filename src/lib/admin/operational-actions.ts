"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  isOperationalKind,
  operationalConfig,
  operationalRoute,
  type OperationalKind,
  type OperationalRecord,
} from "@/lib/admin/operational-cms";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/lib/admin/practitioner-actions";
import type { Json, TablesInsert, TablesUpdate } from "@/types/database";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONTACT_PREFERENCES = ["email", "phone", "whatsapp"] as const;

type ContactPreference = (typeof CONTACT_PREFERENCES)[number];

function value(formData: FormData, name: string) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry.trim() : "";
}

function has(formData: FormData, name: string) {
  return formData.has(name);
}

function optionalValue(formData: FormData, name: string) {
  const entry = value(formData, name);
  return entry || null;
}

function isUuid(valueToCheck: string) {
  return UUID_PATTERN.test(valueToCheck);
}

function isEmail(valueToCheck: string) {
  return valueToCheck.length >= 3 && valueToCheck.length <= 320 && /^\S+@\S+\.\S+$/.test(valueToCheck);
}

function parseConsent(formData: FormData) {
  const entry = formData.get("consent_confirmed");
  return entry === "on" || entry === "true";
}

function parseConsentTime(formData: FormData) {
  const raw = value(formData, "consent_given_at");
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now()) return null;
  return date.toISOString();
}

function parseAnswers(formData: FormData): { value?: Json; error?: string } {
  const raw = value(formData, "questionnaire_answers");
  if (!raw) return { value: {} };
  if (new TextEncoder().encode(raw).byteLength > 32_768) {
    return { error: "Questionnaire answers must be 32 KB or smaller." };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "Questionnaire answers must be a JSON object." };
    }
    return { value: parsed as Json };
  } catch {
    return { error: "Questionnaire answers must be valid JSON." };
  }
}

function statusIsValid(kind: OperationalKind, status: string) {
  return operationalConfig(kind).statuses.includes(status as never);
}

function validateCreate(kind: OperationalKind, formData: FormData) {
  const fieldErrors: Record<string, string> = {};
  const fullName = value(formData, "full_name");
  const email = value(formData, "email");
  const contactPreference = value(formData, "contact_preference") || "email";
  const phone = value(formData, "phone");
  const consentGivenAt = parseConsentTime(formData);
  const answers = parseAnswers(formData);
  const status = value(formData, "status") || operationalConfig(kind).statuses[0];

  if (!fullName || fullName.length > 200) fieldErrors.full_name = "Enter a name up to 200 characters.";
  if (!isEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!CONTACT_PREFERENCES.includes(contactPreference as ContactPreference)) {
    fieldErrors.contact_preference = "Choose a valid contact preference.";
  }
  if (phone.length > 50) fieldErrors.phone = "Enter a phone number up to 50 characters.";
  if ((contactPreference === "phone" || contactPreference === "whatsapp") && !phone) {
    fieldErrors.phone = "Add a phone number for this contact preference.";
  }
  if (!parseConsent(formData)) fieldErrors.consent_confirmed = "Confirm consent before saving this record.";
  if (!consentGivenAt) fieldErrors.consent_given_at = "Add the time consent was given.";
  if (answers.error) fieldErrors.questionnaire_answers = answers.error;
  if (!statusIsValid(kind, status)) fieldErrors.status = "Choose a valid workflow status.";
  if (value(formData, "internal_notes").length > 20_000) fieldErrors.internal_notes = "Internal notes must be 20,000 characters or fewer.";

  if (kind === "practitioner-interest") {
    for (const field of ["practice_name", "location"]) {
      const fieldValue = value(formData, field);
      if (fieldValue.length > 200) fieldErrors[field] = `Enter ${field.replace("_", " ")} up to 200 characters.`;
    }
    const websiteUrl = value(formData, "website_url");
    if (websiteUrl.length > 2048) fieldErrors.website_url = "Enter a website up to 2048 characters.";
  }

  return {
    fieldErrors,
    fullName,
    email,
    contactPreference: contactPreference as ContactPreference,
    phone: phone || null,
    consentGivenAt,
    answers: answers.value ?? {},
    status,
  };
}

function invalidIdResult(): AdminActionResult<never> {
  return { ok: false, fieldErrors: { id: "This record ID is invalid." } };
}

function recordMissingResult(): AdminActionResult<never> {
  return { ok: false, error: "That operational record no longer exists." };
}

function revalidateOperational(kind: OperationalKind, id?: string) {
  const route = operationalRoute(kind);
  revalidatePath(route);
  if (id) revalidatePath(`${route}/${id}`);
}

export async function getOperationalRecords(kind: OperationalKind): Promise<AdminActionResult<OperationalRecord[]>> {
  await requireAdmin();
  if (!isOperationalKind(kind)) return { ok: false, error: "This operational record type is invalid." };
  const supabase = await createServerSupabaseClient();
  const config = operationalConfig(kind);
  const records: OperationalRecord[] = [];
  const pageSize = 1_000;
  for (let offset = 0; ; offset += pageSize) {
    const result = await supabase.from(config.table).select("*").order("created_at", { ascending: false }).order("id", { ascending: true }).range(offset, offset + pageSize - 1);
    if (result.error) return { ok: false, error: result.error.message };
    records.push(...((result.data ?? []) as OperationalRecord[]));
    if ((result.data ?? []).length < pageSize) break;
  }
  return { ok: true, data: records };
}

export async function getOperationalRecord(kind: OperationalKind, id: string): Promise<AdminActionResult<OperationalRecord | null>> {
  await requireAdmin();
  if (!isOperationalKind(kind)) return { ok: false, error: "This operational record type is invalid." };
  if (!isUuid(id)) return invalidIdResult();
  const supabase = await createServerSupabaseClient();
  const result = await supabase.from(operationalConfig(kind).table).select("*").eq("id", id).maybeSingle();
  if (result.error) return { ok: false, error: result.error.message };
  return { ok: true, data: (result.data as OperationalRecord | null) ?? null };
}

async function saveCustomerEnquiry(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  id: string,
  formData: FormData,
): Promise<AdminActionResult<{ id: string }>> {
  if (id) {
    if (!isUuid(id)) return invalidIdResult();
    const existing = await supabase.from("customer_enquiries").select("id,status,internal_notes").eq("id", id).maybeSingle();
    if (existing.error) return { ok: false, error: existing.error.message };
    if (!existing.data) return recordMissingResult();
    const update: TablesUpdate<"customer_enquiries"> = {};
    if (has(formData, "status")) {
      const status = value(formData, "status");
      if (!statusIsValid("customer-enquiries", status)) return { ok: false, fieldErrors: { status: "Choose a valid workflow status." } };
      update.status = status;
    }
    if (has(formData, "internal_notes")) {
      const notes = value(formData, "internal_notes");
      if (notes.length > 20_000) return { ok: false, fieldErrors: { internal_notes: "Internal notes must be 20,000 characters or fewer." } };
      update.internal_notes = notes || null;
    }
    if (!Object.keys(update).length) return { ok: true, data: { id } };
    const result = await supabase.from("customer_enquiries").update(update).eq("id", id).select("id").maybeSingle();
    if (result.error || !result.data) return { ok: false, error: result.error?.message ?? "The customer enquiry could not be saved." };
    return { ok: true, data: { id: result.data.id } };
  }

  const parsed = validateCreate("customer-enquiries", formData);
  if (Object.keys(parsed.fieldErrors).length) return { ok: false, fieldErrors: parsed.fieldErrors };
  const insert: TablesInsert<"customer_enquiries"> = {
    full_name: parsed.fullName,
    email: parsed.email,
    phone: parsed.phone,
    contact_preference: parsed.contactPreference,
    consent_confirmed: true,
    consent_given_at: parsed.consentGivenAt as string,
    questionnaire_answers: parsed.answers,
    source: "admin",
    status: parsed.status,
    internal_notes: optionalValue(formData, "internal_notes"),
  };
  const result = await supabase.from("customer_enquiries").insert(insert).select("id").single();
  if (result.error || !result.data) return { ok: false, error: result.error?.message ?? "The customer enquiry could not be created." };
  return { ok: true, data: { id: result.data.id } };
}

async function savePractitionerInterest(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  id: string,
  formData: FormData,
): Promise<AdminActionResult<{ id: string }>> {
  if (id) {
    if (!isUuid(id)) return invalidIdResult();
    const existing = await supabase.from("practitioner_expressions_of_interest").select("id,status,internal_notes").eq("id", id).maybeSingle();
    if (existing.error) return { ok: false, error: existing.error.message };
    if (!existing.data) return recordMissingResult();
    const update: TablesUpdate<"practitioner_expressions_of_interest"> = {};
    if (has(formData, "status")) {
      const status = value(formData, "status");
      if (!statusIsValid("practitioner-interest", status)) return { ok: false, fieldErrors: { status: "Choose a valid workflow status." } };
      update.status = status;
    }
    if (has(formData, "internal_notes")) {
      const notes = value(formData, "internal_notes");
      if (notes.length > 20_000) return { ok: false, fieldErrors: { internal_notes: "Internal notes must be 20,000 characters or fewer." } };
      update.internal_notes = notes || null;
    }
    if (!Object.keys(update).length) return { ok: true, data: { id } };
    const result = await supabase.from("practitioner_expressions_of_interest").update(update).eq("id", id).select("id").maybeSingle();
    if (result.error || !result.data) return { ok: false, error: result.error?.message ?? "The practitioner interest record could not be saved." };
    return { ok: true, data: { id: result.data.id } };
  }

  const parsed = validateCreate("practitioner-interest", formData);
  if (Object.keys(parsed.fieldErrors).length) return { ok: false, fieldErrors: parsed.fieldErrors };
  const insert: TablesInsert<"practitioner_expressions_of_interest"> = {
    full_name: parsed.fullName,
    email: parsed.email,
    phone: parsed.phone,
    contact_preference: parsed.contactPreference,
    practice_name: optionalValue(formData, "practice_name"),
    location: optionalValue(formData, "location"),
    website_url: optionalValue(formData, "website_url"),
    consent_confirmed: true,
    consent_given_at: parsed.consentGivenAt as string,
    questionnaire_answers: parsed.answers,
    source: "admin",
    status: parsed.status,
    internal_notes: optionalValue(formData, "internal_notes"),
  };
  const result = await supabase.from("practitioner_expressions_of_interest").insert(insert).select("id").single();
  if (result.error || !result.data) return { ok: false, error: result.error?.message ?? "The practitioner interest record could not be created." };
  return { ok: true, data: { id: result.data.id } };
}

export async function saveOperationalRecord(kind: OperationalKind, formData: FormData): Promise<AdminActionResult<{ id: string }>> {
  await requireAdmin();
  if (!isOperationalKind(kind)) return { ok: false, error: "This operational record type is invalid." };
  const id = value(formData, "id");
  if (id && !isUuid(id)) return invalidIdResult();
  const supabase = await createServerSupabaseClient();
  const result = kind === "customer-enquiries"
    ? await saveCustomerEnquiry(supabase, id, formData)
    : await savePractitionerInterest(supabase, id, formData);
  if (result.ok && result.data) revalidateOperational(kind, result.data.id);
  return result;
}

export async function setOperationalArchive(kind: OperationalKind, id: string, archive: boolean): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isOperationalKind(kind)) return { ok: false, error: "This operational record type is invalid." };
  if (typeof archive !== "boolean") return { ok: false, error: "Choose a valid archive state." };
  if (!isUuid(id)) return invalidIdResult();
  const supabase = await createServerSupabaseClient();
  const table = operationalConfig(kind).table;
  const result = await supabase.from(table).update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", id).select("id").maybeSingle();
  if (result.error) return { ok: false, error: result.error.message };
  if (!result.data) return recordMissingResult();
  revalidateOperational(kind, id);
  return { ok: true };
}
