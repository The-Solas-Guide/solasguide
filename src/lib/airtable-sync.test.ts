import { describe, expect, it } from "vitest";
import {
  mapCustomerEnquiryToAirtableFields,
  mapPractitionerExpressionToAirtableFields,
} from "@/lib/airtable-sync";
import type { Database } from "@/types/database";

describe("Airtable CRM field mapping", () => {
  it("maps a customer enquiry without CRM-owned fields", () => {
    const fields = mapCustomerEnquiryToAirtableFields({
      airtable_test_record: true,
      consent_confirmed: true,
      consent_given_at: "2026-08-06T00:00:00.000Z",
      contact_preference: "whatsapp",
      created_at: "2026-08-06T00:00:00.000Z",
      customer_confirmation_sent_at: null,
      customer_confirmation_status: "pending",
      email: "maya@example.test",
      full_name: "Maya Test",
      id: "11111111-1111-4111-8111-111111111111",
      internal_notes: "Never project this.",
      internal_notification_sent_at: null,
      internal_notification_status: "pending",
      phone: "+62 812 0000 0000",
      questionnaire_answers: {
        primaryNeed: "practitioner",
        outcomes: ["rest-reset", "connection"],
        extras: ["venue"],
        timing: "dates-known",
        location: "ubud",
        locationDetail: "Near the centre",
        group: "pair",
        modalities: ["yoga", "sound-practice"],
        budget: "flexible",
        notes: "Quiet, restorative options.",
      },
      source: "website",
      status: "new",
      submission_token: "22222222-2222-4222-8222-222222222222",
      updated_at: "2026-08-06T00:00:00.000Z",
    } satisfies Database["public"]["Tables"]["customer_enquiries"]["Row"], true);

    expect(fields).toMatchObject({
      Enquiry: "Maya Test",
      "Source submission ID": "22222222-2222-4222-8222-222222222222",
      Source: "Website enquiry",
      "Contact preference": "WhatsApp",
      "Contact basis": "Inbound response consent",
      "Enquiry type": "Find a practitioner",
      Outcomes: ["Rest/reset", "Connection"],
      Location: "Ubud",
      Practices: ["Yoga", "Sound practice"],
      "Test record": true,
    });
    expect(fields).not.toHaveProperty("Status");
    expect(fields).not.toHaveProperty("Owner");
    expect(fields).not.toHaveProperty("Internal notes");
  });

  it("maps a practitioner expression and marks preview data as test data", () => {
    const fields = mapPractitionerExpressionToAirtableFields({
      airtable_test_record: true,
      consent_confirmed: true,
      consent_given_at: "2026-08-06T00:00:00.000Z",
      contact_preference: "email",
      created_at: "2026-08-06T00:00:00.000Z",
      customer_confirmation_sent_at: null,
      email: "arya@example.test",
      full_name: "Arya Test",
      id: "33333333-3333-4333-8333-333333333333",
      internal_notes: "Never project this.",
      internal_notification_sent_at: null,
      location: "Ubud — Penestanan",
      phone: null,
      practice_name: "Arya Wellness",
      questionnaire_answers: {
        professionalRole: "Somatic practitioner",
        baliRelationship: "based-in-bali",
        area: "ubud",
        locationDetail: "Penestanan",
        practiceAreas: ["bodywork", "other"],
        otherPractice: "Herbal consultation",
        experienceSummary: "A long enough synthetic summary for the CRM mapping test.",
        additionalLinks: ["https://example.test/profile"],
      },
      source: "website",
      status: "new",
      submission_token: "44444444-4444-4444-8444-444444444444",
      updated_at: "2026-08-06T00:00:00.000Z",
      website_url: "https://example.test",
    } satisfies Database["public"]["Tables"]["practitioner_expressions_of_interest"]["Row"], true);

    expect(fields).toMatchObject({
      Practitioner: "Arya Test",
      Source: "Website application",
      "Bali relationship": "Based in Bali",
      Area: "Ubud",
      "Practice areas": ["Bodywork", "Other"],
      "Additional links": "https://example.test/profile",
      "Test record": true,
    });
    expect(fields).not.toHaveProperty("Status");
    expect(fields).not.toHaveProperty("Owner");
    expect(fields).not.toHaveProperty("Internal notes");
  });
});
