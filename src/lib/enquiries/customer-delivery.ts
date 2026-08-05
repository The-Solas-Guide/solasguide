import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function answerSummary(answers: Record<string, unknown>) {
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
  const summary = answerSummary(answers);
  const customerText = `Hello ${persisted.full_name},\n\nThank you for telling us about your plans. We have received your enquiry and will review the details personally. You can expect to hear from us within two business days.\n\nThe Solas Guide`;
  const operationsEmail = process.env.SOLAS_OPERATIONS_EMAIL;
  const customerResult = deliveryClaim.data.send_customer
    ? await sendEmail([new Recipient(persisted.email, persisted.full_name)], "We have received your Solas Guide enquiry", customerText).then(() => "sent" as const).catch((error) => { console.error("Customer confirmation failed", error instanceof Error ? error.message : "Unknown error"); return "failed" as const; })
    : persisted.customer_confirmation_status;
  const internalResult = deliveryClaim.data.send_internal
    ? operationsEmail
      ? await sendEmail([new Recipient(operationsEmail, "Solas operations")], `New Solas enquiry from ${persisted.full_name}`, `Contact preference: ${persisted.contact_preference}\nEmail: ${persisted.email}\nPhone: ${persisted.phone || "Not provided"}\n\n${summary}`, new Recipient(persisted.email, persisted.full_name)).then(() => "sent" as const).catch((error) => { console.error("Internal notification failed", error instanceof Error ? error.message : "Unknown error"); return "failed" as const; })
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
