export const PROGRAMME_FORM_VERSION = "programme-v1" as const;
export const PROGRAMME_MAX_ANSWER_BYTES = 28_000;

export const programmeExperienceOptions = [
  { value: "retreat", label: "Retreat" },
  { value: "leadership-team", label: "Leadership or team experience" },
  { value: "private-group", label: "Private group experience" },
  { value: "hotel-guest", label: "Hotel or guest programme" },
  { value: "other", label: "Something else" },
] as const;

export type ProgrammeExperience = (typeof programmeExperienceOptions)[number]["value"];
export type ProgrammeEnquiryAnswers = {
  formVersion: typeof PROGRAMME_FORM_VERSION;
  organisation: string;
  experience: ProgrammeExperience;
  dates: string;
  intention: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function programmeExperienceLabel(value: string) {
  return programmeExperienceOptions.find((option) => option.value === value)?.label ?? value;
}

export function validateProgrammeEnquiryAnswers(value: unknown): { data?: ProgrammeEnquiryAnswers; error?: string } {
  if (!isRecord(value)) return { error: "The programme enquiry could not be read." };
  const allowedKeys = new Set(["organisation", "experience", "dates", "intention"]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) return { error: "The programme enquiry contains an unexpected field." };

  const organisation = typeof value.organisation === "string" ? value.organisation.trim() : "";
  const dates = typeof value.dates === "string" ? value.dates.trim() : "";
  const intention = typeof value.intention === "string" ? value.intention.trim() : "";
  const experience = value.experience;
  if (organisation.length > 200) return { error: "Shorten your organisation name." };
  if (dates.length > 200) return { error: "Shorten the dates." };
  if (typeof experience !== "string" || !programmeExperienceOptions.some((option) => option.value === experience)) return { error: "Choose the type of experience you are planning." };
  if (!intention || intention.length > 3_000) return { error: "Tell us what you have in mind." };

  const data: ProgrammeEnquiryAnswers = {
    formVersion: PROGRAMME_FORM_VERSION,
    organisation,
    experience: experience as ProgrammeExperience,
    dates,
    intention,
  };
  if (new TextEncoder().encode(JSON.stringify(data)).byteLength > PROGRAMME_MAX_ANSWER_BYTES) return { error: "Shorten the information you provided." };
  return { data };
}
