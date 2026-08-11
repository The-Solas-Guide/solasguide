import { describe, expect, it } from "vitest";
import {
  CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
  customerQuestionnaireOptions,
  customerQuestionnaireQuestions,
  isValidWhatsappNumber,
  validateCustomerQuestionnaire,
} from "@/lib/enquiries/customer-questionnaire";

const validAnswers = {
  formVersion: CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
  q1: "personal-wellbeing",
  q2: "just-for-me",
  q3: ["stress", "sleep"],
  q4: "planning-ahead",
  q5: "",
};

describe("customer questionnaire contract", () => {
  it("accepts the approved v3 answer shape", () => {
    expect(validateCustomerQuestionnaire(validAnswers)).toEqual({ data: validAnswers });
  });

  it("accepts an omitted optional Q5 value", () => {
    const withoutQ5 = { ...validAnswers } as Partial<typeof validAnswers>;
    delete withoutQ5.q5;
    expect(validateCustomerQuestionnaire(withoutQ5)).toEqual({ data: validAnswers });
  });

  it("rejects unknown keys and legacy answer fields", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, notes: "legacy" })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, formVersion: 2 })).toMatchObject({ error: expect.any(String) });
  });

  it("requires Q3 to be a unique multi-select array", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: "stress" })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: ["stress", "stress"] })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: ["unknown-option"] })).toMatchObject({ error: expect.any(String) });
  });

  it("normalizes Q3 option order", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: ["sleep", "stress"] })).toEqual({ data: validAnswers });
  });

  it("shares the WhatsApp number validation contract", () => {
    expect(isValidWhatsappNumber("+1 416 555 0100")).toBe(true);
    expect(isValidWhatsappNumber("416-555-0100")).toBe(true);
    expect(isValidWhatsappNumber("abc-123")).toBe(false);
    expect(isValidWhatsappNumber("+1 416")).toBe(false);
    expect(isValidWhatsappNumber("+1 416 555 0100 ext 2")).toBe(false);
  });

  it("keeps the approved option count in the shared contract", () => {
    expect(customerQuestionnaireOptions.q1).toHaveLength(6);
    expect(customerQuestionnaireOptions.q2).toHaveLength(5);
    expect(customerQuestionnaireOptions.q3).toHaveLength(10);
    expect(customerQuestionnaireOptions.q4).toHaveLength(4);
  });

  it("keeps the approved buyer questions and option labels", () => {
    expect(customerQuestionnaireQuestions.map(({ key, selection, title }) => ({ key, selection, title }))).toEqual([
      { key: "q1", selection: "single", title: "What brings you to The Solas Guide today?" },
      { key: "q2", selection: "single", title: "Who are you looking for?" },
      { key: "q3", selection: "multiple", title: "What are you hoping this helps with?" },
      { key: "q4", selection: "single", title: "When are you hoping to connect?" },
      { key: "q5", selection: "free-text", title: "Is there anything else you'd like us to know?" },
    ]);
    expect(Object.values(customerQuestionnaireOptions).map((options) => options.map(({ value, label }) => ({ value, label })))).toEqual([
      [
        { value: "personal-wellbeing", label: "Personal wellbeing" },
        { value: "relationships", label: "Relationships" },
        { value: "family", label: "Family" },
        { value: "leadership", label: "Leadership" },
        { value: "retreat-planning", label: "Retreat planning" },
        { value: "something-else", label: "Something else" },
      ],
      [
        { value: "just-for-me", label: "Just for me" },
        { value: "my-partner", label: "My partner" },
        { value: "my-family", label: "My family" },
        { value: "a-group", label: "A group" },
        { value: "my-organisation", label: "My organisation" },
      ],
      [
        { value: "burnout", label: "Burnout" },
        { value: "relationships", label: "Relationships" },
        { value: "life-transition", label: "Life transition" },
        { value: "stress", label: "Stress" },
        { value: "leadership", label: "Leadership" },
        { value: "parenting", label: "Parenting" },
        { value: "sleep", label: "Sleep" },
        { value: "physical-wellbeing", label: "Physical wellbeing" },
        { value: "spiritual-exploration", label: "Spiritual exploration" },
        { value: "something-else", label: "Something else" },
      ],
      [
        { value: "immediately", label: "Immediately" },
        { value: "next-few-weeks", label: "During the next few weeks" },
        { value: "planning-ahead", label: "Planning ahead" },
        { value: "just-exploring", label: "Just exploring" },
      ],
    ]);
  });
});
