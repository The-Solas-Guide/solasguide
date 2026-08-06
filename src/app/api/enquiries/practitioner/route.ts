import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

export const runtime = "nodejs";

type ContactPreference = "email" | "phone" | "whatsapp";
type Submission = {
  submissionToken: string;
  startedAt: number;
  website?: string;
  fullName: string;
  email: string;
  phone?: string;
  contactPreference: ContactPreference;
  consentConfirmed: boolean;
  practiceName?: string;
  websiteUrl?: string;
  answers: Record<string, unknown>;
};

const allowedTopLevelKeys = new Set([
  "submissionToken", "startedAt", "website", "fullName", "email", "phone", "contactPreference",
  "consentConfirmed", "practiceName", "websiteUrl", "answers",
]);
const allowedAnswerKeys = new Set([
  "formVersion", "professionalRole", "baliRelationship", "area", "locationDetail", "practiceAreas",
  "otherPractice", "experienceSummary", "additionalLinks",
]);
const allowedRelationships = new Set(["based-in-bali", "works-in-bali-regularly"]);
const allowedAreas = new Map([
  ["ubud", "Ubud"],
  ["canggu-seminyak", "Canggu or Seminyak"],
  ["south-bali", "South Bali"],
  ["east-north-bali", "East or North Bali"],
  ["elsewhere-bali", "Elsewhere in Bali"],
]);
const allowedPractices = new Set([
  "yoga", "breathwork", "meditation", "sound-practice", "bodywork", "movement", "balinese-practices",
  "retreat-facilitation", "other",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isHttpsUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validate(body: unknown): { data?: Submission; error?: string } {
  if (!isRecord(body) || !isRecord(body.answers)) return { error: "The expression of interest could not be read." };
  if (Object.keys(body).some((key) => !allowedTopLevelKeys.has(key))) return { error: "The expression of interest contains an unexpected field." };

  const data = body as Submission;
  const answers = data.answers;
  if (Object.keys(answers).some((key) => !allowedAnswerKeys.has(key))) return { error: "The expression of interest contains an unexpected field." };

  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!tokenPattern.test(data.submissionToken ?? "")) return { error: "Refresh the page and try again." };
  if (typeof data.startedAt !== "number" || Date.now() - data.startedAt < 2_000 || Date.now() - data.startedAt > 24 * 60 * 60 * 1000) return { error: "Refresh the page and try again." };

  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const practiceName = typeof data.practiceName === "string" ? data.practiceName.trim() : "";
  const websiteUrl = typeof data.websiteUrl === "string" ? data.websiteUrl.trim() : "";
  if (!fullName || fullName.length > 200) return { error: "Enter your full name." };
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return { error: "Enter a valid email address." };
  if (!(data.contactPreference === "email" || data.contactPreference === "phone" || data.contactPreference === "whatsapp")) return { error: "Choose how we should contact you." };
  if (data.contactPreference !== "email" && !phone) return { error: "Add a phone number for phone or WhatsApp follow-up." };
  if (phone.length > 50 || (data.contactPreference === "email" && phone)) return { error: "Check your contact details." };
  if (practiceName && (practiceName.length < 2 || practiceName.length > 200)) return { error: "Check your practice or business name." };
  if (websiteUrl.length > 2048 || !isHttpsUrl(websiteUrl)) return { error: "Enter a valid HTTPS website or profile link." };
  if (data.consentConfirmed !== true) return { error: "Confirm that we may use these details to respond to your expression of interest." };

  const professionalRole = typeof answers.professionalRole === "string" ? answers.professionalRole.trim() : "";
  const relationship = answers.baliRelationship;
  const area = answers.area;
  const locationDetail = typeof answers.locationDetail === "string" ? answers.locationDetail.trim() : "";
  const otherPractice = typeof answers.otherPractice === "string" ? answers.otherPractice.trim() : "";
  const experienceSummary = typeof answers.experienceSummary === "string" ? answers.experienceSummary.trim() : "";
  if (answers.formVersion !== 1) return { error: "Refresh the page and try again." };
  if (professionalRole.length < 2 || professionalRole.length > 120) return { error: "Add your professional role or practice." };
  if (typeof relationship !== "string" || !allowedRelationships.has(relationship)) return { error: "Tell us about your relationship to Bali." };
  if (typeof area !== "string" || !allowedAreas.has(area)) return { error: "Choose your primary area in Bali." };
  if (locationDetail.length > 200) return { error: "Shorten your location detail." };

  const practiceAreas = answers.practiceAreas;
  if (!Array.isArray(practiceAreas) || practiceAreas.length < 1 || practiceAreas.length > 5 || practiceAreas.some((value) => typeof value !== "string" || !allowedPractices.has(value)) || new Set(practiceAreas).size !== practiceAreas.length) return { error: "Choose between one and five practice areas." };
  if (practiceAreas.includes("other") && (otherPractice.length < 2 || otherPractice.length > 100)) return { error: "Tell us about your other practice." };
  if (!practiceAreas.includes("other") && otherPractice) return { error: "Remove the other practice when it is not selected." };
  if (experienceSummary.length < 50 || experienceSummary.length > 2_000) return { error: "Share between 50 and 2,000 characters about your relevant experience." };

  const additionalLinks = answers.additionalLinks;
  if (!Array.isArray(additionalLinks) || additionalLinks.length > 2 || additionalLinks.some((value) => typeof value !== "string" || value.length > 2048 || !isHttpsUrl(value)) || new Set(additionalLinks).size !== additionalLinks.length || additionalLinks.includes(websiteUrl)) return { error: "Check the links you added." };
  if (JSON.stringify(answers).length > 28_000) return { error: "Shorten the information you provided." };

  return {
    data: {
      ...data,
      fullName,
      email,
      phone: phone || undefined,
      practiceName: practiceName || undefined,
      websiteUrl: websiteUrl || undefined,
      answers: {
        ...answers,
        professionalRole,
        locationDetail,
        otherPractice,
        experienceSummary,
        additionalLinks,
      },
    },
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && requestHost && new URL(origin).host !== requestHost) return Response.json({ error: "This request is not allowed." }, { status: 403 });

  let body: unknown;
  try {
    if (Number(request.headers.get("content-length") || 0) > 32_768) return Response.json({ error: "The expression of interest is too large." }, { status: 413 });
    body = await request.json();
  } catch {
    return Response.json({ error: "The expression of interest could not be read." }, { status: 400 });
  }

  const result = validate(body);
  if (!result.data) return Response.json({ error: result.error }, { status: 400 });
  if (result.data.website) return Response.json({ ok: true, duplicate: false });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Expressions of interest are temporarily unavailable." }, { status: 503 });

  const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const submission = result.data;
  const area = String(submission.answers.area);
  const locationDetail = String(submission.answers.locationDetail || "");
  const location = `${allowedAreas.get(area)}${locationDetail ? ` — ${locationDetail}` : ""}`;
  const insert = await supabase.from("practitioner_expressions_of_interest").insert({
    submission_token: submission.submissionToken,
    full_name: submission.fullName,
    email: submission.email,
    phone: submission.phone ?? null,
    contact_preference: submission.contactPreference,
    practice_name: submission.practiceName ?? null,
    location,
    website_url: submission.websiteUrl ?? null,
    consent_confirmed: true,
    questionnaire_answers: submission.answers as Json,
  }).select("id").single();

  if (insert.error) {
    if (insert.error.code === "23505") {
      const existing = await supabase.from("practitioner_expressions_of_interest")
        .select("id, email")
        .eq("submission_token", submission.submissionToken)
        .single();
      if (existing.error || existing.data.email !== submission.email) return Response.json({ error: "This expression of interest could not be retried." }, { status: 409 });
      return Response.json({ ok: true, duplicate: true });
    }
    console.error("Practitioner expression of interest insert failed", insert.error.code);
    return Response.json({ error: "We could not save your expression of interest. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true, duplicate: false });
}
