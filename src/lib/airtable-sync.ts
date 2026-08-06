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
    fields: {
      enquiry: "fld2fImnmsiTB08t9",
      sourceSubmissionId: "fldRP8toFgdJeCeVM",
      submittedAt: "fldMy9ZnSlVRphsV4",
      source: "fldUi0FIp19ZBfG9k",
      email: "fldettKhboWJLMLZI",
      phone: "fld4DMMWfVy9X0oA2",
      contactPreference: "fldsKjxRIb5qd14D9",
      contactBasis: "fldW85hHxJpu58BA1",
      enquiryType: "fldyfyJ7hoApBBNJb",
      outcomes: "fldc7VCFABFbqkkRH",
      additionalNeeds: "fldaod62qqsr8fJ9t",
      timing: "fldwVlLxRkjwCiU8e",
      location: "fldPOBRl9ieG2LYz1",
      locationDetail: "fld30IWyrkcBPXY7A",
      group: "fldHleW4GTz7CgfF9",
      groupSize: "fldMRzqkZQZbtNeVM",
      organisation: "fldMO6cEh8zwmkAFy",
      practices: "fldU2iJgWyQe9wqN3",
      budget: "fldpJLzOrO8HEzmZe",
      additionalContext: "fld7eU2fiIYsbgFKn",
      testRecord: "fldEN7U0OR9bF1e2s",
    },
  },
  practitioner_expression: {
    tableId: "tbl90Q1NoiAnbEI6c",
    sourceName: "Website application",
    fields: {
      practitioner: "fldnbgdhPg6RsqcSA",
      sourceSubmissionId: "fld3H9o3BthckLUte",
      source: "fldL0zDMxM4bNWmDI",
      email: "fldOBIAc16h4swvvx",
      phone: "fldVuk3YZPvGJsYMo",
      contactPreference: "flduXUD3EECxqhUdV",
      contactBasis: "fldNfY3UD6fCZYC1Y",
      practiceName: "fldwwSRHfX6E65ieu",
      professionalRole: "fld0HUxa4Zcrs3VT0",
      baliRelationship: "fldv5bJcsRzxXvLfB",
      area: "fldSaMEGJTeOnCEbG",
      locationDetail: "fldUtyzBEBkxaPNHO",
      practiceAreas: "fldWLUgMlf1q2r0rZ",
      otherPractice: "fldRhiwRPsgT5x3Xg",
      experienceSummary: "fldQLyf3atmj36wc9",
      websiteUrl: "fldkJdFUDkcGZu5Ak",
      additionalLinks: "fldpsfJwp0ISwhK17",
      testRecord: "fld09slG4dal3PjYs",
    },
  },
} as const;

export type AirtableSubmission = {
  source: "customer_enquiry" | "practitioner_expression";
  sourceId: string;
  sourceSubmissionId: string;
  isTestRecord: boolean;
};
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
  const fields = AIRTABLE.customer_enquiry.fields;
  return compactFields({
    [fields.enquiry]: row.full_name,
    [fields.sourceSubmissionId]: row.submission_token,
    [fields.submittedAt]: row.created_at,
    [fields.source]: AIRTABLE.customer_enquiry.sourceName,
    [fields.email]: row.email,
    [fields.phone]: row.phone ?? undefined,
    [fields.contactPreference]: contactPreference(row.contact_preference),
    [fields.contactBasis]: row.consent_confirmed ? "Inbound response consent" : undefined,
    [fields.enquiryType]: label(answerString(answers, "primaryNeed"), {
      practitioner: "Find a practitioner",
      venue: "Find a venue",
      experience: "Find an experience",
      event: "Plan an event",
    }),
    [fields.outcomes]: answerStrings(answers, "outcomes")?.map((item) => label(item, {
      "rest-reset": "Rest/reset",
      "physical-wellbeing": "Physical wellbeing",
      "personal-support": "Personal support",
      "local-practices": "Local practices",
      connection: "Connection",
      "retreat-team": "Retreat/team",
      exploring: "Exploring",
    }) ?? item).filter(Boolean),
    [fields.additionalNeeds]: answerStrings(answers, "extras")?.map((item) => label(item, {
      practitioner: "Practitioner",
      venue: "Venue",
      experience: "Experience",
      event: "Event",
    }) ?? item).filter(Boolean),
    [fields.timing]: label(answerString(answers, "timing"), {
      "dates-known": "Dates known",
      month: "Month",
      season: "Season",
      later: "Later",
      planning: "Planning",
    }),
    [fields.location]: label(answerString(answers, "location"), {
      ubud: "Ubud",
      canggu: "Canggu",
      south: "South Bali",
      "east-north": "East/North Bali",
      moving: "Moving",
      undecided: "Undecided",
    }),
    [fields.locationDetail]: answerString(answers, "locationDetail"),
    [fields.group]: label(answerString(answers, "group"), {
      solo: "Solo",
      pair: "Pair",
      "small-group": "Small group",
      retreat: "Retreat",
      business: "Business",
      unsure: "Unsure",
    }),
    [fields.groupSize]: groupSizeNumber,
    [fields.organisation]: answerString(answers, "organizationName"),
    [fields.practices]: answerStrings(answers, "modalities")?.map((item) => label(item, {
      yoga: "Yoga",
      breathwork: "Breathwork",
      meditation: "Meditation",
      "sound-practice": "Sound practice",
      bodywork: "Bodywork",
      movement: "Movement",
      "balinese-practices": "Balinese practices",
      "retreat-facilitation": "Retreat facilitation",
    }) ?? item).filter(Boolean),
    [fields.budget]: label(answerString(answers, "budget"), {
      considered: "Considered",
      flexible: "Flexible",
      substantial: "Substantial",
      unsure: "Unsure",
      discuss: "Discuss",
    }),
    [fields.additionalContext]: answerString(answers, "notes"),
    [fields.testRecord]: isTestRecord,
  });
}

