import { createClient } from "@supabase/supabase-js";
import { processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";
import type { Database, Json } from "@/types/database";

export const runtime = "nodejs";

type Submission = {
  submissionToken: string;
  startedAt: number;
  website?: string;
  fullName: string;
  email: string;
  phone?: string;
  contactPreference: "email" | "phone" | "whatsapp";
  consentConfirmed: boolean;
  answers: Record<string, unknown>;
};

const allowedAnswerKeys = new Set([
  "formVersion", "outcomes", "primaryNeed", "extras", "timing", "startDate", "endDate",
  "location", "locationDetail", "group", "groupSize", "organizationName", "modalities", "budget", "notes",
]);
const allowedOutcomes = new Set(["rest-reset", "physical-wellbeing", "personal-support", "local-practices", "connection", "retreat-team", "exploring"]);
const allowedNeeds = new Set(["practitioner", "venue", "experience", "event"]);
const allowedTiming = new Set(["dates-known", "month", "season", "later", "planning"]);
const allowedLocations = new Set(["ubud", "canggu", "south", "east-north", "moving", "undecided"]);
const allowedGroups = new Set(["solo", "pair", "small-group", "retreat", "business", "unsure"]);
const allowedBudgets = new Set(["considered", "flexible", "substantial", "unsure", "discuss"]);
const allowedModalities = new Set(["yoga", "breathwork", "meditation", "sound-practice", "bodywork", "movement", "balinese-practices", "retreat-facilitation"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validate(body: unknown): { data?: Submission; error?: string } {
  if (!isRecord(body) || !isRecord(body.answers)) return { error: "The enquiry could not be read." };
  const data = body as Submission;
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const preference = data.contactPreference;
  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!tokenPattern.test(data.submissionToken ?? "")) return { error: "Refresh the page and try again." };
  if (typeof data.startedAt !== "number" || Date.now() - data.startedAt < 2_000 || Date.now() - data.startedAt > 24 * 60 * 60 * 1000) return { error: "Refresh the page and try again." };
  if (!fullName || fullName.length > 200) return { error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return { error: "Enter a valid email address." };
  if (!(["email", "phone", "whatsapp"] as const).includes(preference)) return { error: "Choose how we should follow up." };
  if (preference !== "email" && !phone) return { error: "Add a phone number for phone or WhatsApp follow-up." };
  if (phone.length > 50) return { error: "Enter a shorter phone number." };
  if (preference === "email" && phone) return { error: "Remove the phone number when email is selected." };
  if (data.consentConfirmed !== true) return { error: "Confirm that we may respond to your enquiry." };
  if (Object.keys(data.answers).some((key) => !allowedAnswerKeys.has(key))) return { error: "The enquiry contains an unexpected field." };

  const outcomes = data.answers.outcomes;
  const primaryNeed = data.answers.primaryNeed;
  const timing = data.answers.timing;
  const location = data.answers.location;
  const group = data.answers.group;
  const budget = data.answers.budget;
  if (data.answers.formVersion !== 2) return { error: "Refresh the page and try again." };
  if (!Array.isArray(outcomes) || outcomes.length < 1 || outcomes.length > 3 || outcomes.some((item) => typeof item !== "string" || !allowedOutcomes.has(item))) return { error: "Choose up to three outcomes." };
  if (typeof primaryNeed !== "string" || !allowedNeeds.has(primaryNeed)) return { error: "Choose what you would most like help finding." };
  if (typeof timing !== "string" || !allowedTiming.has(timing) || typeof location !== "string" || !allowedLocations.has(location) || typeof group !== "string" || !allowedGroups.has(group) || typeof budget !== "string" || !allowedBudgets.has(budget)) return { error: "Complete each required step." };
  const extras = data.answers.extras;
  const modalities = data.answers.modalities;
  if (!Array.isArray(extras) || extras.length > 3 || extras.some((item) => typeof item !== "string" || !allowedNeeds.has(item) || item === primaryNeed)) return { error: "Check the optional areas you selected." };
  if (!Array.isArray(modalities) || modalities.length > allowedModalities.size || modalities.some((item) => typeof item !== "string" || !allowedModalities.has(item))) return { error: "Check the practices you selected." };
  if (new Set(extras).size !== extras.length || new Set(modalities).size !== modalities.length || new Set(outcomes).size !== outcomes.length) return { error: "Remove duplicate selections." };
  for (const key of ["locationDetail", "organizationName", "notes"] as const) {
    if (typeof data.answers[key] !== "string") return { error: "The enquiry contains an invalid response." };
  }
  if (String(data.answers.locationDetail).length > 500 || String(data.answers.organizationName).length > 200 || String(data.answers.notes).length > 3000) return { error: "Shorten the additional information." };
  if (["small-group", "retreat", "business"].includes(group) && (!Number.isInteger(Number(data.answers.groupSize)) || Number(data.answers.groupSize) < 1 || Number(data.answers.groupSize) > 10000)) return { error: "Add a valid approximate group size." };
  if (!["small-group", "retreat", "business"].includes(group) && String(data.answers.groupSize)) return { error: "Remove the group size for this enquiry type." };
  if (group === "business" && !String(data.answers.organizationName).trim()) return { error: "Add the business or organisation name." };
  if (group !== "business" && String(data.answers.organizationName)) return { error: "Remove the organisation name for this enquiry type." };
  if (timing === "dates-known") {
    const start = String(data.answers.startDate ?? "");
    const end = String(data.answers.endDate ?? "");
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const startDate = new Date(`${start}T00:00:00Z`);
    const endDate = new Date(`${end}T00:00:00Z`);
    if (!datePattern.test(start) || !datePattern.test(end) || Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || startDate.toISOString().slice(0, 10) !== start || endDate.toISOString().slice(0, 10) !== end || end < start) return { error: "Check that your departure is after your arrival." };
  } else if (String(data.answers.startDate ?? "") || String(data.answers.endDate ?? "")) {
    return { error: "Remove dates when your timing is not fixed." };
  }
  const encodedAnswers = JSON.stringify(data.answers);
  if (encodedAnswers.length > 28_000) return { error: "Shorten your additional notes." };
  return { data: { ...data, fullName, email, phone: phone || undefined } };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && requestHost && new URL(origin).host !== requestHost) return Response.json({ error: "This request is not allowed." }, { status: 403 });
  let body: unknown;
  try {
    if (Number(request.headers.get("content-length") || 0) > 32_768) return Response.json({ error: "The enquiry is too large." }, { status: 413 });
    body = await request.json();
  } catch {
    return Response.json({ error: "The enquiry could not be read." }, { status: 400 });
  }
  const result = validate(body);
  if (!result.data) return Response.json({ error: result.error }, { status: 400 });
  if (result.data.website) return Response.json({ ok: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Enquiries are temporarily unavailable." }, { status: 503 });
  const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const submission = result.data;
  const insert = await supabase.from("customer_enquiries").insert({
    airtable_test_record: process.env.VERCEL_ENV !== "production",
    submission_token: submission.submissionToken,
    full_name: submission.fullName,
    email: submission.email,
    phone: submission.phone ?? null,
    contact_preference: submission.contactPreference,
    consent_confirmed: true,
    questionnaire_answers: submission.answers as Json,
  }).select("id").single();

  let enquiryId = insert.data?.id;
  let duplicate = false;
  if (insert.error) {
    if (insert.error.code === "23505") {
      duplicate = true;
      const existing = await supabase.from("customer_enquiries")
        .select("id, email")
        .eq("submission_token", submission.submissionToken).single();
      if (existing.error || existing.data.email !== submission.email) return Response.json({ error: "This enquiry could not be retried." }, { status: 409 });
      enquiryId = existing.data.id;
    } else {
      console.error("Customer enquiry insert failed", insert.error.code);
      return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
    }
  }

  if (!enquiryId) return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
  const delivery = await processCustomerEnquiryDelivery(supabase, enquiryId);
  return Response.json({ ok: true, duplicate, deliveryPending: delivery.deliveryPending });
}
