import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { FatalError, RetryableError, getStepMetadata } from "workflow";
import type { Database, Json } from "@/types/database";

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const MAX_AIRTABLE_RETRIES = 5;

const AIRTABLE = {
  customer_enquiry: {
    tableId: "tbl5dq4uV5D1slrUe",
    sourceName: "Website enquiry",
  },
  practitioner_expression: {
    tableId: "tbl90Q1NoiAnbEI6c",
    sourceName: "Website application",
  },
} as const;

export type AirtableSyncEvent = {
  id: string;
  source: "customer_enquiry" | "practitioner_expression";
  sourceId: string;
  sourceSubmissionId: string;
  isTestRecord: boolean;
  operation: "upsert" | "delete";
};

export type AirtableSubmission = Pick<
  AirtableSyncEvent,
  "source" | "sourceId" | "sourceSubmissionId" | "isTestRecord"
>;

type ClaimedSyncEvent = Omit<AirtableSyncEvent, "id"> & {
  claimed: boolean;
  currentStatus: "pending" | "processing" | "succeeded" | "failed";
};
type AirtableRecord = { id: string };
type AirtableResponse = { records?: AirtableRecord[] };

function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new FatalError("supabase_configuration_missing");
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function isRecord(value: Json | null): value is Record<string, Json | undefined> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function answerString(answers: Json, key: string): string | undefined {
  if (!isRecord(answers)) return undefined;
  const value = answers[key];
  return typeof value === "string" && value ? value : undefined;
}

function answerStrings(answers: Json, key: string): string[] | undefined {
  if (!isRecord(answers) || !Array.isArray(answers[key])) return undefined;
  const values = answers[key].filter((value): value is string => typeof value === "string");
  return values.length > 0 ? values : undefined;
}

function label(value: string | undefined, labels: Record<string, string>): string | undefined {
  return value ? labels[value] : undefined;
}

function contactPreference(value: string) {
  return label(value, { email: "Email", phone: "Phone", whatsapp: "WhatsApp" });
}

function customerFields(row: Database["public"]["Tables"]["customer_enquiries"]["Row"], isTestRecord: boolean) {
  const answers = row.questionnaire_answers;
  const groupSize = answerString(answers, "groupSize");
  const groupSizeNumber = groupSize && /^\d+$/.test(groupSize) ? Number(groupSize) : undefined;
  return compactFields({
    Enquiry: row.full_name,
    "Source submission ID": row.submission_token,
    "Submitted at": row.created_at,
    Source: AIRTABLE.customer_enquiry.sourceName,
    Email: row.email,
    Phone: row.phone ?? undefined,
    "Contact preference": contactPreference(row.contact_preference),
    "Contact basis": row.consent_confirmed ? "Inbound response consent" : undefined,
    "Enquiry type": label(answerString(answers, "primaryNeed"), {
      practitioner: "Find a practitioner",
      venue: "Find a venue",
      experience: "Find an experience",
      event: "Plan an event",
    }),
    Outcomes: answerStrings(answers, "outcomes")?.map((item) => label(item, {
      "rest-reset": "Rest/reset",
      "physical-wellbeing": "Physical wellbeing",
      "personal-support": "Personal support",
      "local-practices": "Local practices",
      connection: "Connection",
      "retreat-team": "Retreat/team",
      exploring: "Exploring",
    }) ?? item).filter(Boolean),
    "Additional needs": answerStrings(answers, "extras")?.map((item) => label(item, {
      practitioner: "Practitioner",
      venue: "Venue",
      experience: "Experience",
      event: "Event",
    }) ?? item).filter(Boolean),
    Timing: label(answerString(answers, "timing"), {
      "dates-known": "Dates known",
      month: "Month",
      season: "Season",
      later: "Later",
      planning: "Planning",
    }),
    Location: label(answerString(answers, "location"), {
      ubud: "Ubud",
      canggu: "Canggu",
      south: "South Bali",
      "east-north": "East/North Bali",
      moving: "Moving",
      undecided: "Undecided",
    }),
    "Location detail": answerString(answers, "locationDetail"),
    Group: label(answerString(answers, "group"), {
      solo: "Solo",
      pair: "Pair",
      "small-group": "Small group",
      retreat: "Retreat",
      business: "Business",
      unsure: "Unsure",
    }),
    "Group size": groupSizeNumber,
    Organisation: answerString(answers, "organizationName"),
    Practices: answerStrings(answers, "modalities")?.map((item) => label(item, {
      yoga: "Yoga",
      breathwork: "Breathwork",
      meditation: "Meditation",
      "sound-practice": "Sound practice",
      bodywork: "Bodywork",
      movement: "Movement",
      "balinese-practices": "Balinese practices",
      "retreat-facilitation": "Retreat facilitation",
    }) ?? item).filter(Boolean),
    Budget: label(answerString(answers, "budget"), {
      considered: "Considered",
      flexible: "Flexible",
      substantial: "Substantial",
      unsure: "Unsure",
      discuss: "Discuss",
    }),
    "Additional context": answerString(answers, "notes"),
    "Test Record": isTestRecord,
  });
}

