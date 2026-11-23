import { describe, expect, it } from "vitest";
import { selectProgrammeSessionLeads } from "@/lib/programme-practitioners";

describe("selectProgrammeSessionLeads", () => {
  it("keeps Sandra, Rajiv and Cherlene in that order", () => {
    const selected = selectProgrammeSessionLeads([
      { name: "Cherlene Wilson" },
      { name: "Indri Hapsari" },
      { name: "Rajiv Arapurakal" },
      { name: "Sandra Echemendia" },
    ]);

    expect(selected.map((practitioner) => practitioner.name)).toEqual([
      "Sandra Echemendia",
      "Rajiv Arapurakal",
      "Cherlene Wilson",
    ]);
  });

  it("does not fill a gap with someone else", () => {
    const selected = selectProgrammeSessionLeads([
      { name: "Sandra Echemendia" },
      { name: "Kartika Alexandra" },
    ]);

    expect(selected.map((practitioner) => practitioner.name)).toEqual(["Sandra Echemendia"]);
  });

  it("skips a first name that matches more than one published profile", () => {
    const selected = selectProgrammeSessionLeads([
      { name: "Sandra Echemendia" },
      { name: "Sandra Other" },
      { name: "Rajiv Arapurakal" },
    ]);

    expect(selected.map((practitioner) => practitioner.name)).toEqual(["Rajiv Arapurakal"]);
  });
});
