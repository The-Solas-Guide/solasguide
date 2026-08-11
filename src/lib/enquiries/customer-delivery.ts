import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
  customerQuestionnaireLabel,
  type CustomerQuestionKey,
} from "@/lib/enquiries/customer-questionnaire";
import type { Database } from "@/types/database";

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

export function customerAnswerSummary(answers: Record<string, unknown>) {
  if (answers.formVersion !== CUSTOMER_QUESTIONNAIRE_FORM_VERSION) return legacyAnswerSummary(answers);

  const label = (question: CustomerQuestionKey, value: unknown) => Array.isArray(value)
    ? value.map((item) => typeof item === "string" ? customerQuestionnaireLabel(question, item) : String(item)).join(", ") || "Not provided"
    : typeof value === "string" && value ? customerQuestionnaireLabel(question, value) : "Not provided";
  return [
    `What brings you to The Solas Guide today?: ${label("q1", answers.q1)}`,
    `Who are you looking for?: ${label("q2", answers.q2)}`,
    `What are you hoping this helps with?: ${label("q3", answers.q3)}`,
    `When are you hoping to connect?: ${label("q4", answers.q4)}`,
    `Is there anything else you'd like us to know?: ${typeof answers.q5 === "string" && answers.q5 ? answers.q5 : "Not provided"}`,
  ].join("\n");
}

async function sendEmail(to: Recipient[], subject: string, text: string, replyTo?: Recipient) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) throw new Error("MailerSend is not configured");
  const params = new EmailParams()
    .setFrom(new Sender(fromEmail, process.env.MAILERSEND_FROM_NAME || "The Solas Guide"))
    .setTo(to)
    .setSubject(subject)
    .setText(text);
  if (replyTo) params.setReplyTo(replyTo);
  await new MailerSend({ apiKey }).email.send(params);
}

export async function processCustomerEnquiryDelivery(supabase: SupabaseClient<Database>, enquiryId: string) {
  const stored = await supabase.from("customer_enquiries")
    .select("id, full_name, email, phone, contact_preference, questionnaire_answers, customer_confirmation_status, internal_notification_status")
    .eq("id", enquiryId).single();
  if (stored.error) return { error: "read_failed", deliveryPending: true } as const;

  const deliveryClaim = await supabase.rpc("claim_customer_enquiry_delivery", { p_enquiry_id: enquiryId }).single();
  if (deliveryClaim.error) return { error: "claim_failed", deliveryPending: true } as const;

  const persisted = stored.data;
  const answers = isRecord(persisted.questionnaire_answers) ? persisted.questionnaire_answers : {};
  const summary = customerAnswerSummary(answers);
  const customerText = `Hello ${persisted.full_name},\n\nThank you for sharing what you are looking for. We have received your enquiry and will review it personally. You can expect to hear from us within two business days.\n\nThe Solas Guide`;
  const operationsEmail = process.env.SOLAS_OPERATIONS_EMAIL;
  const customerResult = deliveryClaim.data.send_customer
    ? await sendEmail([new Recipient(persisted.email, persisted.full_name)], "We have received your Solas Guide enquiry", customerText).then(() => "sent" as const).catch((error) => { console.error("Customer confirmation failed", error instanceof Error ? error.message : "Unknown error"); return "failed" as const; })
    : persisted.customer_confirmation_status;
  const internalResult = deliveryClaim.data.send_internal
    ? operationsEmail
      ? await sendEmail([new Recipient(operationsEmail, "Solas operations")], `New Solas enquiry from ${persisted.full_name}`, `Contact preference: WhatsApp\nEmail: ${persisted.email}\nWhatsApp: ${persisted.phone || "Not provided"}\n\n${summary}`, new Recipient(persisted.email, persisted.full_name)).then(() => "sent" as const).catch((error) => { console.error("Internal notification failed", error instanceof Error ? error.message : "Unknown error"); return "failed" as const; })
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
