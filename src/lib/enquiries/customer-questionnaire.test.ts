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
  q1: "just-me",
  q2: ["stress-emotional-wellbeing", "sleep"],
  q3: ["online"],
  q4: "im-planning-ahead",
  q5: "",
};

describe("customer questionnaire contract", () => {
  it("accepts the approved v4 answer shape", () => {
    expect(validateCustomerQuestionnaire({
      ...validAnswers,
      q2: ["stress-emotional-wellbeing", "sleep"],
    })).toEqual({ data: validAnswers });
  });

  it("accepts an omitted optional Q5 value", () => {
    const withoutQ5 = { ...validAnswers } as Partial<typeof validAnswers>;
    delete withoutQ5.q5;
    expect(validateCustomerQuestionnaire(withoutQ5)).toEqual({ data: validAnswers });
  });

  it("accepts an empty optional Q3 array", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: [] })).toEqual({
      data: { ...validAnswers, q3: [] },
    });
  });

  it("accepts an omitted optional Q3 value", () => {
    const withoutQ3 = { ...validAnswers } as Partial<typeof validAnswers>;
    delete withoutQ3.q3;
    expect(validateCustomerQuestionnaire(withoutQ3)).toEqual({
      data: { ...validAnswers, q3: [] },
    });
  });

  it("rejects unknown keys and legacy answer fields", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, notes: "legacy" })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, formVersion: 3 })).toMatchObject({ error: expect.any(String) });
  });

  it("requires Q2 to be a unique multi-select array", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, q2: "sleep" })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q2: [] })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q2: ["sleep", "sleep"] })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q2: ["unknown-option"] })).toMatchObject({ error: expect.any(String) });
  });

  it("requires Q3 to be a unique multi-select array when present", () => {
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: "online" })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: ["online", "online"] })).toMatchObject({ error: expect.any(String) });
    expect(validateCustomerQuestionnaire({ ...validAnswers, q3: ["unknown-option"] })).toMatchObject({ error: expect.any(String) });
  });

  it("normalizes Q2 and Q3 option order", () => {
    expect(validateCustomerQuestionnaire({
      ...validAnswers,
      q2: ["sleep", "stress-emotional-wellbeing"],
      q3: ["open-to-different-approaches", "online"],
    })).toEqual({
      data: {
        ...validAnswers,
        q3: ["online", "open-to-different-approaches"],
      },
    });
  });

  it("shares the WhatsApp number validation contract", () => {
    expect(isValidWhatsappNumber("+1 416 555 0100")).toBe(true);
    expect(isValidWhatsappNumber("416-555-0100")).toBe(true);
    expect(isValidWhatsappNumber("abc-123")).toBe(false);
    expect(isValidWhatsappNumber("+1 416")).toBe(false);
    expect(isValidWhatsappNumber("+1 416 555 0100 ext 2")).toBe(false);
  });

  it("keeps the approved option count in the shared contract", () => {
    expect(customerQuestionnaireOptions.q1).toHaveLength(8);
    expect(customerQuestionnaireOptions.q2).toHaveLength(14);
    expect(customerQuestionnaireOptions.q3).toHaveLength(10);
    expect(customerQuestionnaireOptions.q4).toHaveLength(5);
  });

  it("keeps the approved buyer questions and option labels", () => {
    expect(customerQuestionnaireQuestions.map(({ key, selection, title }) => ({ key, selection, title }))).toEqual([
      { key: "q1", selection: "single", title: "Who are you looking for support for?" },
      { key: "q2", selection: "multiple", title: "What would you most like support with?" },
      { key: "q3", selection: "multiple", title: "Is there anything important about the kind of person or approach you’re looking for?" },
      { key: "q4", selection: "single", title: "When would you ideally like to connect?" },
      { key: "q5", selection: "free-text", title: "Anything else you’d like us to know?" },
    ]);
    expect(Object.values(customerQuestionnaireOptions).map((options) => options.map(({ value, label }) => ({ value, label })))).toEqual([
      [
        { value: "just-me", label: "Just me" },
        { value: "my-partner", label: "My partner" },
        { value: "us-as-a-couple", label: "Us as a couple" },
        { value: "my-child-or-teenager", label: "My child or teenager" },
        { value: "my-family", label: "My family" },
        { value: "a-group", label: "A group" },
        { value: "my-organisation", label: "My organisation" },
        { value: "someone-else", label: "Someone else" },
      ],
      [
        { value: "relationships", label: "Relationships" },
        { value: "family-parenting", label: "Family & parenting" },
        { value: "stress-emotional-wellbeing", label: "Stress & emotional wellbeing" },
        { value: "anxiety", label: "Anxiety" },
        { value: "burnout", label: "Burnout" },
        { value: "life-transition", label: "Life transition" },
        { value: "purpose-personal-growth", label: "Purpose & personal growth" },
        { value: "leadership", label: "Leadership" },
        { value: "physical-wellbeing", label: "Physical wellbeing" },
        { value: "sleep", label: "Sleep" },
        { value: "trauma-difficult-experiences", label: "Trauma & difficult experiences" },
        { value: "mens-wellbeing", label: "Men’s wellbeing" },
        { value: "womens-wellbeing", label: "Women’s wellbeing" },
        { value: "something-else", label: "Something else" },
      ],
      [
        { value: "male-practitioner", label: "Male practitioner" },
        { value: "female-practitioner", label: "Female practitioner" },
        { value: "in-person-in-bali", label: "In-person in Bali" },
        { value: "online", label: "Online" },
        { value: "clinical-therapeutic-approach", label: "Clinical / therapeutic approach" },
        { value: "coaching-developmental-approach", label: "Coaching / developmental approach" },
        { value: "body-based-somatic-work", label: "Body-based / somatic work" },
        { value: "spiritual-or-contemplative-work", label: "Spiritual or contemplative work" },
        { value: "open-to-different-approaches", label: "Open to different approaches" },
        { value: "not-sure-id-like-solas-to-guide-me", label: "Not sure — I’d like Solas to guide me" },
      ],
      [
        { value: "as-soon-as-possible", label: "As soon as possible" },
        { value: "during-the-next-few-weeks", label: "During the next few weeks" },
        { value: "in-the-next-few-months", label: "In the next few months" },
        { value: "im-planning-ahead", label: "I’m planning ahead" },
        { value: "just-exploring-for-now", label: "Just exploring for now" },
      ],
    ]);
  });
});
