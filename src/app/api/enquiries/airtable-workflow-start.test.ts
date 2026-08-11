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

function duplicateThenExisting(existing: Record<string, unknown>) {
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
          single: vi.fn().mockResolvedValue({ data: existing, error: null }),
        })),
      })),
    });
  return { from };
}

function request(path: string, body: Record<string, unknown>, options: { baseUrl?: string; origin?: string | null; host?: string } = {}) {
  const baseUrl = options.baseUrl || "https://solas.example";
  const url = new URL(baseUrl);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    host: options.host || url.host,
  };
  if (options.origin !== null) headers.origin = options.origin || url.origin;
  return new Request(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const customerSubmission = {
  submissionToken: "22222222-2222-4222-8222-222222222222",
  startedAt: Date.now() - 3_000,
  fullName: "Maya Test",
  email: "maya@example.test",
  phone: "+1 416 555 0100",
  contactPreference: "whatsapp",
  consentConfirmed: true,
  answers: {
    formVersion: 3,
    q1: "personal-wellbeing",
    q2: "just-for-me",
    q3: ["stress"],
    q4: "planning-ahead",
    q5: "",
  },
};

const savedCustomerSubmission = {
  id: "11111111-1111-4111-8111-111111111111",
  full_name: customerSubmission.fullName,
  email: customerSubmission.email,
  phone: customerSubmission.phone,
  contact_preference: customerSubmission.contactPreference,
  consent_confirmed: customerSubmission.consentConfirmed,
  questionnaire_answers: {
    q5: customerSubmission.answers.q5,
    q4: customerSubmission.answers.q4,
    q3: customerSubmission.answers.q3,
    q2: customerSubmission.answers.q2,
    q1: customerSubmission.answers.q1,
    formVersion: customerSubmission.answers.formVersion,
  },
};

describe("form submission workflow startup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://solas.example");
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
      phone: "+1 416 555 0100",
      contactPreference: "whatsapp",
      consentConfirmed: true,
      answers: {
        formVersion: 3,
        q1: "personal-wellbeing",
        q2: "just-for-me",
        q3: ["stress"],
        q4: "planning-ahead",
        q5: "",
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
    mocks.createClient.mockReturnValue(duplicateThenExisting(savedCustomerSubmission));
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", customerSubmission));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, duplicate: true });
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it.each([
    ["name", { fullName: "Edited Maya" }],
    ["phone", { phone: "+1 416 555 0199" }],
    ["email", { email: "edited@example.test" }],
    ["answers", { answers: { ...customerSubmission.answers, q1: "relationships" } }],
  ])("rejects a retry with edited %s content", async (_field, editedContent) => {
    mocks.createClient.mockReturnValue(duplicateThenExisting(savedCustomerSubmission));
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", {
      ...customerSubmission,
      ...editedContent,
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "This enquiry was already saved with different details. Please start a new enquiry.",
    });
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.processCustomerEnquiryDelivery).not.toHaveBeenCalled();
  });

  it("rejects a customer POST without an origin before it can create a record", async () => {
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", customerSubmission, { origin: null }));

    expect(response.status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects a customer POST from an unapproved origin before it can create a record", async () => {
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", customerSubmission, { origin: "https://unapproved.example" }));

    expect(response.status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("allows a same-origin local test request", async () => {
    mocks.createClient.mockReturnValue(insertSucceeds("11111111-1111-4111-8111-111111111111"));
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", customerSubmission, {
      baseUrl: "http://127.0.0.1:3000",
    }));

    expect(response.status).toBe(503);
    expect(mocks.createClient).toHaveBeenCalledOnce();
  });

  it("rejects legacy customer fields and non-WhatsApp contact details", async () => {
    const response = await submitCustomerEnquiry(request("/api/enquiries/customer", {
      submissionToken: "22222222-2222-4222-8222-222222222222",
      startedAt: Date.now() - 3_000,
      fullName: "Maya Test",
      email: "maya@example.test",
      contactPreference: "email",
      consentConfirmed: true,
      answers: {
        formVersion: 2,
        notes: "legacy payload",
      },
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
