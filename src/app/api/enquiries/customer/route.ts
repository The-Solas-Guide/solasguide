import { createClient } from "@supabase/supabase-js";
import { start } from "workflow/api";
import { processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";
import {
  CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES,
  isValidWhatsappNumber,
  validateCustomerQuestionnaire,
  type CustomerQuestionnaireAnswers,
} from "@/lib/enquiries/customer-questionnaire";
import type { Database, Json } from "@/types/database";
import { airtableSubmissionWorkflow } from "@/workflows/airtable-sync";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 32_768;
const allowedTopLevelKeys = new Set([
  "submissionToken", "startedAt", "website", "fullName", "email", "phone", "contactPreference",
  "consentConfirmed", "answers",
]);

type Submission = {
  submissionToken: string;
  startedAt: number;
  website?: string;
  fullName: string;
  email: string;
  phone: string;
  contactPreference: "whatsapp";
  consentConfirmed: true;
  answers: CustomerQuestionnaireAnswers;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validate(body: unknown): { data?: Submission; error?: string } {
  if (!isRecord(body) || !isRecord(body.answers)) return { error: "The enquiry could not be read." };
  if (Object.keys(body).some((key) => !allowedTopLevelKeys.has(key))) {
    return { error: "The enquiry contains an unexpected field." };
  }

  const data = body as Record<string, unknown>;
  const token = typeof data.submissionToken === "string" ? data.submissionToken : "";
  const startedAt = data.startedAt;
  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!tokenPattern.test(token)) return { error: "Refresh the page and try again." };
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt) || Date.now() - startedAt < 2_000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return { error: "Refresh the page and try again." };
  }
  if (!fullName || fullName.length > 200) return { error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return { error: "Enter a valid email address." };
  if (data.contactPreference !== "whatsapp" || !isValidWhatsappNumber(phone)) return { error: "Add a valid WhatsApp number." };
  if (data.consentConfirmed !== true) return { error: "Confirm that we may respond to your enquiry." };

  const questionnaire = validateCustomerQuestionnaire(data.answers);
  if (!questionnaire.data) return { error: questionnaire.error };

  const answerBytes = new TextEncoder().encode(JSON.stringify(questionnaire.data)).byteLength;
  if (answerBytes > CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES) return { error: "Shorten the additional information." };

  return {
    data: {
      submissionToken: token,
      startedAt,
      website: typeof data.website === "string" ? data.website : undefined,
      fullName,
      email,
      phone,
      contactPreference: "whatsapp",
      consentConfirmed: true,
      answers: questionnaire.data,
    },
  };
}

type ExistingCustomerEnquiry = Pick<
  Database["public"]["Tables"]["customer_enquiries"]["Row"],
  "id" | "full_name" | "email" | "phone" | "contact_preference" | "consent_confirmed" | "questionnaire_answers"
>;

function matchesQuestionnaire(existing: unknown, expected: CustomerQuestionnaireAnswers) {
  if (!isRecord(existing)) return false;
  const expectedKeys = ["formVersion", "q1", "q2", "q3", "q4", "q5"];
  if (Object.keys(existing).length !== expectedKeys.length || expectedKeys.some((key) => !(key in existing))) return false;
  const existingQ3 = existing.q3;
  return existing.formVersion === expected.formVersion &&
    existing.q1 === expected.q1 &&
    existing.q2 === expected.q2 &&
    Array.isArray(existingQ3) &&
    existingQ3.length === expected.q3.length &&
    existingQ3.every((value, index) => value === expected.q3[index]) &&
    existing.q4 === expected.q4 &&
    existing.q5 === expected.q5;
}

function matchesExistingSubmission(submission: Submission, existing: ExistingCustomerEnquiry) {
  return existing.full_name === submission.fullName &&
    existing.email === submission.email &&
    (existing.phone || "") === submission.phone &&
    existing.contact_preference === submission.contactPreference &&
    existing.consent_confirmed === submission.consentConfirmed &&
    matchesQuestionnaire(existing.questionnaire_answers, submission.answers);
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }
  if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") return false;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host")?.trim() || requestUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
  const requestOrigin = `${forwardedProtocol || requestUrl.protocol.replace(":", "")}://${requestHost}`;
  if (originUrl.origin === requestOrigin) return true;

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredAppUrl) return false;
  try {
    return originUrl.origin === new URL(configuredAppUrl).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return Response.json({ error: "This request is not allowed." }, { status: 403 });

  let body: unknown;
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "The enquiry is too large." }, { status: 413 });
    }
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "The enquiry is too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "The enquiry could not be read." }, { status: 400 });
  }

  const result = validate(body);
  if (!result.data) return Response.json({ error: result.error }, { status: 400 });
  if (result.data.website) return Response.json({ ok: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Enquiries are temporarily unavailable." }, { status: 503 });
  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const submission = result.data;
  const insert = await supabase.from("customer_enquiries").insert({
    submission_token: submission.submissionToken,
    full_name: submission.fullName,
    email: submission.email,
    phone: submission.phone,
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
        .select("id, full_name, email, phone, contact_preference, consent_confirmed, questionnaire_answers")
        .eq("submission_token", submission.submissionToken).single();
      if (existing.error || !existing.data || !matchesExistingSubmission(submission, existing.data)) {
        return Response.json({ error: "This enquiry was already saved with different details. Please start a new enquiry." }, { status: 409 });
      }
      enquiryId = existing.data.id;
    } else {
      console.error("Customer enquiry insert failed", insert.error.code);
      return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
    }
  }

  if (!enquiryId) return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
  try {
    await start(airtableSubmissionWorkflow, [{
      source: "customer_enquiry",
      sourceId: enquiryId,
      sourceSubmissionId: submission.submissionToken,
      isTestRecord: process.env.VERCEL_ENV !== "production",
    }]);
  } catch (error) {
    console.error("Customer enquiry Airtable workflow failed to start", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Your enquiry was saved, but processing could not start. Please try again." }, { status: 503 });
  }
  const delivery = await processCustomerEnquiryDelivery(supabase, enquiryId);
  return Response.json({ ok: true, duplicate, deliveryPending: delivery.deliveryPending });
}
