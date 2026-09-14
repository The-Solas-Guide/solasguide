export const CUSTOMER_QUESTIONNAIRE_FORM_VERSION = 4 as const;
export const CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES = 28_000;

export const customerQuestionnaireOptions = {
  q1: [
    { value: "just-me", label: "Just me" },
    { value: "my-partner", label: "My partner" },
    { value: "us-as-a-couple", label: "Us as a couple" },
    { value: "my-child-or-teenager", label: "My child or teenager" },
    { value: "my-family", label: "My family" },
    { value: "a-group", label: "A group" },
    { value: "my-organisation", label: "My organisation" },
    { value: "someone-else", label: "Someone else" },
  ],
  q2: [
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
  q3: [
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
  q4: [
    { value: "as-soon-as-possible", label: "As soon as possible" },
    { value: "during-the-next-few-weeks", label: "During the next few weeks" },
    { value: "in-the-next-few-months", label: "In the next few months" },
    { value: "im-planning-ahead", label: "I’m planning ahead" },
    { value: "just-exploring-for-now", label: "Just exploring for now" },
  ],
} as const;

export const customerQuestionnaireQuestions = [
  {
    key: "q1",
    selection: "single",
    title: "Who are you looking for support for?",
    options: customerQuestionnaireOptions.q1,
  },
  {
    key: "q2",
    selection: "multiple",
    title: "What would you most like support with?",
    help: "Select all that apply.",
    options: customerQuestionnaireOptions.q2,
  },
  {
    key: "q3",
    selection: "multiple",
    title: "Is there anything important about the kind of person or approach you’re looking for?",
    help: "Optional. Select any that matter.",
    options: customerQuestionnaireOptions.q3,
  },
  {
    key: "q4",
    selection: "single",
    title: "When would you ideally like to connect?",
    options: customerQuestionnaireOptions.q4,
  },
  {
    key: "q5",
    selection: "free-text",
    title: "Anything else you’d like us to know?",
  },
] as const;

export type CustomerQuestionKey = keyof typeof customerQuestionnaireOptions;
export type CustomerQuestionnaireQuestionKey = CustomerQuestionKey | "q5";
export type CustomerSingleQuestionKey = "q1" | "q4";
export type CustomerMultipleQuestionKey = "q2" | "q3";
export type CustomerQuestionnaireAnswers = {
  formVersion: typeof CUSTOMER_QUESTIONNAIRE_FORM_VERSION;
  q1: (typeof customerQuestionnaireOptions.q1)[number]["value"];
  q2: Array<(typeof customerQuestionnaireOptions.q2)[number]["value"]>;
  q3: Array<(typeof customerQuestionnaireOptions.q3)[number]["value"]>;
  q4: (typeof customerQuestionnaireOptions.q4)[number]["value"];
  q5: string;
};

const customerQuestionnaireV3Labels: Record<CustomerQuestionKey, Record<string, string>> = {
  q1: {
    "personal-wellbeing": "Personal wellbeing",
    relationships: "Relationships",
    family: "Family",
    leadership: "Leadership",
    "retreat-planning": "Retreat planning",
    "something-else": "Something else",
  },
  q2: {
    "just-for-me": "Just for me",
    "my-partner": "My partner",
    "my-family": "My family",
    "a-group": "A group",
    "my-organisation": "My organisation",
  },
  q3: {
    burnout: "Burnout",
    relationships: "Relationships",
    "life-transition": "Life transition",
    stress: "Stress",
    leadership: "Leadership",
    parenting: "Parenting",
    sleep: "Sleep",
    "physical-wellbeing": "Physical wellbeing",
    "spiritual-exploration": "Spiritual exploration",
    "something-else": "Something else",
  },
  q4: {
    immediately: "Immediately",
    "next-few-weeks": "During the next few weeks",
    "planning-ahead": "Planning ahead",
    "just-exploring": "Just exploring",
  },
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

function normalizeMultipleAnswers(question: CustomerMultipleQuestionKey, value: unknown, required: boolean) {
  const values = value === undefined && !required ? [] : value;
  const options = optionValues(question);
  const order = new Map<string, number>(customerQuestionnaireOptions[question].map((option, index) => [option.value, index]));
  if (
    !Array.isArray(values) ||
    (required && values.length < 1) ||
    values.length > customerQuestionnaireOptions[question].length ||
    values.some((item) => typeof item !== "string" || !options.has(item)) ||
    new Set(values).size !== values.length
  ) {
    return undefined;
  }

  return values
    .filter((item): item is string => typeof item === "string")
    .sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
}

export function customerQuestionnaireLabel(question: CustomerQuestionKey, value: string) {
  return customerQuestionnaireOptions[question].find((option) => option.value === value)?.label
    ?? customerQuestionnaireV3Labels[question][value]
    ?? value;
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
  if (!isSingleAnswer("q4", value.q4)) return { error: "Answer the fourth question." };

  const q2Values = normalizeMultipleAnswers("q2", value.q2, true);
  if (!q2Values) return { error: "Choose at least one area." };

  const q3Values = normalizeMultipleAnswers("q3", value.q3, false);
  if (!q3Values) return { error: "Check the practitioner or approach preferences." };

  const q5 = value.q5 === undefined ? "" : value.q5;
  if (typeof q5 !== "string") return { error: "Check the additional information." };
  if (q5.length > 3_000) return { error: "Shorten the additional information." };

  const data: CustomerQuestionnaireAnswers = {
    formVersion: CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
    q1: value.q1 as CustomerQuestionnaireAnswers["q1"],
    q2: q2Values as CustomerQuestionnaireAnswers["q2"],
    q3: q3Values as CustomerQuestionnaireAnswers["q3"],
    q4: value.q4 as CustomerQuestionnaireAnswers["q4"],
    q5: q5.trim(),
  };
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > CUSTOMER_QUESTIONNAIRE_MAX_ANSWER_BYTES) {
    return { error: "Shorten the additional information." };
  }

  return { data };
}