function practitionerFields(row: Database["public"]["Tables"]["practitioner_expressions_of_interest"]["Row"], isTestRecord: boolean) {
  const answers = row.questionnaire_answers;
  return compactFields({
    Practitioner: row.full_name,
    "Source submission ID": row.submission_token,
    Source: AIRTABLE.practitioner_expression.sourceName,
    Email: row.email,
    Phone: row.phone ?? undefined,
    "Contact preference": contactPreference(row.contact_preference),
    "Contact basis": row.consent_confirmed ? "Inbound response consent" : undefined,
    "Practice name": row.practice_name ?? undefined,
    "Professional role": answerString(answers, "professionalRole"),
    "Bali relationship": label(answerString(answers, "baliRelationship"), {
      "based-in-bali": "Based in Bali",
      "works-in-bali-regularly": "Works in Bali regularly",
    }),
    Area: label(answerString(answers, "area"), {
      ubud: "Ubud",
      "canggu-seminyak": "Canggu/Seminyak",
      "south-bali": "South Bali",
      "east-north-bali": "East/North Bali",
      "elsewhere-bali": "Elsewhere Bali",
    }),
    "Location detail": answerString(answers, "locationDetail"),
    "Practice areas": answerStrings(answers, "practiceAreas")?.map((item) => label(item, {
      yoga: "Yoga",
      breathwork: "Breathwork",
      meditation: "Meditation",
      "sound-practice": "Sound practice",
      bodywork: "Bodywork",
      movement: "Movement",
      "balinese-practices": "Balinese practices",
      "retreat-facilitation": "Retreat facilitation",
      other: "Other",
    }) ?? item).filter(Boolean),
    "Other practice": answerString(answers, "otherPractice"),
    "Experience summary": answerString(answers, "experienceSummary"),
    "Website URL": row.website_url ?? undefined,
    "Additional links": answerStrings(answers, "additionalLinks")?.join("\n"),
    "Test Record": isTestRecord,
  });
}

export const mapCustomerEnquiryToAirtableFields = customerFields;
export const mapPractitionerExpressionToAirtableFields = practitionerFields;

function compactFields(fields: Record<string, string | number | boolean | string[] | undefined>): Record<string, string | number | boolean | string[]> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as Record<string, string | number | boolean | string[]>;
}

function requireAirtableConfiguration() {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) throw new FatalError("airtable_configuration_missing");
  return { baseId: AIRTABLE_BASE_ID, apiKey: AIRTABLE_API_KEY };
}

function sourceTable(source: AirtableSyncEvent["source"]) {
  return AIRTABLE[source];
}

function airtableUrl(tableId: string, suffix = "") {
  const { baseId } = requireAirtableConfiguration();
  return `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}${suffix}`;
}

async function airtableRequest(url: string, init: RequestInit) {
  const { apiKey } = requireAirtableConfiguration();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.ok) return response;

  if (response.status === 429 || response.status >= 500) {
    const { attempt } = getStepMetadata();
    throw new RetryableError("airtable_transient_failure", { retryAfter: Math.min(60_000, (attempt + 1) ** 2 * 2_000) });
  }

  throw new FatalError(`airtable_http_${response.status}`);
}

function sourceSubmissionFormula(sourceSubmissionId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(sourceSubmissionId)) {
    throw new FatalError("invalid_source_submission_id");
  }
  return `({Source submission ID} = '${sourceSubmissionId}')`;
}

async function findAirtableRecords(source: AirtableSyncEvent["source"], sourceSubmissionId: string) {
  const params = new URLSearchParams({
    filterByFormula: sourceSubmissionFormula(sourceSubmissionId),
    maxRecords: "2",
  });
  const response = await airtableRequest(`${airtableUrl(sourceTable(source).tableId)}?${params.toString()}`, { method: "GET" });
  const payload = await response.json() as AirtableResponse;
  return payload.records ?? [];
}

async function loadFields(event: AirtableSyncEvent) {
  const supabase = createAdminClient();
  if (event.source === "customer_enquiry") {
    const result = await supabase.from("customer_enquiries").select("*").eq("id", event.sourceId).maybeSingle();
    if (result.error) throw new RetryableError("supabase_source_read_failed", { retryAfter: "30s" });
    return result.data ? customerFields(result.data, event.isTestRecord) : null;
  }

  const result = await supabase.from("practitioner_expressions_of_interest").select("*").eq("id", event.sourceId).maybeSingle();
  if (result.error) throw new RetryableError("supabase_source_read_failed", { retryAfter: "30s" });
  return result.data ? practitionerFields(result.data, event.isTestRecord) : null;
}

async function upsertAirtableRecord(event: AirtableSyncEvent, fields: Record<string, string | number | boolean | string[]>) {
  const records = await findAirtableRecords(event.source, event.sourceSubmissionId);
  if (records.length > 1) throw new FatalError("duplicate_airtable_source_submission_id");

  const tableId = sourceTable(event.source).tableId;
  if (records.length === 1) {
    await airtableRequest(airtableUrl(tableId, `/${encodeURIComponent(records[0].id)}`), {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: false }),
    });
    return;
  }

  await airtableRequest(airtableUrl(tableId), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: false }),
  });
}

