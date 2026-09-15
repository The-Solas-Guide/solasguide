import { Recipient } from "mailersend";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
  customerQuestionnaireLabel,
  type CustomerQuestionKey,
} from "@/lib/enquiries/customer-questionnaire";
import { PROGRAMME_FORM_VERSION, programmeExperienceLabel } from "@/lib/enquiries/programme-enquiry";
import type { Database } from "@/types/database";
import { sendTransactionalEmail } from "@/lib/enquiries/delivery-email";
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function legacyAnswerSummary(answers: Record<string, unknown>) {
  const label = (value: unknown) => Array.isArray(value) ? value.join(", ") : String(value || "Not provided");
  return [
    `Outcomes: ${label(answers.outcomes)}`,
    `Primary need: ${label(answers.primaryNeed)}`,
    `Optional extras: ${label(answers.extras)}`,
    `Timing: ${label(answers.timing)}`,
    `Location: ${label(answers.location)}`,
    `Group: ${label(answers.group)}${answers.groupSize ? ` (${answers.groupSize})` : ""}`,
    `Practices: ${label(answers.modalities)}`,
    `Budget: ${label(answers.budget)}`,
    `Additional context: ${label(answers.notes)}`,
  ].join("\n");
}

function structuredAnswerSummary(
  answers: Record<string, unknown>,
  titles: Record<CustomerQuestionKey | "q5", string>,
) {
  const label = (question: CustomerQuestionKey, value: unknown) => Array.isArray(value)
    ? value.map((item) => typeof item === "string" ? customerQuestionnaireLabel(question, item) : String(item)).join(", ") || "Not provided"
    : typeof value === "string" && value ? customerQuestionnaireLabel(question, value) : "Not provided";
  return [
    `${titles.q1}: ${label("q1", answers.q1)}`,
    `${titles.q2}: ${label("q2", answers.q2)}`,
    `${titles.q3}: ${label("q3", answers.q3)}`,
    `${titles.q4}: ${label("q4", answers.q4)}`,
    `${titles.q5}: ${typeof answers.q5 === "string" && answers.q5 ? answers.q5 : "Not provided"}`,
  ].join("\n");
}

export function customerAnswerSummary(answers: Record<string, unknown>) {
  if (answers.formVersion === PROGRAMME_FORM_VERSION) {
    return [
      `Programme experience: ${typeof answers.experience === "string" ? programmeExperienceLabel(answers.experience) : "Not provided"}`,
      `Organisation: ${typeof answers.organisation === "string" && answers.organisation ? answers.organisation : "Not provided"}`,
      `Dates: ${typeof answers.dates === "string" && answers.dates ? answers.dates : "Not provided"}`,
      `What they have in mind: ${typeof answers.intention === "string" && answers.intention ? answers.intention : "Not provided"}`,
    ].join("\n");
  }
  if (answers.formVersion === CUSTOMER_QUESTIONNAIRE_FORM_VERSION) {
    return structuredAnswerSummary(answers, {
      q1: "Who are you looking for support for?",
      q2: "What would you most like support with?",
      q3: "Is there anything important about the kind of person or approach you’re looking for?",
      q4: "When would you ideally like to connect?",
      q5: "Anything else you’d like us to know?",
    });
  }
  if (answers.formVersion === 3) {
    return structuredAnswerSummary(answers, {
      q1: "What brings you to The Solas Guide today?",
      q2: "Who are you looking for?",
      q3: "What are you hoping this helps with?",
      q4: "When are you hoping to connect?",
      q5: "Is there anything else you'd like us to know?",
    });
  }
  return legacyAnswerSummary(answers);
}

export async function processCustomerEnquiryDelivery(supabase: SupabaseClient<Database>, enquiryId: string) {
  const stored = await supabase.from("customer_enquiries")
    .select("id, source, full_name, email, phone, contact_preference, questionnaire_answers, customer_confirmation_status, internal_notification_status")
    .eq("id", enquiryId).single();
  if (stored.error) return { error: "read_failed", deliveryPending: true } as const;

  // Manual CMS records never enter the website confirmation workflow.
  if (stored.data.source !== "website") return { deliveryPending: false } as const;

  const deliveryClaim = await supabase.rpc("claim_customer_enquiry_delivery", { p_enquiry_id: enquiryId }).single();
  if (deliveryClaim.error) return { error: "claim_failed", deliveryPending: true } as const;

  const persisted = stored.data;
  const answers = isRecord(persisted.questionnaire_answers) ? persisted.questionnaire_answers : {};
  const summary = customerAnswerSummary(answers);
  const isProgrammeEnquiry = answers.formVersion === PROGRAMME_FORM_VERSION;
  const customerText = isProgrammeEnquiry
    ? `Hello ${persisted.full_name},\n\nThank you for your programme enquiry. We have received it and will review it personally. We will be in touch soon.\n\nThe Solas Guide`
    : `Hello ${persisted.full_name},\n\nThank you. We’ve received your enquiry.\n\nSomeone from Solas will review what you’ve shared and come back to you personally with the practitioners we think may be worth considering.\n\nThe Solas Guide`;
  const operationsEmail = process.env.SOLAS_OPERATIONS_EMAIL;
  const customerResult = deliveryClaim.data.send_customer
    ? await sendTransactionalEmail([new Recipient(persisted.email, persisted.full_name)], "We have received your Solas Guide enquiry", customerText, operationsEmail ? new Recipient(operationsEmail, "Solas operations") : undefined).then(() => "sent" as const).catch((error) => { console.error("Customer confirmation failed", error instanceof Error ? error.name : "UnknownError"); return "failed" as const; })
    : persisted.customer_confirmation_status;
  const internalResult = deliveryClaim.data.send_internal
    ? operationsEmail
      ? await sendTransactionalEmail([new Recipient(operationsEmail, "Solas operations")], `${isProgrammeEnquiry ? "New Solas programme enquiry" : "New Solas enquiry"} from ${persisted.full_name}`, `Contact preference: ${persisted.contact_preference === "email" ? "Email" : persisted.contact_preference === "whatsapp" ? "WhatsApp" : "Phone"}\nEmail: ${persisted.email}${persisted.phone ? `\n${persisted.contact_preference === "whatsapp" ? "WhatsApp" : "Phone"}: ${persisted.phone}` : ""}\n\n${summary}`, new Recipient(persisted.email, persisted.full_name)).then(() => "sent" as const).catch((error) => { console.error("Internal notification failed", error instanceof Error ? error.name : "UnknownError"); return "failed" as const; })
      : "failed" as const
    : persisted.internal_notification_status;

  const now = new Date().toISOString();
  const update: Database["public"]["Tables"]["customer_enquiries"]["Update"] = {};
  if (deliveryClaim.data.send_customer) {
    update.customer_confirmation_status = customerResult;
    if (customerResult === "sent") update.customer_confirmation_sent_at = now;
  }
  if (deliveryClaim.data.send_internal) {
    update.internal_notification_status = internalResult;
    if (internalResult === "sent") update.internal_notification_sent_at = now;
  }
  if (Object.keys(update).length > 0) {
    const result = await supabase.from("customer_enquiries").update(update).eq("id", enquiryId);
    if (result.error) return { error: "status_update_failed", deliveryPending: true } as const;
  }
  return { deliveryPending: customerResult !== "sent" || internalResult !== "sent" } as const;
}
