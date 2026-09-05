import { describe, expect, it, vi } from "vitest";
import { customerAnswerSummary, processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";

describe("customer enquiry delivery summaries", () => {
  it("keeps legacy v2 answers readable", () => {
    expect(customerAnswerSummary({
      formVersion: 2,
      outcomes: ["rest-reset", "connection"],
      primaryNeed: "practitioner",
      extras: ["venue"],
      timing: "planning",
      location: "ubud",
      group: "solo",
      groupSize: "2",
      modalities: ["yoga"],
      budget: "flexible",
      notes: "Legacy enquiry context.",
    })).toBe([
      "Outcomes: rest-reset, connection",
      "Primary need: practitioner",
      "Optional extras: venue",
      "Timing: planning",
      "Location: ubud",
      "Group: solo (2)",
      "Practices: yoga",
      "Budget: flexible",
      "Additional context: Legacy enquiry context.",
    ].join("\n"));
  });

  it("labels v3 answers for operations", () => {
    expect(customerAnswerSummary({
      formVersion: 3,
      q1: "personal-wellbeing",
      q2: "just-for-me",
      q3: ["stress", "sleep"],
      q4: "planning-ahead",
      q5: "Current context.",
    })).toBe([
      "What brings you to The Solas Guide today?: Personal wellbeing",
      "Who are you looking for?: Just for me",
      "What are you hoping this helps with?: Stress, Sleep",
      "When are you hoping to connect?: Planning ahead",
      "Is there anything else you'd like us to know?: Current context.",
    ].join("\n"));
  });
});


describe("manual enquiry delivery protection", () => {
  it("never claims delivery or changes pending state for an admin-created record", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "manual-id", source: "admin", customer_confirmation_status: "pending", internal_notification_status: "pending" }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single };
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn() };
    const result = await processCustomerEnquiryDelivery(client as unknown as Parameters<typeof processCustomerEnquiryDelivery>[0], "manual-id");
    expect(result).toEqual({ deliveryPending: false });
    expect(client.rpc).not.toHaveBeenCalled();
    expect(client.from).toHaveBeenCalledOnce();
  });
  it("still claims delivery for website submissions", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "website-id", source: "website", full_name: "QA", email: "qa@example.test", questionnaire_answers: {}, customer_confirmation_status: "sent", internal_notification_status: "sent" }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single };
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { send_customer: false, send_internal: false }, error: null }) }) };
    expect(await processCustomerEnquiryDelivery(client as unknown as Parameters<typeof processCustomerEnquiryDelivery>[0], "website-id")).toEqual({ deliveryPending: false });
    expect(client.rpc).toHaveBeenCalledWith("claim_customer_enquiry_delivery", { p_enquiry_id: "website-id" });
  });
});
