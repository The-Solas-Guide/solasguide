import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPractitionerE2EFixtures } from "@/lib/practitioner-e2e-fixtures";
import type { Database } from "@/types/database";

export type PractitionerTermType =
  | "support_area"
  | "approach"
  | "modality"
  | "works_with"
  | "location"
  | "language";

export type PractitionerTerm = {
  id: string;
  type: PractitionerTermType;
  name: string;
  slug: string;
  /** Taxonomy order used when rendering shared filter options. */
  sortOrder: number;
  /** Profile-specific order used for linked terms such as modalities. */
  displayOrder: number;
};

export type PublicDiscoveryTermType = "support_area" | "location";

export type DirectoryFacetType =
  | "areas"
  | "approach"
  | "works-with"
  | "locations"
  | "format"
  | "languages";

export type DirectoryFilters = {
  query: string;
  areas: readonly string[];
  approach: readonly string[];
  "works-with": readonly string[];
  locations: readonly string[];
  format: readonly ("in-person" | "online")[];
  languages: readonly string[];
};

export type DirectorySearchParamSource =
  | URLSearchParams
  | Readonly<Record<string, string | readonly string[] | undefined>>;

export const emptyDirectoryFilters: DirectoryFilters = {
  query: "",
  areas: [],
  approach: [],
  "works-with": [],
  locations: [],
  format: [],
  languages: [],
};

const directoryFacetTypes: readonly DirectoryFacetType[] = [
  "areas",
  "approach",
  "works-with",
  "locations",
  "format",
  "languages",
];
const directoryFormatValues = ["in-person", "online"] as const;

function getSearchParamValues(
  params: DirectorySearchParamSource,
  key: string,
): readonly string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);

  const value = params[key];
  if (Array.isArray(value)) return value as readonly string[];
  return value === undefined ? [] : [value as string];
}

function normalizeDirectoryValues(values: readonly string[] | undefined) {
  const unique = new Set<string>();
  for (const value of values ?? []) {
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      if (trimmed) unique.add(trimmed);
    }
  }

  return [...unique].sort((left, right) => left.localeCompare(right));
}

function normalizeDirectoryFormat(values: readonly string[] | undefined) {
  const normalized = normalizeDirectoryValues(values);
  return normalized.filter(
    (value): value is (typeof directoryFormatValues)[number] =>
      directoryFormatValues.includes(value as (typeof directoryFormatValues)[number]),
  );
}

export function parseDirectoryFilters(
  params: DirectorySearchParamSource,
): DirectoryFilters {
  const queryValue = ["search", "query", "q"]
    .flatMap((key) => getSearchParamValues(params, key))
    .find((value) => value.trim());

  return {
    query: queryValue?.trim() ?? "",
    areas: normalizeDirectoryValues(getSearchParamValues(params, "areas")),
    approach: normalizeDirectoryValues(getSearchParamValues(params, "approach")),
    "works-with": normalizeDirectoryValues(
      getSearchParamValues(params, "works-with"),
    ),
    locations: normalizeDirectoryValues(
      getSearchParamValues(params, "locations"),
    ),
    format: normalizeDirectoryFormat(getSearchParamValues(params, "format")),
    languages: normalizeDirectoryValues(
      getSearchParamValues(params, "languages"),
    ),
  };
}

export function serializeDirectoryFilters(
  filters: DirectoryFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("search", query);

  const valuesByFacet: Record<DirectoryFacetType, readonly string[]> = {
    areas: filters.areas,
    approach: filters.approach,
    "works-with": filters["works-with"],
    locations: filters.locations,
    format: filters.format,
    languages: filters.languages,
  };

  for (const facet of directoryFacetTypes) {
    const values =
      facet === "format"
        ? normalizeDirectoryFormat(valuesByFacet[facet])
        : normalizeDirectoryValues(valuesByFacet[facet]);
    for (const value of values) params.append(facet, value);
  }

  return params;
}

