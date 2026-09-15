import { describe, expect, it } from "vitest";
import {
  PROGRAMME_FORM_VERSION,
  programmeExperienceLabel,
  validateProgrammeEnquiryAnswers,
} from "@/lib/enquiries/programme-enquiry";

describe("programme enquiry answers", () => {
  const validAnswers = {
    organisation: "Solas Retreats",
    experience: "retreat",
    dates: "June 2027",
    intention: "We are planning a restorative group retreat.",
  } as const;

  it("normalizes the standalone programme answers", () => {
    expect(validateProgrammeEnquiryAnswers(validAnswers)).toEqual({
      data: { formVersion: PROGRAMME_FORM_VERSION, ...validAnswers },
    });
  });

  it("rejects generic questionnaire fields and invalid experience values", () => {
    expect(validateProgrammeEnquiryAnswers({ ...validAnswers, q1: "personal-wellbeing" })).toMatchObject({ error: expect.any(String) });
    expect(validateProgrammeEnquiryAnswers({ ...validAnswers, experience: "unknown" })).toMatchObject({ error: expect.any(String) });
  });

  it("requires a concise intention", () => {
    expect(validateProgrammeEnquiryAnswers({ ...validAnswers, intention: "" })).toMatchObject({ error: expect.any(String) });
    expect(validateProgrammeEnquiryAnswers({ ...validAnswers, organisation: "x".repeat(201) })).toMatchObject({ error: expect.any(String) });
  });

  it("provides the public option label", () => {
    expect(programmeExperienceLabel("leadership-team")).toBe("Leadership or team experience");
  });
});
