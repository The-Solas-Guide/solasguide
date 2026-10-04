import { createClient } from "@supabase/supabase-js";
import { start } from "workflow/api";
import { processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";
import {
  validateProgrammeEnquiryAnswers,
  type ProgrammeEnquiryAnswers,
} from "@/lib/enquiries/programme-enquiry";
import type { Database, Json } from "@/types/database";
import { airtableSubmissionWorkflow } from "@/workflows/airtable-sync";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 32_768;
const allowedTopLevelKeys = new Set([
  "submissionToken", "startedAt", "website", "fullName", "email", "organisation", "experience", "dates", "intention", "consentConfirmed",
]);

type Submission = {
  submissionToken: string;
  website?: string;
  fullName: string;
  email: string;
  consentConfirmed: true;
  answers: ProgrammeEnquiryAnswers;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validate(body: unknown): { data?: Submission; error?: string } {
  if (!isRecord(body)) return { error: "The programme enquiry could not be read." };
  if (Object.keys(body).some((key) => !allowedTopLevelKeys.has(key))) return { error: "The programme enquiry contains an unexpected field." };

  const token = typeof body.submissionToken === "string" ? body.submissionToken : "";
  const startedAt = body.startedAt;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!tokenPattern.test(token)) return { error: "Refresh the page and try again." };
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt) || Date.now() - startedAt < 2_000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) return { error: "Refresh the page and try again." };
  if ((body.website !== undefined && typeof body.website !== "string") || (body.organisation !== undefined && typeof body.organisation !== "string") || (body.dates !== undefined && typeof body.dates !== "string") || typeof body.intention !== "string") return { error: "The programme enquiry could not be read." };
  if (!fullName || fullName.length > 200) return { error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return { error: "Enter a valid email address." };
  if (body.consentConfirmed !== true) return { error: "Confirm that we may respond to your programme enquiry." };

  const answers = validateProgrammeEnquiryAnswers({
    organisation: body.organisation,
    experience: body.experience,
    dates: body.dates,
    intention: body.intention,
  });
  if (!answers.data) return { error: answers.error };
  return { data: { submissionToken: token, website: body.website, fullName, email, consentConfirmed: true, answers: answers.data } };
}

type ExistingCustomerEnquiry = Pick<Database["public"]["Tables"]["customer_enquiries"]["Row"], "id" | "full_name" | "email" | "phone" | "contact_preference" | "consent_confirmed" | "questionnaire_answers">;

function matchesExistingSubmission(submission: Submission, existing: ExistingCustomerEnquiry) {
  const answers = existing.questionnaire_answers;
  return isRecord(answers) &&
    Object.keys(answers).length === 5 &&
    answers.formVersion === submission.answers.formVersion &&
    answers.organisation === submission.answers.organisation &&
    answers.experience === submission.answers.experience &&
    answers.dates === submission.answers.dates &&
    answers.intention === submission.answers.intention &&
    existing.full_name === submission.fullName &&
    existing.email === submission.email &&
    existing.phone === null &&
    existing.contact_preference === "email" &&
    existing.consent_confirmed === submission.consentConfirmed;
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
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) return Response.json({ error: "The programme enquiry is too large." }, { status: 413 });
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) return Response.json({ error: "The programme enquiry is too large." }, { status: 413 });
    body = JSON.parse(rawBody);
  } catch { return Response.json({ error: "The programme enquiry could not be read." }, { status: 400 }); }
  const result = validate(body);
  if (!result.data) return Response.json({ error: result.error }, { status: 400 });
  if (result.data.website) return Response.json({ ok: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Enquiries are temporarily unavailable." }, { status: 503 });
  const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const submission = result.data;
  const insert = await supabase.from("customer_enquiries").insert({
    submission_token: submission.submissionToken,
    delivery_enabled: true,
    full_name: submission.fullName,
    email: submission.email,
    phone: null,
    contact_preference: "email",
    consent_confirmed: true,
    questionnaire_answers: submission.answers as Json,
  }).select("id").single();
  let enquiryId = insert.data?.id;
  let duplicate = false;
  if (insert.error) {
    if (insert.error.code !== "23505") {
      console.error("Programme enquiry insert failed", insert.error.code);
      return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
    }
    duplicate = true;
    const existing = await supabase.from("customer_enquiries").select("id, full_name, email, phone, contact_preference, consent_confirmed, questionnaire_answers").eq("submission_token", submission.submissionToken).single();
    if (existing.error || !existing.data || !matchesExistingSubmission(submission, existing.data)) return Response.json({ error: "This enquiry was already saved with different details. Please start a new enquiry." }, { status: 409 });
    enquiryId = existing.data.id;
  }
  if (!enquiryId) return Response.json({ error: "We could not save your enquiry. Please try again." }, { status: 500 });
  try {
    await start(airtableSubmissionWorkflow, [{ source: "customer_enquiry", sourceId: enquiryId, sourceSubmissionId: submission.submissionToken, isTestRecord: process.env.VERCEL_ENV !== "production" }]);
  } catch (error) {
    console.error("Programme enquiry Airtable workflow failed to start", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Your enquiry was saved, but processing could not start. Please try again." }, { status: 503 });
  }
  const delivery = await processCustomerEnquiryDelivery(supabase, enquiryId);
  return Response.json({ ok: true, duplicate, deliveryPending: delivery.deliveryPending });
}
