import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/practitioner-metadata";
import {
  getActivePublicDiscoveryTerms,
  getPublishedPractitioners,
} from "@/lib/practitioners";

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
  const [result, taxonomyResult] = await Promise.all([
    getPublishedPractitioners(),
    getActivePublicDiscoveryTerms(),
  ]);

  if (result.error) return staticEntries;

  const profiles = result.data.map((practitioner) => ({
    url: getAbsoluteUrl(
      `/practitioners/${encodeURIComponent(practitioner.slug)}`,
    ),
  }));
  const discoveryEntries = (taxonomyResult.error ? [] : taxonomyResult.data)
    .map((term) => ({
      kind:
        term.type === "support_area"
          ? ("area" as const)
          : ("location" as const),
      slug: term.slug,
    }))
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
