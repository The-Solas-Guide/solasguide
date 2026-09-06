import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sendTransactionalEmail: vi.fn() }));
vi.mock("@/lib/enquiries/delivery-email", () => ({ sendTransactionalEmail: mocks.sendTransactionalEmail }));
import { processPractitionerExpressionDelivery } from "@/lib/enquiries/practitioner-delivery";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

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
    const stored = {
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
    };
    const single = vi.fn()
      .mockResolvedValueOnce(stored)
      .mockResolvedValueOnce({ ...stored, data: { ...stored.data, customer_confirmation_status: "sent", internal_notification_status: "failed" } });
    const claimSingle = vi.fn().mockResolvedValue({ data: { send_customer: false, send_internal: false }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single };
    const client = { from: vi.fn().mockReturnValue(query), rpc: vi.fn().mockReturnValue({ single: claimSingle }) };

    await expect(processPractitionerExpressionDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: false });
    expect(client.rpc).toHaveBeenCalledWith("claim_practitioner_expression_delivery", { p_expression_id: "website-id" });
  });

  it("does not resend a successful practitioner message when the internal message fails", async () => {
    vi.stubEnv("SOLAS_OPERATIONS_EMAIL", "ops@example.test");
    mocks.sendTransactionalEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("provider rejected internal message"))
      .mockResolvedValueOnce(undefined);
    const stored = {
      data: {
        id: "website-id",
        source: "website",
        full_name: "Practitioner QA",
        email: "practitioner@example.test",
        phone: "+1 416 555 0100",
        contact_preference: "email",
        practice_name: "QA Practice",
        location: "Ubud",
        website_url: "https://example.test",
        questionnaire_answers: { professionalRole: "Practitioner" },
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

    await expect(processPractitionerExpressionDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: true });
    await expect(processPractitionerExpressionDelivery(client as never, "website-id")).resolves.toEqual({ deliveryPending: false });

    expect(mocks.sendTransactionalEmail).toHaveBeenCalledTimes(3);
    expect(mocks.sendTransactionalEmail.mock.calls[0][1]).toBe("We have received your Solas Guide expression of interest");
    expect(mocks.sendTransactionalEmail.mock.calls[1][1]).toContain("New practitioner expression");
    expect(mocks.sendTransactionalEmail.mock.calls[2][1]).toContain("New practitioner expression");
    expect(update.mock.calls[0][0]).toMatchObject({ customer_confirmation_status: "sent", internal_notification_status: "failed" });
    expect(update.mock.calls[1][0]).toMatchObject({ internal_notification_status: "sent" });
  });
});
