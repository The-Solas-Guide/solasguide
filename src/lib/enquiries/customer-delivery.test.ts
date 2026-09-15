import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sendTransactionalEmail: vi.fn() }));
vi.mock("@/lib/enquiries/delivery-email", () => ({ sendTransactionalEmail: mocks.sendTransactionalEmail }));
import { customerAnswerSummary, processCustomerEnquiryDelivery } from "@/lib/enquiries/customer-delivery";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

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

  it("labels v4 answers for operations", () => {
    expect(customerAnswerSummary({
      formVersion: 4,
      q1: "just-me",
      q2: ["relationships", "sleep"],
      q3: ["online"],
      q4: "im-planning-ahead",
      q5: "Current context.",
    })).toBe([
      "Who are you looking for support for?: Just me",
      "What would you most like support with?: Relationships, Sleep",
      "Is there anything important about the kind of person or approach you’re looking for?: Online",
      "When would you ideally like to connect?: I’m planning ahead",
      "Anything else you’d like us to know?: Current context.",
    ].join("\n"));
  });

  it("summarizes programme answers without generic questionnaire labels", () => {
    expect(customerAnswerSummary({
      formVersion: "programme-v1",
      organisation: "Solas Retreats",
      experience: "leadership-team",
      dates: "June 2027",
      intention: "A small leadership retreat.",
    })).toBe([
      "Programme experience: Leadership or team experience",
      "Organisation: Solas Retreats",
      "Dates: June 2027",
      "What they have in mind: A small leadership retreat.",
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

  it("does not resend a successful customer message when the internal message fails", async () => {
    vi.stubEnv("SOLAS_OPERATIONS_EMAIL", "ops@example.test");
    mocks.sendTransactionalEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("provider rejected internal message"))
      .mockResolvedValueOnce(undefined);
    const stored = {
      data: {
        id: "website-id",
        source: "website",
        full_name: "Customer QA",
        email: "customer@example.test",
        phone: "+1 416 555 0100",
        contact_preference: "whatsapp",
        questionnaire_answers: {},
        customer_confirmation_status: "pending",
        internal_notification_status: "pending",
      },
      error: null,
    };
    const single = vi.fn()
      .mockResolvedValueOnce(stored)
      .mockResolvedValueOnce({ ...stored, data: { ...stored.data, customer_confirmation_status: "sent", internal_notification_status: "failed" } });
    const update = vi.fn().mockReturnThis();
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single, update };
    const claimSingle = vi.fn()
      .mockResolvedValueOnce({ data: { send_customer: true, send_internal: true }, error: null })
      .mockResolvedValueOnce({ data: { send_customer: false, send_internal: true }, error: null });
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn().mockReturnValue({ single: claimSingle }) };

    await expect(processCustomerEnquiryDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: true });
    await expect(processCustomerEnquiryDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: false });

    expect(mocks.sendTransactionalEmail).toHaveBeenCalledTimes(3);
    expect(mocks.sendTransactionalEmail.mock.calls[0][1]).toBe("We have received your Solas Guide enquiry");
    expect(mocks.sendTransactionalEmail.mock.calls[0][2]).toBe([
      "Hello Customer QA,",
      "",
      "Thank you. We’ve received your enquiry.",
      "",
      "Someone from Solas will review what you’ve shared and come back to you personally with the practitioners we think may be worth considering.",
      "",
      "The Solas Guide",
    ].join("\n"));
    expect(mocks.sendTransactionalEmail.mock.calls[1][1]).toContain("New Solas enquiry");
    expect(mocks.sendTransactionalEmail.mock.calls[2][1]).toContain("New Solas enquiry");
    expect(update.mock.calls[0][0]).toMatchObject({ customer_confirmation_status: "sent", internal_notification_status: "failed" });
    expect(update.mock.calls[1][0]).toMatchObject({ internal_notification_status: "sent" });
  });
});
