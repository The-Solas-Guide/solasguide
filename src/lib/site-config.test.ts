import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("public site metadata configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.resetModules();
  });

  it("keeps homepage metadata scoped to the homepage", async () => {
    const { homepageMetadata, siteDescription, siteTitle } = await import(
      "@/lib/site-config"
    );

    expect(homepageMetadata.alternates).toEqual({ canonical: "/" });
    expect(homepageMetadata.description).toBe(siteDescription);
    // Inherit the full social metadata, including images, from the root layout.
    expect(homepageMetadata.openGraph).toBeUndefined();
    expect(homepageMetadata.twitter).toBeUndefined();
    expect(siteDescription).not.toMatch(/venues|events/i);
    expect(siteDescription).not.toMatch(/Bali/i);
    expect(siteTitle).toBe("The Solas Guide | Curated wellness experiences");
    expect(siteTitle).not.toMatch(/Bali/i);
  });

  it("preserves local URL configuration for local metadata", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    const { getAbsoluteUrl } = await import("@/lib/site-config");

    expect(getAbsoluteUrl("/")).toBe("http://localhost:3000/");
  });
});
