import { PractitionerDirectory } from "@/components/practitioners/practitioner-directory";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDirectoryMetadata } from "@/lib/practitioner-metadata";
import {
  getPublishedPractitioners,
  parseDirectoryFilters,
  type DirectoryFacetType,
  type DirectoryFilters,
  type Practitioner,
} from "@/lib/practitioners";

export const metadata = getDirectoryMetadata();

export const dynamic = "force-dynamic";

type PractitionersSearchParams = Promise<
  Readonly<Record<string, string | string[] | undefined>>
>;

const directoryFacetTypes: readonly DirectoryFacetType[] = [
  "areas",
  "approach",
  "works-with",
  "locations",
  "format",
  "languages",
];

const termTypesByFacet = {
  areas: "support_area",
  approach: "approach",
  "works-with": "works_with",
  locations: "location",
  languages: "language",
} as const;

function searchParamValues(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  key: string,
) {
  const value = searchParams[key];
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((entry) =>
    entry
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function availableValues(practitioners: readonly Practitioner[]) {
  const values: Record<DirectoryFacetType, Set<string>> = {
    areas: new Set(),
    approach: new Set(),
    "works-with": new Set(),
    locations: new Set(),
    format: new Set(),
    languages: new Set(),
  };

  for (const practitioner of practitioners) {
    for (const facet of Object.keys(termTypesByFacet) as Array<
      keyof typeof termTypesByFacet
    >) {
      const termType = termTypesByFacet[facet];
      for (const term of practitioner.terms) {
        if (term.type === termType) values[facet].add(term.slug);
      }
    }
    if (practitioner.offersInPerson) values.format.add("in-person");
    if (practitioner.offersOnline) values.format.add("online");
  }

  return values;
}

function canonicalizeFilters(
  filters: DirectoryFilters,
  available: Record<DirectoryFacetType, Set<string>>,
) {
  const canonicalFilters: DirectoryFilters = {
    query: filters.query,
    areas: filters.areas.filter((value) => available.areas.has(value)),
    approach: filters.approach.filter((value) => available.approach.has(value)),
    "works-with": filters["works-with"].filter((value) =>
      available["works-with"].has(value),
    ),
    locations: filters.locations.filter((value) => available.locations.has(value)),
    format: filters.format.filter((value) => available.format.has(value)),
    languages: filters.languages.filter((value) => available.languages.has(value)),
  };

  const invalid = directoryFacetTypes.some(
    (facet) => canonicalFilters[facet].length !== filters[facet].length,
  );

  return { canonicalFilters, invalid };
}

const navLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/practitioners" },
];

export default async function PractitionersPage({
  searchParams,
}: {
  searchParams: PractitionersSearchParams;
}) {
  const rawSearchParams = await searchParams;
  const parsedFilters = parseDirectoryFilters(rawSearchParams);
  const allResult = await getPublishedPractitioners();
  const available = availableValues(allResult.data);
  const { canonicalFilters, invalid } = canonicalizeFilters(
    parsedFilters,
    available,
  );
  const rawFormats = searchParamValues(rawSearchParams, "format");
  const invalidFormat = rawFormats.some(
    (value) => value !== "in-person" && value !== "online",
  );
  const hasActiveFilters =
    canonicalFilters.query !== "" ||
    directoryFacetTypes.some((facet) => canonicalFilters[facet].length > 0);
  const result = hasActiveFilters
    ? await getPublishedPractitioners(canonicalFilters)
    : allResult;
  const practitioners = result.data;
  const hasError = allResult.error || result.error;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[60] border border-border bg-background px-4 py-3 text-sm text-foreground focus:not-sr-only focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
        <SiteHeader links={navLinks} />

        <main id="main-content">
          <section
            aria-labelledby="practitioners-heading"
            className="mt-3 border border-border bg-background px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
          >
            <p className="review-label text-accent">Volume One</p>
            <h1
              id="practitioners-heading"
              className="mt-4 max-w-3xl font-display text-4xl leading-[1.04] text-balance md:text-6xl"
            >
              The founding practitioners of The Solas Guide.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
              {hasError
                ? "Browse approved practitioner profiles by name, practice or place."
                : `Explore ${allResult.data.length} practitioners in the Guide. Search by name, practice or place, then use the filters when a listing includes that information.`}
            </p>
          </section>

          <PractitionerDirectory
            practitioners={practitioners}
            availablePractitioners={allResult.data}
            filters={canonicalFilters}
            invalidFilters={invalid || invalidFormat}
            error={hasError}
          />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
