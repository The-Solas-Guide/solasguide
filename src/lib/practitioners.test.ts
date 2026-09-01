import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import {
  portraitObjectPosition,
  type DirectoryFilters,
} from "@/lib/practitioners";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

type PractitionerRow = Database["public"]["Tables"]["practitioners"]["Row"];
type TermRow = Database["public"]["Tables"]["practitioner_terms"]["Row"];
type LinkRow = Database["public"]["Tables"]["practitioner_term_links"]["Row"];

const profileRow: PractitionerRow = {
  id: "profile-1",
  slug: "published-profile",
  name: "Published Profile",
  descriptor: "Somatic practitioner",
  years_active: 12,
  summary: "A published summary.",
  about: "A published about description.",
  credentials: ["Credential"],
  significant_training: ["Training"],
  offers_in_person: true,
  offers_online: false,
  website_url: "https://example.test",
  instagram_url: null,
  image_path: "published-profile.webp",
  image_alt: "A published profile portrait",
  image_focal_x: 35,
  image_focal_y: 65,
  status: "published",
  published_at: "2026-08-27T00:00:00.000Z",
  created_at: "2026-08-27T00:00:00.000Z",
  updated_at: "2026-08-27T00:00:00.000Z",
};

const termRows: TermRow[] = [
  {
    id: "term-modality",
    type: "modality",
    name: "Second modality",
    slug: "second-modality",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "term-primary",
    type: "modality",
    name: "Primary modality",
    slug: "primary-modality",
    sort_order: 20,
    is_active: true,
  },
  {
    id: "term-location",
    type: "location",
    name: "Bali",
    slug: "bali",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "term-inactive",
    type: "support_area",
    name: "Inactive area",
    slug: "inactive-area",
    sort_order: 10,
    is_active: false,
  },
  {
    id: "term-support-z",
    type: "support_area",
    name: "Z early area",
    slug: "z-early-area",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "term-support-a",
    type: "support_area",
    name: "A early area",
    slug: "a-early-area",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "term-support-late",
    type: "support_area",
    name: "A later area",
    slug: "a-later-area",
    sort_order: 20,
    is_active: true,
  },
];

const linkRows: LinkRow[] = [
  { practitioner_id: "profile-1", term_id: "term-modality", display_order: 2 },
  { practitioner_id: "profile-1", term_id: "term-primary", display_order: 1 },
  { practitioner_id: "profile-1", term_id: "term-location", display_order: 1 },
  { practitioner_id: "profile-1", term_id: "term-inactive", display_order: 1 },
  { practitioner_id: "profile-1", term_id: "term-support-late", display_order: 1 },
  { practitioner_id: "profile-1", term_id: "term-support-z", display_order: 2 },
  { practitioner_id: "profile-1", term_id: "term-support-a", display_order: 3 },
];

function builder(result: { data: unknown; error: null | { message: string } }) {
  const chain: Record<string, unknown> & {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    maybeSingle: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.then = (resolve: (value: typeof result) => unknown) =>
    Promise.resolve(result).then(resolve);
  return chain;
}

function mockedClient() {
  const profileQuery = builder({ data: [profileRow], error: null });
  const linkQuery = builder({ data: linkRows, error: null });
  const termQuery = builder({ data: termRows, error: null });
  const from = vi.fn((table: string) => {
    if (table === "practitioners") return profileQuery;
    if (table === "practitioner_term_links") return linkQuery;
    return termQuery;
  });
  const client = {
    from,
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://cdn.example.test/${path}` },
        })),
      })),
    },
  };
  return { client, from, profileQuery, linkQuery, termQuery };
}

const emptyFilters: DirectoryFilters = {
  query: "",
  areas: [],
  approach: [],
  "works-with": [],
  locations: [],
  format: [],
  languages: [],
};