function practitionerFields(row: Database["public"]["Tables"]["practitioner_expressions_of_interest"]["Row"], isTestRecord: boolean) {
  const answers = row.questionnaire_answers;
  const fields = AIRTABLE.practitioner_expression.fields;
  return compactFields({
    [fields.practitioner]: row.full_name,
    [fields.sourceSubmissionId]: row.submission_token,
    [fields.source]: AIRTABLE.practitioner_expression.sourceName,
    [fields.email]: row.email,
    [fields.phone]: row.phone ?? undefined,
    [fields.contactPreference]: contactPreference(row.contact_preference),
    [fields.contactBasis]: row.consent_confirmed ? "Inbound response consent" : undefined,
    [fields.practiceName]: row.practice_name ?? undefined,
    [fields.professionalRole]: answerString(answers, "professionalRole"),
    [fields.baliRelationship]: label(answerString(answers, "baliRelationship"), {
      "based-in-bali": "Based in Bali",
      "works-in-bali-regularly": "Works in Bali regularly",
    }),
    [fields.area]: label(answerString(answers, "area"), {
      ubud: "Ubud",
      "canggu-seminyak": "Canggu/Seminyak",
      "south-bali": "South Bali",
      "east-north-bali": "East/North Bali",
      "elsewhere-bali": "Elsewhere Bali",
    }),
    [fields.locationDetail]: answerString(answers, "locationDetail"),
    [fields.practiceAreas]: answerStrings(answers, "practiceAreas")?.map((item) => label(item, {
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
    [fields.otherPractice]: answerString(answers, "otherPractice"),
    [fields.experienceSummary]: answerString(answers, "experienceSummary"),
    [fields.websiteUrl]: row.website_url ?? undefined,
    [fields.additionalLinks]: answerStrings(answers, "additionalLinks")?.join("\n"),
    [fields.testRecord]: isTestRecord,
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

function sourceTable(source: AirtableSubmission["source"]) {
  return AIRTABLE[source];
}

function airtableUrl(tableId: string) {
  const { baseId } = requireAirtableConfiguration();
  return `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;
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

async function loadFields(submission: AirtableSubmission) {
  const supabase = createAdminClient();
  if (submission.source === "customer_enquiry") {
    const result = await supabase.from("customer_enquiries").select("*").eq("id", submission.sourceId).maybeSingle();
    if (result.error) throw new RetryableError("supabase_source_read_failed", { retryAfter: "30s" });
    return result.data ? customerFields(result.data, submission.isTestRecord) : null;
  }

  const result = await supabase.from("practitioner_expressions_of_interest").select("*").eq("id", submission.sourceId).maybeSingle();
  if (result.error) throw new RetryableError("supabase_source_read_failed", { retryAfter: "30s" });
  return result.data ? practitionerFields(result.data, submission.isTestRecord) : null;
}

async function upsertAirtableRecord(submission: AirtableSubmission, fields: Record<string, string | number | boolean | string[]>) {
  const table = sourceTable(submission.source);
  await airtableRequest(airtableUrl(table.tableId), {
    method: "PATCH",
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: [table.fields.sourceSubmissionId] },
      records: [{ fields }],
      typecast: false,
    }),
  });
}

export async function syncAirtableSubmission(submission: AirtableSubmission) {
  "use step";

  try {
    const fields = await loadFields(submission);
    if (!fields) throw new FatalError("airtable_source_submission_not_found");
    await upsertAirtableRecord(submission, fields);
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
