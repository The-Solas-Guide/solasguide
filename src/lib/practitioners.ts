import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
  displayOrder: number;
};

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
      type: term.type,
      name: term.name,
      slug: term.slug,
      displayOrder: term.sort_order,
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
    .map((row) => {
      const terms = [...(linksByPractitioner.get(row.id) ?? [])].sort(
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
        image: buildImageUrl(client, row.image_path),
        imageAlt: cleanOptionalString(row.image_alt),
        imageFocalX: row.image_focal_x,
        imageFocalY: row.image_focal_y,
        websiteUrl: cleanOptionalString(row.website_url),
        instagramUrl: cleanOptionalString(row.instagram_url),
        offersInPerson: row.offers_in_person,
        offersOnline: row.offers_online,
        terms,
        hasPublishedProfile: true as const,
      } satisfies Practitioner;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
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
): Promise<DirectoryQueryResult<PractitionerRow[]>> {
  let query = client
    .from("practitioners")
    .select(practitionerColumns)
    .eq("status", "published");

  if (slug !== undefined) query = query.eq("slug", slug);

  const result = slug !== undefined ? await query.maybeSingle() : await query;
  if (result.error) return { data: [], error: true };

  return {
    data: (slug !== undefined ? (result.data ? [result.data] : []) : result.data) as unknown as PractitionerRow[],
    error: false,
  };
}

async function queryPublishedPractitioners(
  client: PublicSupabaseClient,
  slug?: string,
): Promise<DirectoryQueryResult<Practitioner[]>> {
  const profiles = await loadProfiles(client, slug);
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
  client = createPublicSupabaseClient(),
): Promise<DirectoryQueryResult<readonly Practitioner[]>> {
  if (!client) return { data: [], error: true };
  return queryPublishedPractitioners(client);
}

export async function getPublishedPractitionerBySlug(
  slug: string,
  client = createPublicSupabaseClient(),
): Promise<DirectoryQueryResult<Practitioner | null>> {
  if (!client) return { data: null, error: true };
  const result = await queryPublishedPractitioners(client, slug);
  return { data: result.data[0] ?? null, error: result.error };
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
