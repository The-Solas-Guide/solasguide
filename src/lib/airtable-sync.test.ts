import { describe, expect, it } from "vitest";
import {
  mapCustomerEnquiryToAirtableFields,
  mapPractitionerExpressionToAirtableFields,
} from "@/lib/airtable-sync";
import type { Database } from "@/types/database";

describe("Airtable CRM field mapping", () => {
  it("maps a customer enquiry without CRM-owned fields", () => {
    const fields = mapCustomerEnquiryToAirtableFields({
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
      fld2fImnmsiTB08t9: "Maya Test",
      fldRP8toFgdJeCeVM: "22222222-2222-4222-8222-222222222222",
      fldUi0FIp19ZBfG9k: "Website enquiry",
      fldsKjxRIb5qd14D9: "WhatsApp",
      fldW85hHxJpu58BA1: "Inbound response consent",
      fldyfyJ7hoApBBNJb: "Find a practitioner",
      fldc7VCFABFbqkkRH: ["Rest/reset", "Connection"],
      fldPOBRl9ieG2LYz1: "Ubud",
      fldU2iJgWyQe9wqN3: ["Yoga", "Sound practice"],
      fldEN7U0OR9bF1e2s: true,
    });
    expect(fields).not.toHaveProperty("Enquiry");
    expect(fields).not.toHaveProperty("Source submission ID");
    expect(fields).not.toHaveProperty("Status");
    expect(fields).not.toHaveProperty("Owner");
    expect(fields).not.toHaveProperty("Internal notes");
  });

  it("maps a practitioner expression and marks preview data as test data", () => {
    const fields = mapPractitionerExpressionToAirtableFields({
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
      fldnbgdhPg6RsqcSA: "Arya Test",
      fldL0zDMxM4bNWmDI: "Website application",
      fldv5bJcsRzxXvLfB: "Based in Bali",
      fldSaMEGJTeOnCEbG: "Ubud",
      fldWLUgMlf1q2r0rZ: ["Bodywork", "Other"],
      fldpsfJwp0ISwhK17: "https://example.test/profile",
      fld09slG4dal3PjYs: true,
    });
    expect(fields).not.toHaveProperty("Practitioner");
    expect(fields).not.toHaveProperty("Source submission ID");
    expect(fields).not.toHaveProperty("Status");
    expect(fields).not.toHaveProperty("Owner");
    expect(fields).not.toHaveProperty("Internal notes");
  });
});
