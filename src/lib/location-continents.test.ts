import { describe, expect, it } from "vitest";
import {
  derivePublicContinents,
  formatPublicContinents,
  internalsForContinent,
  isValidLocationFilterSlug,
  matchesLocationFilterSlugs,
  prepareLocationSearch,
} from "@/lib/location-continents";

function names(internalSlugs: readonly string[]) {
  return formatPublicContinents(derivePublicContinents(internalSlugs).continents);
}

describe("country to public continent mapping", () => {
  it("maps founding-cohort internals to the approved public labels", () => {
    expect(names(["bali"])).toBe("Southeast Asia");
    expect(names(["bali", "indonesia"])).toBe("Southeast Asia");
    expect(names(["bali", "italy"])).toBe(
      "Southeast Asia · Europe · Willing to travel",
    );
    expect(names(["bali", "netherlands"])).toBe(
      "Southeast Asia · Europe · Willing to travel",
    );
    expect(names(["bali", "international"])).toBe(
      "Southeast Asia · International",
    );
    expect(names(["bali", "switzerland", "international"])).toBe(
      "Southeast Asia · Europe · International · Willing to travel",
    );
    expect(
      names(["indonesia", "singapore", "portugal", "kenya", "uk"]),
    ).toBe("Southeast Asia · Europe · Africa · Willing to travel");
  });

  it("omits unmapped internals instead of leaking them", () => {
    const derived = derivePublicContinents(["bali", "ubud"]);
    expect(formatPublicContinents(derived.continents)).toBe("Southeast Asia");
    expect(derived.unmapped).toEqual(["ubud"]);
  });

  it("keeps already-derived public continents stable", () => {
    expect(names(["southeast-asia", "europe"])).toBe(
      "Southeast Asia · Europe · Willing to travel",
    );
  });

  it("does not invent Asia members or travel from International alone", () => {
    expect(names(["international"])).toBe("International");
    expect(derivePublicContinents(["bali"]).continents.map((item) => item.slug)).toEqual([
      "southeast-asia",
    ]);
  });

  it("expands continent filters to country slugs and keeps Bali searchable", () => {
    expect(internalsForContinent("southeast-asia")).toEqual([
      "bali",
      "indonesia",
      "singapore",
    ]);
    expect(prepareLocationSearch(["southeast-asia"])).toEqual({
      rpcSlugs: ["bali", "indonesia", "singapore"],
      postFilter: false,
    });
    expect(prepareLocationSearch(["bali"])).toEqual({
      rpcSlugs: ["bali"],
      postFilter: false,
    });
    expect(prepareLocationSearch(["willing-to-travel"])).toEqual({
      rpcSlugs: [],
      postFilter: true,
    });
    expect(prepareLocationSearch(["asia"])).toEqual({
      rpcSlugs: ["__no-public-continent-match__"],
      postFilter: false,
    });
    expect(isValidLocationFilterSlug("bali")).toBe(true);
    expect(isValidLocationFilterSlug("southeast-asia")).toBe(true);
    expect(isValidLocationFilterSlug("ubud")).toBe(false);
  });

  it("matches hidden country slugs and public continents independently", () => {
    expect(
      matchesLocationFilterSlugs(
        ["southeast-asia"],
        ["bali"],
        ["bali"],
      ),
    ).toBe(true);
    expect(
      matchesLocationFilterSlugs(
        ["southeast-asia"],
        ["bali"],
        ["southeast-asia"],
      ),
    ).toBe(true);
    expect(
      matchesLocationFilterSlugs(
        ["southeast-asia"],
        ["bali"],
        ["europe"],
      ),
    ).toBe(false);
    expect(
      matchesLocationFilterSlugs(
        ["southeast-asia", "europe", "willing-to-travel"],
        ["bali", "italy"],
        ["willing-to-travel"],
      ),
    ).toBe(true);
  });
});
