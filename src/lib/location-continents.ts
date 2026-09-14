export type PublicContinentSlug =
  | "southeast-asia"
  | "europe"
  | "asia"
  | "africa"
  | "international"
  | "willing-to-travel";

export type PublicContinentKind = "geographic" | "intent";

export type PublicContinent = {
  slug: PublicContinentSlug;
  name: string;
  kind: PublicContinentKind;
};

export const publicContinents: readonly PublicContinent[] = [
  { slug: "southeast-asia", name: "Southeast Asia", kind: "geographic" },
  { slug: "europe", name: "Europe", kind: "geographic" },
  { slug: "asia", name: "Asia", kind: "geographic" },
  { slug: "africa", name: "Africa", kind: "geographic" },
  { slug: "international", name: "International", kind: "geographic" },
  { slug: "willing-to-travel", name: "Willing to travel", kind: "intent" },
];

const publicContinentsBySlug = new Map(
  publicContinents.map((continent) => [continent.slug, continent]),
);

/** Country / specific location slug → one geographic public continent. */
export const internalLocationToContinent: Readonly<
  Record<string, Exclude<PublicContinentSlug, "willing-to-travel">>
> = {
  bali: "southeast-asia",
  indonesia: "southeast-asia",
  singapore: "southeast-asia",
  switzerland: "europe",
  netherlands: "europe",
  italy: "europe",
  portugal: "europe",
  uk: "europe",
  kenya: "africa",
  international: "international",
};

const internalsByContinent = new Map<PublicContinentSlug, string[]>();
for (const [internalSlug, continentSlug] of Object.entries(
  internalLocationToContinent,
)) {
  const current = internalsByContinent.get(continentSlug) ?? [];
  current.push(internalSlug);
  internalsByContinent.set(continentSlug, current);
}

export function isPublicContinentSlug(
  slug: string,
): slug is PublicContinentSlug {
  return publicContinentsBySlug.has(slug as PublicContinentSlug);
}

export function isKnownInternalLocationSlug(slug: string) {
  return Object.hasOwn(internalLocationToContinent, slug);
}

export function isValidLocationFilterSlug(slug: string) {
  return isPublicContinentSlug(slug) || isKnownInternalLocationSlug(slug);
}

export function getPublicContinent(slug: string) {
  return publicContinentsBySlug.get(slug as PublicContinentSlug);
}

export function internalsForContinent(slug: PublicContinentSlug) {
  return internalsByContinent.get(slug) ?? [];
}

export function publicContinentSortOrder(slug: PublicContinentSlug) {
  const index = publicContinents.findIndex((continent) => continent.slug === slug);
  return index === -1 ? 0 : index * 10;
}

export function derivePublicContinents(internalSlugs: readonly string[]) {
  const unmapped: string[] = [];
  const geographic = new Set<Exclude<PublicContinentSlug, "willing-to-travel">>();

  for (const slug of internalSlugs) {
    if (slug === "willing-to-travel") {
      continue;
    }
    if (isPublicContinentSlug(slug) && slug !== "willing-to-travel") {
      geographic.add(slug);
      continue;
    }
    const continent = internalLocationToContinent[slug];
    if (!continent) {
      unmapped.push(slug);
      continue;
    }
    geographic.add(continent);
  }

  const continents = publicContinents.filter((continent) => {
    if (continent.slug === "willing-to-travel") {
      const geoWithoutInternational = [...geographic].filter(
        (slug) => slug !== "international",
      );
      return geoWithoutInternational.length >= 2;
    }
    return geographic.has(continent.slug);
  });

  return { continents, unmapped };
}

export function formatPublicContinents(
  continents: readonly PublicContinent[],
) {
  if (continents.length === 0) return undefined;
  return continents.map((continent) => continent.name).join(" · ");
}

export function publicContinentTermId(slug: PublicContinentSlug) {
  return `public-continent:${slug}`;
}

export type LocationSearchPlan = {
  rpcSlugs: string[];
  postFilter: boolean;
};

const unmatchedLocationSlug = "__no-public-continent-match__";

export function prepareLocationSearch(
  slugs: readonly string[],
): LocationSearchPlan {
  if (slugs.length === 0) return { rpcSlugs: [], postFilter: false };

  if (slugs.includes("willing-to-travel")) {
    return { rpcSlugs: [], postFilter: true };
  }

  const rpcSlugs = [
    ...new Set(
      slugs.flatMap((slug) => {
        if (isPublicContinentSlug(slug)) return internalsForContinent(slug);
        return [slug];
      }),
    ),
  ].sort((left, right) => left.localeCompare(right));

  if (
    rpcSlugs.length === 0 &&
    slugs.some((slug) => isPublicContinentSlug(slug))
  ) {
    return { rpcSlugs: [unmatchedLocationSlug], postFilter: false };
  }

  return { rpcSlugs, postFilter: false };
}

export function matchesLocationFilterSlugs(
  publicContinentSlugs: readonly string[],
  internalLocationSlugs: readonly string[],
  selected: readonly string[],
) {
  if (selected.length === 0) return true;

  return selected.some((slug) => {
    if (isPublicContinentSlug(slug)) return publicContinentSlugs.includes(slug);
    return internalLocationSlugs.includes(slug);
  });
}
