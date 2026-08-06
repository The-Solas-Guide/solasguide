import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  after: vi.fn((callback: () => Promise<void>) => { void callback(); }),
  createClient: vi.fn(),
  processCustomerEnquiryDelivery: vi.fn(),
  start: vi.fn(),
}));

vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("workflow/api", () => ({ start: mocks.start }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/enquiries/customer-delivery", () => ({
  processCustomerEnquiryDelivery: mocks.processCustomerEnquiryDelivery,
}));

import { POST as submitCustomerEnquiry } from "@/app/api/enquiries/customer/route";
import { POST as submitPractitionerExpression } from "@/app/api/enquiries/practitioner/route";

function insertSucceeds(id: string) {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id }, error: null }),
        })),
      })),
    })),
  };
}

function duplicateThenExisting(id: string, email: string) {
  const from = vi.fn();
  from
    .mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: "23505" } }),
        })),
      })),
    })
    .mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id, email }, error: null }),
        })),
      })),
    });
  return { from };
}

function request(path: string, body: Record<string, unknown>) {
  return new Request(`https://solas.example${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "https://solas.example",
      host: "solas.example",
    },
    body: JSON.stringify(body),
  });
}

describe("form submission workflow startup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    mocks.processCustomerEnquiryDelivery.mockResolvedValue({ deliveryPending: false });
    mocks.start.mockRejectedValue(new Error("workflow unavailable"));
  });

  it("asks the customer to retry when the saved enquiry cannot start its workflow", async () => {
    mocks.createClient.mockReturnValue(insertSucceeds("11111111-1111-4111-8111-111111111111"));
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", {
      submissionToken: "22222222-2222-4222-8222-222222222222",
      startedAt: Date.now() - 3_000,
      fullName: "Maya Test",
      email: "maya@example.test",
      contactPreference: "email",
      consentConfirmed: true,
      answers: {
        formVersion: 2,
        outcomes: ["rest-reset"],
        primaryNeed: "practitioner",
        extras: [],
        timing: "planning",
        startDate: "",
        endDate: "",
        location: "ubud",
        locationDetail: "",
        group: "solo",
        groupSize: "",
        organizationName: "",
        modalities: ["yoga"],
        budget: "flexible",
        notes: "",
      },
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Your enquiry was saved, but processing could not start. Please try again.",
    });
  });

  it("asks the practitioner to retry when the saved expression cannot start its workflow", async () => {
    mocks.createClient.mockReturnValue(insertSucceeds("33333333-3333-4333-8333-333333333333"));
    const response = await submitPractitionerExpression(request("/api/enquiries/practitioner", {
      submissionToken: "44444444-4444-4444-8444-444444444444",
      startedAt: Date.now() - 3_000,
      fullName: "Arya Test",
      email: "arya@example.test",
      contactPreference: "email",
      consentConfirmed: true,
      practiceName: "Arya Wellness",
      websiteUrl: "https://example.test",
      answers: {
        formVersion: 1,
        professionalRole: "Somatic practitioner",
        baliRelationship: "based-in-bali",
        area: "ubud",
        locationDetail: "Penestanan",
        practiceAreas: ["bodywork"],
        otherPractice: "",
        experienceSummary: "I have supported clients through embodied practice in Bali for more than eight years.",
        additionalLinks: [],
      },
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Your expression of interest was saved, but processing could not start. Please try again.",
    });
  });

  it("restarts processing when a customer retries an already-saved submission", async () => {
    mocks.start.mockResolvedValue({ runId: "wfr_test" });
    mocks.createClient.mockReturnValue(duplicateThenExisting(
      "11111111-1111-4111-8111-111111111111",
      "maya@example.test",
    ));
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", {
      submissionToken: "22222222-2222-4222-8222-222222222222",
      startedAt: Date.now() - 3_000,
      fullName: "Maya Test",
      email: "maya@example.test",
      contactPreference: "email",
      consentConfirmed: true,
      answers: {
        formVersion: 2,
        outcomes: ["rest-reset"],
        primaryNeed: "practitioner",
        extras: [],
        timing: "planning",
        startDate: "",
        endDate: "",
        location: "ubud",
        locationDetail: "",
        group: "solo",
        groupSize: "",
        organizationName: "",
        modalities: ["yoga"],
        budget: "flexible",
        notes: "",
      },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, duplicate: true });
    expect(mocks.start).toHaveBeenCalledOnce();
  });
});
