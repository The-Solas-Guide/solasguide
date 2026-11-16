import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SOLAS_LETTER_SIGNUP_FORM_URL,
  SOLAS_TABLE_WAITLIST_FORM_URL,
  isBusinessWorkshopUpcoming,
  isPlaceholderFormUrl,
  letters,
  membershipBenefits,
  membershipDescription,
  membershipFaqs,
  practiseWhatsAppHref,
  testimonials,
} from "@/lib/membership-content";

const forbidden = [
  "solas-table-guest-contacts",
  "Human Library",
  "27 Sep",
  "27 September",
  "September 27",
  "USD 200",
  "USD $200",
  "$200",
  "wa.me/6285939817503",
  "6281330631030",
  "Manu Ashwalayan",
  "jitesh@solassolas.com",
  "solassolas.com",
  "no newsletter has been sent",
  "has not been emailed",
  "neither letter has been",
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx|ts)$/.test(entry) && !entry.endsWith(".test.ts") ? [path] : [];
  });
}

describe("membership public copy", () => {
  it("keeps guest contacts, the old rate, and unpublished-letter claims out of the page", () => {
    const files = [
      ...sourceFiles(join(process.cwd(), "src/app/membership")),
      ...sourceFiles(join(process.cwd(), "src/components/membership")),
      join(process.cwd(), "src/lib/membership-content.ts"),
      join(process.cwd(), "src/lib/working-in-bali.ts"),
      join(process.cwd(), "src/app/working-in-bali/page.tsx"),
      join(process.cwd(), "src/components/layout/site-footer.tsx"),
    ];
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    for (const phrase of forbidden) {
      expect(source, phrase).not.toContain(phrase);
    }
  });

  it("names the form placeholders in one place and treats the sent letters as past editions", () => {
    expect(SOLAS_TABLE_WAITLIST_FORM_URL).toBe("#table-waitlist-form");
    expect(SOLAS_LETTER_SIGNUP_FORM_URL).toBe("#letter-signup-form");
    expect(isPlaceholderFormUrl(SOLAS_TABLE_WAITLIST_FORM_URL)).toBe(true);
    expect(isPlaceholderFormUrl("https://tally.so/r/example")).toBe(false);
    expect(letters.map((letter) => letter.summary)).toEqual([
      "Past edition · Edition 02 · October 2026 · The business of being a practitioner",
      "Past edition · Edition 01 · September 2026 · The bar is rising",
    ]);
    expect(letters.every((letter) => letter.sent === "Sent to members and non-members.")).toBe(true);
    expect(practiseWhatsAppHref).toBe(
      "https://wa.me/447793050098?text=Hi%20Jitesh%2C%20I%27d%20like%20to%20talk%20about%20practising%20in%20Bali.",
    );
    expect(membershipDescription).toContain("Introductions aren't guaranteed");
    expect(membershipBenefits[1]).toEqual({
      title: "Be put forward for work",
      copy: "Travel advisors, retreat organisers and organisations already come to Solas looking for practitioners, speakers and panellists. Members are considered for these introductions where the fit makes sense. Introductions aren't guaranteed.",
    });
    expect(membershipBenefits[2].title).toBe("Access to Solas Tables");
    expect(membershipBenefits[2].copy).toContain("every 6–8 weeks");
    expect(membershipBenefits[2].copy).not.toMatch(/IDR|USD|free/i);
    expect(JSON.stringify(membershipFaqs)).not.toContain("IDR");
    expect(membershipDescription).toContain("USD 350 a year");
    expect(testimonials.map((item) => item.attribution)).toEqual([
      "Melanie Midegs, Founding Practitioner",
      "Rajiv Arapurakal, Founding Practitioner",
      "Dirk Hamelijnck, Founding Practitioner",
    ]);
  });

  it("keeps the 23 November workshop upcoming until it ends in Bali", () => {
    expect(isBusinessWorkshopUpcoming(new Date("2026-11-15T12:00:00Z"))).toBe(true);
    expect(isBusinessWorkshopUpcoming(new Date("2026-11-23T12:30:00Z"))).toBe(false);
  });
});
