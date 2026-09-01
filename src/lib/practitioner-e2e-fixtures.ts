import type { Database } from "@/types/database";

type PractitionerRow = Database["public"]["Tables"]["practitioners"]["Row"];
type PractitionerTermRow = Database["public"]["Tables"]["practitioner_terms"]["Row"];
type PractitionerTermLinkRow = Database["public"]["Tables"]["practitioner_term_links"]["Row"];

const timestamp = "2026-08-27T00:00:00.000Z";

const profiles: PractitionerRow[] = [
  {
    id: "e2e-profile-kartika",
    slug: "kartika-alexandra",
    name: "Kartika Alexandra",
    descriptor: "Subconscious Mind & Trauma Specialist · Integrative Hypnotherapist",
    years_active: 10,
    summary:
      "Works with subconscious patterns, trauma and nervous-system regulation to support lasting change in wellbeing, relationships and performance.",
    about:
      "Kartika Alexandra is an Indonesian-Canadian integrative hypnotherapist, subconscious mind specialist and trauma-informed practitioner. Her work focuses on identifying and resolving subconscious patterns that can shape wellbeing, relationships and performance. She works internationally with founders, executives, leaders and other high-performing individuals, and is the founder of Maja Healing and HHHypnosis®.",
    credentials: [
      "BA Psychology, University of British Columbia",
      "Founder, Maja Healing",
      "Founder, HHHypnosis®",
    ],
    significant_training: null,
    offers_in_person: true,
    offers_online: true,
    website_url: "https://www.kartikaalexandra.com/",
    instagram_url: "https://www.instagram.com/kartikaalexandra/",
    image_path: "e2e/neutral-practitioner.svg",
    image_alt: "Neutral profile image",
    image_focal_x: 35,
    image_focal_y: 65,
    status: "published",
    published_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "e2e-profile-sandra",
    slug: "sandra-echemendia",
    name: "Sandra Echemendia",
    descriptor: "Strategy Advisor · Mentor · Entrepreneur",
    years_active: 20,
    summary:
      "Supports entrepreneurs and organisations through growth, change and transformation with greater clarity, structure and alignment.",
    about:
      "Sandra Echemendia is a strategy advisor, mentor and entrepreneur whose work focuses on helping people and organisations navigate growth, change and transformation. Her background spans business strategy, leadership, organisational development and personal development, bringing a practical and systems-oriented perspective to individual and professional change.",
    credentials: [
      "20+ years in strategy, leadership, organisational development and entrepreneurship",
    ],
    significant_training: null,
    offers_in_person: true,
    offers_online: true,
    website_url: null,
    instagram_url: "https://www.instagram.com/sandra.echemendia_en/",
    image_path: "e2e/neutral-practitioner.svg",
    image_alt: "Neutral profile image",
    image_focal_x: 50,
    image_focal_y: 50,
    status: "published",
    published_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "e2e-profile-indri",
    slug: "indri-hapsari",
    name: "Indri Hapsari",
    descriptor: "Breathwork · Reiki · Prenatal Yoga · Aquatic Bodywork",
    years_active: null,
    summary:
      "Works with breath and body-based practices to support regulation, recovery, transition and deeper self-connection.",
    about:
      "Indri Hapsari is an Indonesian breathwork and body-based practitioner. Her work spans breathwork, Reiki, prenatal yoga and aquatic bodywork, with experience supporting people through stress, anxiety, addiction recovery and major life transitions. She has trained and practised in Bali for many years.",
    credentials: null,
    significant_training: [
      "10-month breathwork facilitator training (2017–18)",
      "Reiki Levels 1 & 2, Asian Healing Arts Center (2018)",
      "Prenatal Yoga training (2018)",
    ],
    offers_in_person: true,
    offers_online: true,
    website_url: null,
    instagram_url: "https://www.instagram.com/indrihapsari___/",
    image_path: "e2e/neutral-practitioner.svg",
    image_alt: "Neutral profile image",
    image_focal_x: 50,
    image_focal_y: 50,
    status: "published",
    published_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

type TermDefinition = readonly [string, string, string, number];

const terms: PractitionerTermRow[] = [
  ...([
    ["support_area", "Trauma & nervous system", "trauma-and-nervous-system", 10],
    ["support_area", "Leadership & work", "leadership-and-work", 50],
    ["support_area", "Women’s wellbeing", "womens-wellbeing", 90],
    ["approach", "Therapy & counselling", "therapy-and-counselling", 10],
    ["approach", "Coaching", "coaching", 30],
    ["approach", "Breathwork", "breathwork", 80],
    ["modality", "Integrative hypnotherapy", "integrative-hypnotherapy", 10],
    ["modality", "Strategy advisory", "strategy-advisory", 40],
    ["modality", "Breathwork", "breathwork", 340],
    ["works_with", "Individuals", "individuals", 10],
    ["works_with", "Leaders & professional teams", "leaders-professional-teams", 20],
    ["works_with", "Groups", "groups", 30],
    ["location", "Bali", "bali", 10],
    ["location", "International", "international", 20],
    ["language", "English", "english", 10],
  ] satisfies readonly TermDefinition[]).map(([type, name, slug, sort_order], index) => ({
    id: `e2e-term-${index + 1}`,
    type,
    name,
    slug,
    sort_order,
    is_active: true,
  })),
  {
    id: "e2e-term-inactive-location",
    type: "location",
    name: "Inactive location",
    slug: "inactive-location",
    sort_order: 90,
    is_active: false,
  },
  {
    id: "e2e-term-unlinked-area",
    type: "support_area",
    name: "Unlinked area",
    slug: "unlinked-area",
    sort_order: 110,
    is_active: true,
  },
];

const termId = new Map(terms.map((term) => [`${term.type}:${term.slug}`, term.id]));

const linkDefinitions = [
  [
    "e2e-profile-kartika",
    [
      ["support_area", "trauma-and-nervous-system"],
      ["support_area", "leadership-and-work"],
      ["approach", "therapy-and-counselling"],
      ["modality", "integrative-hypnotherapy"],
      ["works_with", "individuals"],
      ["works_with", "leaders-professional-teams"],
      ["location", "bali"],
      ["language", "english"],
    ],
  ],
  [
    "e2e-profile-sandra",
    [
      ["support_area", "leadership-and-work"],
      ["approach", "coaching"],
      ["modality", "strategy-advisory"],
      ["works_with", "individuals"],
      ["works_with", "leaders-professional-teams"],
      ["location", "bali"],
      ["location", "international"],
      ["language", "english"],
    ],
  ],
  [
    "e2e-profile-indri",
    [
      ["support_area", "womens-wellbeing"],
      ["approach", "breathwork"],
      ["modality", "breathwork"],
      ["works_with", "groups"],
      ["location", "bali"],
      ["language", "english"],
    ],
  ],
] as const;

const links: PractitionerTermLinkRow[] = linkDefinitions.flatMap(
  ([practitioner_id, typedSlugs]) =>
    typedSlugs.map(([type, slug], display_order) => ({
      practitioner_id,
      term_id: termId.get(`${type}:${slug}`)!,
      display_order,
    })),
);

/**
 * This fixture is used only when the explicit local browser-test environment
 * is enabled. Production reads always use the public Supabase query.
 */
export function getPractitionerE2EFixtures() {
  return { profiles, terms, links };
}