describe("public practitioner directory data", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  });

  it("maps a mocked published response and keeps ordered active taxonomy", async () => {
    const { client, profileQuery, linkQuery, termQuery } = mockedClient();
    const { getPublishedPractitioners } = await import("@/lib/practitioners");
    const { getFacetDefinitions } = await import(
      "@/components/practitioners/practitioner-directory"
    );

    const result = await getPublishedPractitioners(client as never);
    const practitioner = result.data[0];

    expect(result.error).toBe(false);
    expect(practitioner).toMatchObject({
      slug: "published-profile",
      location: "Bali",
      modalities: ["Primary modality", "Second modality"],
      primaryModality: "Primary modality",
      image: "https://cdn.example.test/published-profile.webp",
      imageFocalX: 35,
      imageFocalY: 65,
      websiteUrl: "https://example.test",
    });
    expect(practitioner.terms.map((term) => term.slug)).toEqual([
      "bali",
      "primary-modality",
      "a-later-area",
      "second-modality",
      "z-early-area",
      "a-early-area",
    ]);
    expect(
      practitioner.terms
        .filter((term) => term.type === "modality")
        .map((term) => ({ slug: term.slug, sortOrder: term.sortOrder, displayOrder: term.displayOrder })),
    ).toEqual([
      { slug: "primary-modality", sortOrder: 20, displayOrder: 1 },
      { slug: "second-modality", sortOrder: 10, displayOrder: 2 },
    ]);
    const areaFacet = getFacetDefinitions([practitioner]).find(
      (facet) => facet.id === "areas",
    );
    expect(areaFacet?.options.map((option) => option.value)).toEqual([
      "term-support-a",
      "term-support-z",
      "term-support-late",
    ]);
    expect(practitioner.terms.some((term) => term.slug === "inactive-area")).toBe(false);
    expect(profileQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(linkQuery.in).toHaveBeenCalledWith("practitioner_id", ["profile-1"]);
    expect(termQuery.in).toHaveBeenCalledWith("id", [
      "term-modality",
      "term-primary",
      "term-location",
      "term-inactive",
      "term-support-late",
      "term-support-z",
      "term-support-a",
    ]);
    expect(termQuery.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("returns a generic error when the public database is unavailable", async () => {
    const { createPublicSupabaseClient, getPublishedPractitioners } = await import(
      "@/lib/practitioners"
    );
    expect(createPublicSupabaseClient()).not.toBeNull();

    const failedClient = {
      from: vi.fn(() => builder({ data: null, error: { message: "private database detail" } })),
    };
    const result = await getPublishedPractitioners(failedClient as never);

    expect(result).toEqual({ data: [], error: true });
    expect(JSON.stringify(result)).not.toContain("private database detail");
  });

  it("uses the search RPC for active filters and loads only its published ids", async () => {
    const { client, profileQuery } = mockedClient();
    const rpc = vi.fn().mockResolvedValue({
      data: [{ practitioner_id: "profile-1" }],
      error: null,
    });
    Object.assign(client, { rpc });
    const { getPublishedPractitioners } = await import("@/lib/practitioners");

    const result = await getPublishedPractitioners(
      {
        ...emptyFilters,
        query: "  published profile ",
        areas: ["support-area"],
        format: ["online"],
      },
      client as never,
    );

    expect(result.error).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(rpc).toHaveBeenCalledWith("search_published_practitioner_ids", {
      p_query: "published profile",
      p_area_slugs: ["support-area"],
      p_approach_slugs: [],
      p_works_with_slugs: [],
      p_location_slugs: [],
      p_format_values: ["online"],
      p_language_slugs: [],
    });
    expect(profileQuery.in).toHaveBeenCalledWith("id", ["profile-1"]);
  });

  it("parses and serializes canonical repeated directory parameters", async () => {
    const {
      parseDirectoryFilters,
      serializeDirectoryFilters,
    } = await import("@/lib/practitioners");
    const filters = parseDirectoryFilters(
      new URLSearchParams(
        "search=%20somatic%20&areas=b&areas=a&areas=b&areas=%20&format=online&format=in-person&format=hybrid&unknown=value",
      ),
    );

    expect(filters).toEqual({
      query: "somatic",
      areas: ["a", "b"],
      approach: [],
      "works-with": [],
      locations: [],
      format: ["in-person", "online"],
      languages: [],
    });
    expect(serializeDirectoryFilters(filters).toString()).toBe(
      "search=somatic&areas=a&areas=b&format=in-person&format=online",
    );
    expect(parseDirectoryFilters(serializeDirectoryFilters(filters))).toEqual(
      filters,
    );
  });
});


describe("portraitObjectPosition", () => {
  it("uses a high default crop so faces are not clipped", () => {
    expect(portraitObjectPosition()).toBe("50% 20%");
    expect(portraitObjectPosition(50, 50)).toBe("50% 20%");
  });

  it("keeps an explicit custom focal point", () => {
    expect(portraitObjectPosition(35, 65)).toBe("35% 65%");
  });
});
