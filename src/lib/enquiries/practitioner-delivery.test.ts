import { describe, expect, it, vi } from "vitest";
import { processPractitionerExpressionDelivery } from "@/lib/enquiries/practitioner-delivery";

describe("practitioner expression delivery protection", () => {
  it("does not claim delivery for a manual record", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "manual-id", source: "admin", customer_confirmation_status: "pending", internal_notification_status: "pending" },
      error: null,
    });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single };
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn() };

    await expect(processPractitionerExpressionDelivery(client as never, "manual-id")).resolves.toEqual({ deliveryPending: false });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("claims website delivery without sending when both statuses are already sent", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "website-id",
        source: "website",
        full_name: "Practitioner QA",
        email: "qa@example.test",
        questionnaire_answers: {},
        customer_confirmation_status: "sent",
        internal_notification_status: "sent",
      },
      error: null,
    });
    const claimSingle = vi.fn().mockResolvedValue({ data: { send_customer: false, send_internal: false }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single };
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn().mockReturnValue({ single: claimSingle }) };

    await expect(processPractitionerExpressionDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: false });
    expect(client.rpc).toHaveBeenCalledWith("claim_practitioner_expression_delivery", { p_expression_id: "website-id" });
  });
});