async function deleteAirtableRecord(event: AirtableSyncEvent) {
  const records = await findAirtableRecords(event.source, event.sourceSubmissionId);
  if (records.length > 1) throw new FatalError("duplicate_airtable_source_submission_id");
  if (records.length === 0) return;

  await airtableRequest(airtableUrl(sourceTable(event.source).tableId, `/${encodeURIComponent(records[0].id)}`), {
    method: "DELETE",
  });
}

export async function claimAirtableSyncEvent(eventId: string): Promise<ClaimedSyncEvent> {
  "use step";
  const supabase = createAdminClient();
  const result = await supabase.rpc("claim_airtable_sync_event", { p_event_id: eventId }).maybeSingle();
  if (result.error) throw new RetryableError("airtable_sync_claim_failed", { retryAfter: "30s" });
  const event = result.data;
  if (!event?.current_status) {
    throw new RetryableError("airtable_sync_claim_invalid", { retryAfter: "30s" });
  }
  if (!event.claimed || !event.source || !event.source_id || !event.source_submission_id || typeof event.is_test_record !== "boolean" || !event.operation) {
    return { claimed: false, currentStatus: event.current_status, source: "customer_enquiry", sourceId: "", sourceSubmissionId: "", isTestRecord: false, operation: "upsert" };
  }
  return {
    claimed: true,
    currentStatus: event.current_status,
    source: event.source,
    sourceId: event.source_id,
    sourceSubmissionId: event.source_submission_id,
    isTestRecord: event.is_test_record,
    operation: event.operation,
  };
}

export async function completeAirtableSyncEvent(eventId: string, status: "succeeded" | "failed", errorCode?: string) {
  "use step";
  await completeAirtableSyncEventInStep(eventId, status, errorCode);
}

async function completeAirtableSyncEventInStep(eventId: string, status: "succeeded" | "failed", errorCode?: string) {
  const supabase = createAdminClient();
  const result = await supabase.rpc("complete_airtable_sync_event", {
    p_event_id: eventId,
    p_status: status,
    p_error_code: errorCode ?? null,
    p_error: errorCode ?? null,
  });
  if (result.error) throw new RetryableError("airtable_sync_completion_failed", { retryAfter: "30s" });
}

export async function performAirtableSync(event: AirtableSyncEvent) {
  "use step";
  try {
    if (event.operation === "delete") {
      await deleteAirtableRecord(event);
    } else {
      const fields = await loadFields(event);
      if (fields) await upsertAirtableRecord(event, fields);
    }
    await completeAirtableSyncEventInStep(event.id, "succeeded");
    return { status: "succeeded" as const };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : "airtable_sync_unknown_failure";
    const { attempt } = getStepMetadata();
    if (error instanceof FatalError || attempt >= MAX_AIRTABLE_RETRIES) {
      await completeAirtableSyncEventInStep(event.id, "failed", errorCode);
      throw new FatalError(errorCode);
    }
    if (error instanceof RetryableError) throw error;
    throw new RetryableError("airtable_sync_transient_failure", { retryAfter: Math.min(60_000, (attempt + 1) ** 2 * 2_000) });
  }
}

performAirtableSync.maxRetries = MAX_AIRTABLE_RETRIES;

export async function syncAirtableSubmission(submission: AirtableSubmission) {
  "use step";
  const event: AirtableSyncEvent = { ...submission, id: "direct", operation: "upsert" };

  try {
    const fields = await loadFields(event);
    if (!fields) throw new FatalError("airtable_source_submission_not_found");
    await upsertAirtableRecord(event, fields);
    return { status: "succeeded" as const };
  } catch (error) {
    const { attempt } = getStepMetadata();
    if (error instanceof FatalError || attempt >= MAX_AIRTABLE_RETRIES) throw error;
    if (error instanceof RetryableError) throw error;
    throw new RetryableError("airtable_submission_sync_transient_failure", {
      retryAfter: Math.min(60_000, (attempt + 1) ** 2 * 2_000),
    });
  }
}

syncAirtableSubmission.maxRetries = MAX_AIRTABLE_RETRIES;

export async function recordWorkflowRun(eventId: string, workflowRunId: string) {
  const supabase = createAdminClient();
  const result = await supabase.from("airtable_sync_events").update({ workflow_run_id: workflowRunId }).eq("id", eventId);
  if (result.error) throw new Error("airtable_sync_run_record_failed");
}

export async function resetAirtableSyncEvent(eventId: string) {
  const supabase = createAdminClient();
  const result = await supabase.rpc("reset_airtable_sync_event", { p_event_id: eventId });
  if (result.error || result.data !== true) throw new Error("airtable_sync_replay_unavailable");
}

export async function getAirtableSyncEvent(eventId: string) {
  const supabase = createAdminClient();
  const result = await supabase.from("airtable_sync_events").select("status, started_at").eq("id", eventId).maybeSingle();
  if (result.error) throw new Error("airtable_sync_event_read_failed");
  return result.data;
}
