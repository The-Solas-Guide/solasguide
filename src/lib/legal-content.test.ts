import { describe, expect, it } from "vitest";
import { legalPlaceholders, privacySections, termsSections } from "@/lib/legal-content";

const text = JSON.stringify({ privacySections, termsSections });

describe("legal pages", () => {
  it("marks unknown operator details instead of inventing them", () => {
    for (const placeholder of legalPlaceholders) {
      expect(text).toContain(placeholder);
    }
    expect(text).not.toMatch(/\b(Jl\.|Street|Road|Suite)\b/);
    expect(text).not.toContain("governed by the laws of");
    expect(text).not.toContain("jitesh@");
    expect(text).not.toContain("operations@example.com");
    expect(text).not.toContain("22 seats");
  });

  it("describes the services the website actually uses", () => {
    expect(text).toContain("Supabase");
    expect(text).toContain("Vercel");
    expect(text).toContain("MailerSend");
    expect(text).toContain("Airtable");
    expect(text).toContain("Tally");
    expect(text).toContain("Cal.com");
    expect(text).toContain("WhatsApp");
    expect(text).toContain("Law No. 27 of 2022");
    expect(text).toContain("non-refundable");
    expect(text).toContain("Introductions are not guaranteed");
  });
});
