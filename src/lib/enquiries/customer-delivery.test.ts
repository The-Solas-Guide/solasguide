import { describe, expect, it } from "vitest";
import { customerAnswerSummary } from "@/lib/enquiries/customer-delivery";

describe("customer enquiry delivery summaries", () => {
  it("keeps legacy v2 answers readable", () => {
    expect(customerAnswerSummary({
      formVersion: 2,
      outcomes: ["rest-reset", "connection"],
      primaryNeed: "practitioner",
      extras: ["venue"],
      timing: "planning",
      location: "ubud",
      group: "solo",
      groupSize: "2",
      modalities: ["yoga"],
      budget: "flexible",
      notes: "Legacy enquiry context.",
    })).toBe([
      "Outcomes: rest-reset, connection",
      "Primary need: practitioner",
      "Optional extras: venue",
      "Timing: planning",
      "Location: ubud",
      "Group: solo (2)",
      "Practices: yoga",
      "Budget: flexible",
      "Additional context: Legacy enquiry context.",
    ].join("\n"));
  });

  it("labels v3 answers for operations", () => {
    expect(customerAnswerSummary({
      formVersion: 3,
      q1: "personal-wellbeing",
      q2: "just-for-me",
      q3: ["stress", "sleep"],
      q4: "planning-ahead",
      q5: "Current context.",
    })).toBe([
      "What brings you to The Solas Guide today?: Personal wellbeing",
      "Who are you looking for?: Just for me",
      "What are you hoping this helps with?: Stress, Sleep",
      "When are you hoping to connect?: Planning ahead",
      "Is there anything else you'd like us to know?: Current context.",
    ].join("\n"));
  });
});
