import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("public site metadata configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.resetModules();
  });

  it("keeps homepage metadata scoped to the homepage", async () => {
    const { homepageDescription, homepageMetadata, homepageTitle, siteDescription, siteTitle } = await import(
      "@/lib/site-config"
    );

    expect(homepageMetadata.alternates).toEqual({ canonical: "/" });
    expect(homepageMetadata.title).toEqual({ absolute: homepageTitle });
    expect(homepageMetadata.description).toBe(homepageDescription);
    expect(homepageMetadata.openGraph).toMatchObject({
      title: homepageTitle,
      description: homepageDescription,
      url: "/",
      images: [{ url: "/brand/solas-facebook.png" }],
    });
    expect(homepageMetadata.twitter).toMatchObject({
      title: homepageTitle,
      description: homepageDescription,
    });
    expect(homepageTitle).toBe("The Solas Guide | Trusted wellness practitioners and programmes");
    expect(`${homepageTitle} ${homepageDescription}`).not.toMatch(/Bali/i);
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
