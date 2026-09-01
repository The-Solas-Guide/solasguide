import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/practitioner-metadata";
import { getPublishedPractitioners } from "@/lib/practitioners";

const staticPaths = [
  "/",
  "/find-a-match",
  "/become-a-practitioner",
  "/practitioners",
] as const;

export const dynamic = "force-dynamic";

/**
 * Keep the sitemap limited to public entry points and published directory data.
 * The directory loader already omits draft, archived, inactive, and unlinked terms.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticPaths.map((path) => ({
    url: getAbsoluteUrl(path),
  }));
  const result = await getPublishedPractitioners();

  if (result.error) return staticEntries;

  const profiles = result.data.map((practitioner) => ({
    url: getAbsoluteUrl(
      `/practitioners/${encodeURIComponent(practitioner.slug)}`,
    ),
  }));
  const terms = new Map<string, { kind: "area" | "location"; slug: string }>();

  for (const practitioner of result.data) {
    for (const term of practitioner.terms) {
      if (term.type === "support_area") {
        terms.set(`area:${term.slug}`, { kind: "area", slug: term.slug });
      }
      if (term.type === "location") {
        terms.set(`location:${term.slug}`, {
          kind: "location",
          slug: term.slug,
        });
      }
    }
  }

  const discoveryEntries = [...terms.values()]
    .sort((left, right) =>
      `${left.kind}:${left.slug}`.localeCompare(`${right.kind}:${right.slug}`),
    )
    .map(({ kind, slug }) => ({
      url: getAbsoluteUrl(
        `/practitioners/${kind === "area" ? "areas" : "locations"}/${encodeURIComponent(slug)}`,
      ),
    }));

  return [...staticEntries, ...profiles, ...discoveryEntries];
}