function normalizeDirectoryFilters(
  filters: Partial<DirectoryFilters> | undefined,
): DirectoryFilters {
  return {
    query: filters?.query?.trim() ?? "",
    areas: normalizeDirectoryValues(filters?.areas),
    approach: normalizeDirectoryValues(filters?.approach),
    "works-with": normalizeDirectoryValues(filters?.["works-with"]),
    locations: normalizeDirectoryValues(filters?.locations),
    format: normalizeDirectoryFormat(filters?.format),
    languages: normalizeDirectoryValues(filters?.languages),
  };
}

function directoryFiltersAreActive(filters: DirectoryFilters) {
  return (
    filters.query !== "" ||
    directoryFacetTypes.some((facet) => filters[facet].length > 0)
  );
}

export type Practitioner = {
  id: string;
  slug: string;
  name: string;
  location?: string;
  descriptor?: string;
  modalities: readonly string[];
  primaryModality?: string;
  summary?: string;
  about?: string;
  areasOfSupport?: readonly string[];
  approach?: string;
  approaches?: readonly string[];
  worksWith?: readonly string[];
  languages?: readonly string[];
  delivery?: readonly string[];
  yearsActive?: number;
  credentials?: readonly string[];
  significantTraining?: readonly string[];
  image?: string;
  imageAlt?: string;
  imageFocalX?: number;
  imageFocalY?: number;
  websiteUrl?: string;
  instagramUrl?: string;
  offersInPerson: boolean;
  offersOnline: boolean;
  terms: readonly PractitionerTerm[];
  /** Published profiles are the only profiles returned by this module. */
  hasPublishedProfile: true;
};

export type DirectoryQueryResult<T> = {
  data: T;
  error: boolean;
};

type PublicSupabaseClient = SupabaseClient<Database>;
type PractitionerRow = Database["public"]["Tables"]["practitioners"]["Row"];
type PractitionerTermRow = Database["public"]["Tables"]["practitioner_terms"]["Row"];
type PractitionerTermLinkRow = Database["public"]["Tables"]["practitioner_term_links"]["Row"];

const practitionerColumns = [
  "id",
  "slug",
  "name",
  "descriptor",
  "years_active",
  "summary",
  "about",
  "credentials",
  "significant_training",
  "offers_in_person",
  "offers_online",
  "website_url",
  "instagram_url",
  "image_path",
  "image_alt",
  "image_focal_x",
  "image_focal_y",
  "status",
].join(",");

const termColumns = "id,type,name,slug,sort_order,is_active";
const linkColumns = "practitioner_id,term_id,display_order";

/**
 * Build the public Supabase client used by server components.
 * The publishable key is safe for public reads because RLS remains active.
 */
