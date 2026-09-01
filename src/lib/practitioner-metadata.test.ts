import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Practitioner } from "@/lib/practitioners";

const basePractitioner: Practitioner = {
  id: "profile-1",
  slug: "kartika-alexandra",
  name: "Kartika Alexandra",
  descriptor: "Integrative hypnotherapist",
  modalities: ["Integrative hypnotherapy"],
  summary: "Works with subconscious patterns and nervous-system regulation.",
  about: "A published profile description.",
  areasOfSupport: ["Trauma & nervous system"],
  approaches: ["Therapy & counselling"],
  worksWith: ["Individuals"],
  languages: ["English"],
  delivery: ["In-person", "Online"],
  image: "https://images.example.test/kartika.webp",
  imageAlt: "Kartika Alexandra portrait",
  websiteUrl: "https://www.kartikaalexandra.com/",
  instagramUrl: "https://www.instagram.com/kartikaalexandra/",
  offersInPerson: true,
  offersOnline: true,
  terms: [
    {
      id: "area-1",
      type: "support_area",
      name: "Trauma & nervous system",
      slug: "trauma-and-nervous-system",
      sortOrder: 10,
      displayOrder: 0,
    },
    {
      id: "location-1",
      type: "location",
      name: "Bali",
      slug: "bali",
      sortOrder: 10,
      displayOrder: 1,
    },
  ],
  hasPublishedProfile: true,
};

describe("public practitioner metadata", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://guide.example.test/");
  });

  it("builds an absolute canonical directory URL without query filters", async () => {
    const { getDirectoryMetadata } = await import("@/lib/practitioner-metadata");
    const metadata = getDirectoryMetadata();

    expect(metadata.alternates?.canonical).toBe(
      "https://guide.example.test/practitioners",
    );
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://guide.example.test/practitioners",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("falls back to localhost for an invalid public origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a URL");
    const { getAbsoluteUrl, getAppUrl } = await import(
      "@/lib/practitioner-metadata"
    );

    expect(getAppUrl().toString()).toBe("http://localhost:3000/");
    expect(getAbsoluteUrl("/practitioners?areas=bali")).toBe(
      "http://localhost:3000/practitioners",
    );
  });

  it("uses published profile facts and safe external URLs", async () => {
    const { getPractitionerMetadata } = await import(
      "@/lib/practitioner-metadata"
    );
    const metadata = getPractitionerMetadata(basePractitioner);

    expect(metadata.alternates?.canonical).toBe(
      "https://guide.example.test/practitioners/kartika-alexandra",
    );
    expect(metadata.description).toBe(basePractitioner.summary);
    expect(metadata.openGraph).toMatchObject({
      type: "profile",
      url: "https://guide.example.test/practitioners/kartika-alexandra",
      title: "Kartika Alexandra",
      description: basePractitioner.summary,
      images: [
        {
          url: basePractitioner.image,
          alt: basePractitioner.imageAlt,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Kartika Alexandra",
      images: [basePractitioner.image],
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("rejects non-HTTPS external URLs", async () => {
    const { safeExternalUrl } = await import("@/lib/practitioner-metadata");

    expect(safeExternalUrl("https://example.test/practitioner")).toBe(
      "https://example.test/practitioner",
    );
    expect(safeExternalUrl("http://example.test/practitioner")).toBeUndefined();
    expect(safeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeExternalUrl("/practitioner")).toBeUndefined();
    expect(safeExternalUrl("https://user:pass@example.test")).toBeUndefined();
  });

  it("marks unavailable routes as non-indexable", async () => {
    const { getUnavailableMetadata } = await import(
      "@/lib/practitioner-metadata"
    );
    const metadata = getUnavailableMetadata();

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toBeUndefined();
  });

  it("describes area and location pages with absolute canonical URLs", async () => {
    const { getDiscoveryMetadata } = await import("@/lib/practitioner-metadata");

    expect(getDiscoveryMetadata("area", { name: "Bali", slug: "bali" })).toMatchObject({
      title: "Bali",
      description:
        "Explore practitioners whose published profiles include this area of support.",
      alternates: { canonical: "https://guide.example.test/practitioners/areas/bali" },
      robots: { index: true, follow: true },
    });
    expect(getDiscoveryMetadata("location", { name: "Bali", slug: "bali" })).toMatchObject({
      title: "Bali",
      description:
        "Explore practitioners whose published profiles include this location.",
      alternates: {
        canonical: "https://guide.example.test/practitioners/locations/bali",
      },
    });
  });

  it("omits absent profile fields from nested Person JSON-LD", async () => {
    const { getPractitionerJsonLd } = await import("@/lib/practitioner-metadata");
    const jsonLd = getPractitionerJsonLd({
      ...basePractitioner,
      descriptor: undefined,
      image: undefined,
      websiteUrl: "javascript:alert(1)",
      instagramUrl: undefined,
      areasOfSupport: undefined,
      approaches: undefined,
      modalities: [],
      terms: [],
    });

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: "https://guide.example.test/practitioners/kartika-alexandra",
      mainEntity: {
        "@type": "Person",
        name: "Kartika Alexandra",
        description: basePractitioner.summary,
      },
    });
    expect(jsonLd.mainEntity).not.toHaveProperty("image");
    expect(jsonLd.mainEntity).not.toHaveProperty("sameAs");
    expect(jsonLd.mainEntity).not.toHaveProperty("jobTitle");
    expect(jsonLd.mainEntity).not.toHaveProperty("knowsAbout");
    expect(JSON.stringify(jsonLd)).not.toMatch(
      /aggregateRating|medicalCondition|review|booking|telephone|email|availability/i,
    );
  });
});
