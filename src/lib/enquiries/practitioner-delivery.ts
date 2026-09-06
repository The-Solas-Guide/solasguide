import { Recipient } from "mailersend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTransactionalEmail } from "@/lib/enquiries/delivery-email";
import type { Database } from "@/types/database";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function answerSummary(answers: unknown) {
  if (!isRecord(answers)) return "No additional information provided.";
  return Object.entries(answers)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value || "Not provided")}`)
    .join("\n");
}

export async function processPractitionerExpressionDelivery(
  supabase: SupabaseClient<Database>,
  expressionId: string,
) {
  const stored = await supabase.from("practitioner_expressions_of_interest")
    .select("id, source, full_name, email, phone, contact_preference, practice_name, location, website_url, questionnaire_answers, customer_confirmation_status, internal_notification_status")
    .eq("id", expressionId)
    .single();
  if (stored.error) return { error: "read_failed", deliveryPending: true } as const;

  if (stored.data.source !== "website") return { deliveryPending: false } as const;

  const deliveryClaim = await supabase.rpc("claim_practitioner_expression_delivery", { p_expression_id: expressionId }).single();
  if (deliveryClaim.error) return { error: "claim_failed", deliveryPending: true } as const;

  const persisted = stored.data;
  const customerText = `Hello ${persisted.full_name},\n\nThank you for sharing your expression of interest in joining The Solas Guide. We have received your information and will review it carefully.\n\nThe Solas Guide`;
  const operationsEmail = process.env.SOLAS_OPERATIONS_EMAIL;
  const internalText = [
    `Name: ${persisted.full_name}`,
    `Email: ${persisted.email}`,
    `Phone: ${persisted.phone || "Not provided"}`,
    `Contact preference: ${persisted.contact_preference}`,
    `Practice or business: ${persisted.practice_name || "Not provided"}`,
    `Location: ${persisted.location || "Not provided"}`,
    `Website: ${persisted.website_url || "Not provided"}`,
    "",
    answerSummary(persisted.questionnaire_answers),
  ].join("\n");
  const customerResult = deliveryClaim.data.send_customer
    ? await sendTransactionalEmail([new Recipient(persisted.email, persisted.full_name)], "We have received your Solas Guide expression of interest", customerText, operationsEmail ? new Recipient(operationsEmail, "Solas operations") : undefined)
      .then(() => "sent" as const)
      .catch((error) => { console.error("Practitioner confirmation failed", error instanceof Error ? error.name : "UnknownError"); return "failed" as const; })
    : persisted.customer_confirmation_status;
  const internalResult = deliveryClaim.data.send_internal
    ? operationsEmail
      ? await sendTransactionalEmail([new Recipient(operationsEmail, "Solas operations")], `New practitioner expression of interest from ${persisted.full_name}`, internalText, new Recipient(persisted.email, persisted.full_name))
        .then(() => "sent" as const)
        .catch((error) => { console.error("Practitioner internal notification failed", error instanceof Error ? error.name : "UnknownError"); return "failed" as const; })
      : "failed" as const
    : persisted.internal_notification_status;

  const now = new Date().toISOString();
  const update: Database["public"]["Tables"]["practitioner_expressions_of_interest"]["Update"] = {};
  if (deliveryClaim.data.send_customer) {
    update.customer_confirmation_status = customerResult;
    if (customerResult === "sent") update.customer_confirmation_sent_at = now;
  }
  if (deliveryClaim.data.send_internal) {
    update.internal_notification_status = internalResult;
    if (internalResult === "sent") update.internal_notification_sent_at = now;
  }
  if (Object.keys(update).length > 0) {
    const result = await supabase.from("practitioner_expressions_of_interest").update(update).eq("id", expressionId);
    if (result.error) return { error: "status_update_failed", deliveryPending: true } as const;
  }
  return { deliveryPending: customerResult !== "sent" || internalResult !== "sent" } as const;
}