export function createPublicSupabaseClient(): PublicSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function cleanOptionalString(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function cleanOptionalStringList(value: readonly string[] | null | undefined) {
  const cleaned = value
    ?.map((item) => item.trim())
    .filter((item) => item.length > 0);
  return cleaned?.length ? cleaned : undefined;
}


/** Default crop sits high so faces are not clipped. Custom focals still win. */
export function portraitObjectPosition(x?: number, y?: number) {
  const custom = x !== undefined && y !== undefined && (x !== 50 || y !== 50);
  return custom ? `${x}% ${y}%` : "50% 20%";
}

function isTermType(value: string): value is PractitionerTermType {
  return [
    "support_area",
    "approach",
    "modality",
    "works_with",
    "location",
    "language",
  ].includes(value);
}

function buildImageUrl(client: PublicSupabaseClient, imagePath: string | null) {
  const path = cleanOptionalString(imagePath);
  if (!path) return undefined;

  return client.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
}

export function mapPractitionerRows(
  rows: readonly PractitionerRow[],
  termRows: readonly PractitionerTermRow[],
  linkRows: readonly PractitionerTermLinkRow[],
  client: PublicSupabaseClient,
) {
  const termsById = new Map<string, PractitionerTerm>();
  for (const term of termRows) {
    if (!term.is_active || !isTermType(term.type)) continue;
    termsById.set(term.id, {
      id: term.id,
      type: term.type as PublicDiscoveryTermType,
      name: term.name,
      slug: term.slug,
      sortOrder: term.sort_order,
      displayOrder: 0,
    });
  }

  const linksByPractitioner = new Map<string, PractitionerTerm[]>();
  for (const link of linkRows) {
    const term = termsById.get(link.term_id);
    if (!term) continue;

    const linked = linksByPractitioner.get(link.practitioner_id) ?? [];
    linked.push({ ...term, displayOrder: link.display_order });
    linksByPractitioner.set(link.practitioner_id, linked);
  }

  return rows
    .filter((row) => row.status === "published")
    .map((row) =>
      mapPractitionerRow(
        row,
        linksByPractitioner.get(row.id) ?? [],
        buildImageUrl(client, row.image_path),
      ),
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function mapPractitionerRow(
  row: PractitionerRow,
  linkedTerms: readonly PractitionerTerm[],
  image?: string,
): Practitioner {
  const terms = [...linkedTerms].sort(
    (left, right) =>
      left.displayOrder - right.displayOrder ||
      left.type.localeCompare(right.type) ||
      left.name.localeCompare(right.name),
  );
  const namesForType = (type: PractitionerTermType) =>
    terms.filter((term) => term.type === type).map((term) => term.name);
  const locations = namesForType("location");
  const approaches = namesForType("approach");
  const modalities = namesForType("modality");
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: locations.length ? locations.join(", ") : undefined,
    descriptor: cleanOptionalString(row.descriptor),
    modalities,
    primaryModality: modalities[0],
    summary: cleanOptionalString(row.summary),
    about: cleanOptionalString(row.about),
    areasOfSupport: cleanOptionalStringList(namesForType("support_area")),
    approach: approaches[0],
    approaches: approaches.length ? approaches : undefined,
    worksWith: cleanOptionalStringList(namesForType("works_with")),
    languages: cleanOptionalStringList(namesForType("language")),
    delivery: [
      ...(row.offers_in_person ? ["In-person"] : []),
      ...(row.offers_online ? ["Online"] : []),
    ],
    yearsActive: row.years_active ?? undefined,
    credentials: cleanOptionalStringList(row.credentials),
    significantTraining: cleanOptionalStringList(row.significant_training),
    image,
    imageAlt: cleanOptionalString(row.image_alt),
    imageFocalX: row.image_focal_x,
    imageFocalY: row.image_focal_y,
    websiteUrl: cleanOptionalString(row.website_url),
    instagramUrl: cleanOptionalString(row.instagram_url),
    offersInPerson: row.offers_in_person,
    offersOnline: row.offers_online,
    terms,
    hasPublishedProfile: true as const,
  };
}

async function loadLinkedTerms(
  client: PublicSupabaseClient,
  practitioners: readonly PractitionerRow[],
): Promise<DirectoryQueryResult<{ terms: PractitionerTermRow[]; links: PractitionerTermLinkRow[] }>> {
  if (practitioners.length === 0) return { data: { terms: [], links: [] }, error: false };

  const practitionerIds = practitioners.map((practitioner) => practitioner.id);
  const linksResult = await client
    .from("practitioner_term_links")
    .select(linkColumns)
    .in("practitioner_id", practitionerIds);

  if (linksResult.error) return { data: { terms: [], links: [] }, error: true };

  const links = linksResult.data as PractitionerTermLinkRow[];
  const termIds = [...new Set(links.map((link) => link.term_id))];
  if (termIds.length === 0) return { data: { terms: [], links }, error: false };

  const termsResult = await client
    .from("practitioner_terms")
    .select(termColumns)
    .in("id", termIds)
    .eq("is_active", true);

  if (termsResult.error) return { data: { terms: [], links: [] }, error: true };

  return {
    data: { terms: termsResult.data as PractitionerTermRow[], links },
    error: false,
  };
}

async function loadProfiles(
  client: PublicSupabaseClient,
  slug?: string,
  practitionerIds?: readonly string[],
): Promise<DirectoryQueryResult<PractitionerRow[]>> {
  let query = client
    .from("practitioners")
    .select(practitionerColumns)
    .eq("status", "published");

  if (slug !== undefined) query = query.eq("slug", slug);
  if (practitionerIds !== undefined) {
    query = query.in("id", [...practitionerIds]);
  }

  const result = slug !== undefined ? await query.maybeSingle() : await query;
  if (result.error) return { data: [], error: true };

  return {
    data: (slug !== undefined ? (result.data ? [result.data] : []) : result.data) as unknown as PractitionerRow[],
    error: false,
  };
}

function matchesDirectoryFilters(
  practitioner: Practitioner,
  filters: DirectoryFilters,
) {
  const query = filters.query.toLowerCase();
  const searchText = [
    practitioner.name,
    practitioner.descriptor,
    practitioner.summary,
    practitioner.about,
    ...(practitioner.credentials ?? []),
    ...(practitioner.significantTraining ?? []),
    ...practitioner.terms.map((term) => term.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesTerms = (
    slugs: readonly string[],
    type: PractitionerTermType,
  ) =>
    slugs.length === 0 ||
    practitioner.terms.some(
      (term) => term.type === type && slugs.includes(term.slug),
    );

  return (
    (query === "" || searchText.includes(query)) &&
    matchesTerms(filters.areas, "support_area") &&
    matchesTerms(filters.approach, "approach") &&
    matchesTerms(filters["works-with"], "works_with") &&
    matchesTerms(filters.locations, "location") &&
    (filters.format.length === 0 ||
      (filters.format.includes("in-person") && practitioner.offersInPerson) ||
      (filters.format.includes("online") && practitioner.offersOnline)) &&
    matchesTerms(filters.languages, "language")
  );
}

async function queryPublishedPractitioners(
  client: PublicSupabaseClient,
  slug?: string,
  requestedFilters: DirectoryFilters = emptyDirectoryFilters,
): Promise<DirectoryQueryResult<Practitioner[]>> {
  if (
    process.env.SOLAS_PRACTITIONER_E2E === "1" &&
    process.env.NODE_ENV !== "production"
  ) {
    const fixtures = getPractitionerE2EFixtures();
    const profiles = slug
      ? fixtures.profiles.filter((profile) => profile.slug === slug)
      : fixtures.profiles;

    const mapped = mapPractitionerRows(
      profiles,
      fixtures.terms,
      fixtures.links,
      client,
    );
    return {
      data: mapped.filter((practitioner) =>
        matchesDirectoryFilters(practitioner, requestedFilters),
      ),
      error: false,
    };
  }

  let profiles: DirectoryQueryResult<PractitionerRow[]>;
  if (slug !== undefined || !directoryFiltersAreActive(requestedFilters)) {
    profiles = await loadProfiles(client, slug);
  } else {
    const searchResult = await client.rpc("search_published_practitioner_ids", {
      p_query: requestedFilters.query || undefined,
      p_area_slugs: [...requestedFilters.areas],
      p_approach_slugs: [...requestedFilters.approach],
      p_works_with_slugs: [...requestedFilters["works-with"]],
      p_location_slugs: [...requestedFilters.locations],
      p_format_values: [...requestedFilters.format],
      p_language_slugs: [...requestedFilters.languages],
    });
    if (searchResult.error) return { data: [], error: true };

    const practitionerIds = [
      ...new Set(
        (searchResult.data ?? [])
          .map((row) => row.practitioner_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    ];
    if (practitionerIds.length === 0) return { data: [], error: false };
    profiles = await loadProfiles(client, undefined, practitionerIds);
  }
  if (profiles.error) return { data: [], error: true };

  const linkedTerms = await loadLinkedTerms(client, profiles.data);
  if (linkedTerms.error) return { data: [], error: true };

  return {
    data: mapPractitionerRows(
      profiles.data,
      linkedTerms.data.terms,
      linkedTerms.data.links,
      client,
    ),
    error: false,
  };
}

export async function getPublishedPractitioners(
  clientOrFilters: PublicSupabaseClient | DirectoryFilters | null =
    emptyDirectoryFilters,
  client?: PublicSupabaseClient | null,
): Promise<DirectoryQueryResult<readonly Practitioner[]>> {
  const usesClientAsFirstArgument =
    clientOrFilters === null ||
    (typeof clientOrFilters === "object" &&
      "from" in clientOrFilters &&
      typeof clientOrFilters.from === "function");
  const filters = usesClientAsFirstArgument
    ? emptyDirectoryFilters
    : normalizeDirectoryFilters(clientOrFilters as DirectoryFilters);
  const resolvedClient = usesClientAsFirstArgument
    ? clientOrFilters
    : (client ?? createPublicSupabaseClient());

  if (!resolvedClient) return { data: [], error: true };
  return queryPublishedPractitioners(resolvedClient, undefined, filters);
}

export async function getPublishedPractitionerBySlug(
  slug: string,
  client = createPublicSupabaseClient(),
): Promise<DirectoryQueryResult<Practitioner | null>> {
  if (!client) return { data: null, error: true };
  const result = await queryPublishedPractitioners(client, slug);
  return { data: result.data[0] ?? null, error: result.error };
}

/**
 * Load one active public taxonomy term without requiring a published profile
 * to link it. Discovery pages can then render an explicit empty state while
 * keeping the practitioner query limited to published profiles.
 */
export async function getActivePublicDiscoveryTerm(
  type: PublicDiscoveryTermType,
  slug: string,
  client = createPublicSupabaseClient(),
): Promise<DirectoryQueryResult<PractitionerTerm | null>> {
  if (
    process.env.SOLAS_PRACTITIONER_E2E === "1" &&
    process.env.NODE_ENV !== "production"
  ) {
    const fixture = getPractitionerE2EFixtures().terms.find(
      (term) => term.type === type && term.slug === slug && term.is_active,
    );
    return {
      data: fixture
        ? {
            id: fixture.id,
            type,
            name: fixture.name,
            slug: fixture.slug,
            sortOrder: fixture.sort_order,
            displayOrder: 0,
          }
        : null,
      error: false,
    };
  }

  if (!client) return { data: null, error: true };

  const result = await client.rpc("get_active_practitioner_taxonomy_term", {
    p_type: type,
    p_slug: slug,
  });

  if (result.error) return { data: null, error: true };
  const term = result.data?.[0] ?? null;

  return {
    data: term
      ? {
          id: term.id,
          type,
          name: term.name,
          slug: term.slug,
          sortOrder: 0,
          displayOrder: 0,
        }
      : null,
    error: false,
  };
}

export async function getActivePublicDiscoveryTerms(
  client = createPublicSupabaseClient(),
): Promise<DirectoryQueryResult<PractitionerTerm[]>> {
  if (
    process.env.SOLAS_PRACTITIONER_E2E === "1" &&
    process.env.NODE_ENV !== "production"
  ) {
    return {
      data: getPractitionerE2EFixtures().terms
        .filter(
          (term) =>
            term.is_active &&
            (term.type === "support_area" || term.type === "location"),
        )
        .map((term) => ({
          id: term.id,
          type: term.type as PublicDiscoveryTermType,
          name: term.name,
          slug: term.slug,
          sortOrder: term.sort_order,
          displayOrder: 0,
        })),
      error: false,
    };
  }

  if (!client) return { data: [], error: true };

  const result = await client.rpc("list_active_practitioner_taxonomy_terms");
  if (result.error) return { data: [], error: true };

  return {
    data: (result.data ?? []).map((term) => ({
      id: term.id,
      type: term.type as PublicDiscoveryTermType,
      name: term.name,
      slug: term.slug,
      sortOrder: 0,
      displayOrder: 0,
    })),
    error: false,
  };
}

/** A practitioner's ordered location terms, used by the directory filter. */
export function getLocations(practitioner: Practitioner) {
  return practitioner.terms
    .filter((term) => term.type === "location")
    .map((term) => term.name);
}

export function getTermsByType(practitioner: Practitioner, type: PractitionerTermType) {
  return practitioner.terms.filter((term) => term.type === type);
}
