import { describe, expect, it } from "vitest";
import {
  applyEnquiryContext,
  askSolasHref,
  enquiryContextNote,
  formatAvailability,
  makeAnEnquiry,
  needHelpChoosing,
} from "./public-journeys";

describe("public journeys", () => {
  it("keeps Need Help Choosing on the questionnaire form", () => {
    expect(needHelpChoosing).toEqual({
      label: "Need Help Choosing?",
      href: "/find-a-match",
    });
  });

  it("sends Make an Enquiry to the professional path", () => {
    expect(makeAnEnquiry).toEqual({
      label: "Make an Enquiry",
      href: "/find-a-match?intent=professional",
    });
  });

  it("includes the practitioner name when asking Solas from a profile", () => {
    expect(askSolasHref("Kartika Alexandra")).toBe(
      "/find-a-match?practitioner=Kartika%20Alexandra",
    );
    expect(askSolasHref("  ")).toBe("/find-a-match");
  });

  it("builds the enquiry context note for professional and profile sources", () => {
    expect(
      enquiryContextNote({ intent: "professional", practitionerName: "Indri Hapsari" }),
    ).toBe("Professional / tailored enquiry. Interested in speaking with Indri Hapsari.");
    expect(enquiryContextNote({ practitionerName: "Sandra Echemendia" })).toBe(
      "Interested in speaking with Sandra Echemendia.",
    );
  });

  it("does not duplicate an existing enquiry context note", () => {
    const note = "Interested in speaking with Kartika Alexandra.";
    expect(applyEnquiryContext(note, note)).toBe(note);
    expect(applyEnquiryContext("Planning a retreat.", note)).toBe(
      "Interested in speaking with Kartika Alexandra. Planning a retreat.",
    );
  });

  it("formats availability the way the profile brief shows it", () => {
    expect(formatAvailability(["In-person", "Online"])).toBe("In person · Online");
  });
});
