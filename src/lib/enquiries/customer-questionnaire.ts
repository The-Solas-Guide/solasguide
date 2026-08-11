export const CUSTOMER_QUESTIONNAIRE_FORM_VERSION = 3 as const;
export const CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES = 28_000;

export const customerQuestionnaireOptions = {
  q1: [
    { value: "personal-wellbeing", label: "Personal wellbeing" },
    { value: "relationships", label: "Relationships" },
    { value: "family", label: "Family" },
    { value: "leadership", label: "Leadership" },
    { value: "retreat-planning", label: "Retreat planning" },
    { value: "something-else", label: "Something else" },
  ],
  q2: [
    { value: "just-for-me", label: "Just for me" },
    { value: "my-partner", label: "My partner" },
    { value: "my-family", label: "My family" },
    { value: "a-group", label: "A group" },
    { value: "my-organisation", label: "My organisation" },
  ],
  q3: [
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
  q4: [
    { value: "immediately", label: "Immediately" },
    { value: "next-few-weeks", label: "During the next few weeks" },
    { value: "planning-ahead", label: "Planning ahead" },
    { value: "just-exploring", label: "Just exploring" },
  ],
} as const;

export const customerQuestionnaireQuestions = [
  {
    key: "q1",
    selection: "single",
    title: "What brings you to The Solas Guide today?",
    options: customerQuestionnaireOptions.q1,
  },
  {
    key: "q2",
    selection: "single",
    title: "Who are you looking for?",
    options: customerQuestionnaireOptions.q2,
  },
  {
    key: "q3",
    selection: "multiple",
    title: "What are you hoping this helps with?",
    options: customerQuestionnaireOptions.q3,
  },
  {
    key: "q4",
    selection: "single",
    title: "When are you hoping to connect?",
    options: customerQuestionnaireOptions.q4,
  },
  {
    key: "q5",
    selection: "free-text",
    title: "Is there anything else you'd like us to know?",
  },
] as const;

export type CustomerQuestionKey = keyof typeof customerQuestionnaireOptions;
export type CustomerQuestionnaireQuestionKey = CustomerQuestionKey | "q5";
export type CustomerSingleQuestionKey = "q1" | "q2" | "q4";
export type CustomerMultipleQuestionKey = "q3";
export type CustomerQuestionnaireAnswers = {
  formVersion: typeof CUSTOMER_QUESTIONNAIRE_FORM_VERSION;
  q1: (typeof customerQuestionnaireOptions.q1)[number]["value"];
  q2: (typeof customerQuestionnaireOptions.q2)[number]["value"];
  q3: Array<(typeof customerQuestionnaireOptions.q3)[number]["value"]>;
  q4: (typeof customerQuestionnaireOptions.q4)[number]["value"];
  q5: string;
};

export function isValidWhatsappNumber(value: string) {
  return value.length >= 7 && value.length <= 50 && /^[+0-9][0-9\s().-]*$/.test(value) && (value.match(/\d/g) || []).length >= 7;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionValues(question: CustomerQuestionKey) {
  return new Set<string>(customerQuestionnaireOptions[question].map((option) => option.value));
}

function isSingleAnswer(question: CustomerSingleQuestionKey, value: unknown): value is string {
  return typeof value === "string" && optionValues(question).has(value);
}

export function customerQuestionnaireLabel(question: CustomerQuestionKey, value: string) {
  return customerQuestionnaireOptions[question].find((option) => option.value === value)?.label ?? value;
}

export function validateCustomerQuestionnaire(value: unknown): {
  data?: CustomerQuestionnaireAnswers;
  error?: string;
} {
  if (!isRecord(value)) return { error: "The questionnaire could not be read." };

  const allowedKeys = new Set(["formVersion", "q1", "q2", "q3", "q4", "q5"]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
    return { error: "The questionnaire contains an unexpected field." };
  }
  if (value.formVersion !== CUSTOMER_QUESTIONNAIRE_FORM_VERSION) {
    return { error: "Refresh the page and try again." };
  }
  if (!isSingleAnswer("q1", value.q1)) return { error: "Answer the first question." };
  if (!isSingleAnswer("q2", value.q2)) return { error: "Answer the second question." };
  if (!isSingleAnswer("q4", value.q4)) return { error: "Answer the fourth question." };

  const q3Values = value.q3;
  const q3Options = optionValues("q3");
  const q3Order = new Map<string, number>(customerQuestionnaireOptions.q3.map((option, index) => [option.value, index]));
  if (
    !Array.isArray(q3Values) ||
    q3Values.length < 1 ||
    q3Values.length > customerQuestionnaireOptions.q3.length ||
    q3Values.some((item) => typeof item !== "string" || !q3Options.has(item)) ||
    new Set(q3Values).size !== q3Values.length
  ) {
    return { error: "Choose at least one area." };
  }

  const q5 = value.q5 === undefined ? "" : value.q5;
  if (typeof q5 !== "string") return { error: "Check the additional information." };
  if (q5.length > 3_000) return { error: "Shorten the additional information." };

  const data: CustomerQuestionnaireAnswers = {
    formVersion: CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
    q1: value.q1 as CustomerQuestionnaireAnswers["q1"],
    q2: value.q2 as CustomerQuestionnaireAnswers["q2"],
    q3: q3Values.filter((item): item is string => typeof item === "string")
      .sort((left, right) => (q3Order.get(left) ?? 0) - (q3Order.get(right) ?? 0)) as CustomerQuestionnaireAnswers["q3"],
    q4: value.q4 as CustomerQuestionnaireAnswers["q4"],
    q5: q5.trim(),
  };
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES) {
    return { error: "Shorten the additional information." };
  }

  return { data };
}
