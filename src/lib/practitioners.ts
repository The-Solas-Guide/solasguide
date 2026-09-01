export type Practitioner = {
  slug: string;
  name: string;
  location: string;
  descriptor?: string;
  modalities: readonly string[];
  summary: string;
  about?: string;
  areasOfSupport?: readonly string[];
  approach?: string;
  worksWith?: readonly string[];
  languages?: readonly string[];
  delivery?: readonly string[];
  yearsActive?: number;
  credentials?: readonly string[];
  significantTraining?: readonly string[];
  image: string;
  imageAlt: string;
  imagePosition?: string;
  /**
   * Only practitioners with a published editorial profile route are linked from
   * the listing. Everyone else renders as a card without a profile link.
   */
  hasPublishedProfile?: boolean;
};

/**
 * The eight founding practitioners, with copy and imagery exactly as approved
 * for the homepage registry preview. Do not add fields that the approved copy
 * does not already support.
 */
export const practitioners: readonly Practitioner[] = [
  {
    slug: "riza-sukman",
    name: "Riza Sukman",
    location: "Ubud",
    descriptor: "Somatic practitioner working with integrative trauma work, parts work and embodied healing",
    modalities: ["Somatic Experiencing", "Bodywork", "Breathwork"],
    summary:
      "Riza offers somatic, trauma-informed support for people navigating grief, anxiety, relationship difficulties and disconnection from self.",
    about:
      "Riza Sukman is a somatic practitioner whose work brings together body-based awareness, parts work and integrative trauma support. His sessions focus on creating space to notice sensations, emotions and protective patterns at a manageable pace. Riza describes his approach as compassionate, present and trauma-informed, with particular attention to grief, anxiety, relationship difficulties, emotional overwhelm and disconnection from self.",
    areasOfSupport: [
      "Relationships & intimacy",
      "Anxiety & emotional wellbeing",
      "Trauma & nervous system",
      "Grief & loss",
    ],
    approach: "Somatic & body-based",
    worksWith: ["Individuals"],
    languages: ["English"],
    credentials: [
      "Certificate in Integrative Somatic Trauma Therapy — The Embody Lab",
      "Certificate in Somatic Parts Work — The Embody Lab",
    ],
    significantTraining: [
      "Family Constellations — European Institute for Systemic Education and Coaching",
      "200-hour Yoga Teacher Training — Ki McGraw and Bob Smith",
      "Vipassana meditation practice spanning more than a decade",
    ],
    image: "/images/people/riza-sukman.jpg",
    imageAlt: "Portrait of Riza Sukman",
    hasPublishedProfile: true,
  },
  {
    slug: "pablo-castro",
    name: "Pablo Castro",
    location: "Ubud",
    modalities: ["Breathwork", "Water work", "Water therapy"],
    summary:
      "An Alchemy of Breath senior trainer with more than five years of experience across somatic, breathwork and water-based practice.",
    image: "/images/people/pablo-castro.jpg",
    imageAlt: "Portrait of Pablo Castro",
  },
  {
    slug: "wayan-marcus-wistika",
    name: "Wayan Marcus Wistika",
    location: "Ubud",
    modalities: ["Vinyasa", "Power yoga", "Hatha"],
    summary:
      "A Balinese E-RYT 500+ teacher whose work includes resorts, hotels, private villas and The Yoga Barn.",
    image: "/images/people/marcus-wistika.jpg",
    imageAlt: "Wayan Marcus Wistika practising yoga outdoors",
    imagePosition: "object-[72%_center]",
  },
  {
    slug: "pak-merta-ada",
    name: "Pak Merta Ada",
    location: "Sanur",
    modalities: ["Bali Usada health meditation"],
    summary:
      "A teacher within the Bali Usada lineage who has shared this practice internationally since 1993.",
    image: "/images/people/pak-merta-ada.jpg",
    imageAlt: "Portrait of Pak Merta Ada",
  },
  {
    slug: "cat-wheeler",
    name: "Cat Wheeler",
    location: "Ubud",
    modalities: ["Usui Reiki", "Teaching", "Private sessions"],
    summary:
      "A Certified Reiki Master Teacher who has taught since 1998 and worked with more than 1,000 students.",
    image: "/images/people/cat-wheeler.jpg",
    imageAlt: "Cat Wheeler seated with her dog",
    imagePosition: "object-left",
  },
  {
    slug: "ibu-jero",
    name: "Ibu Jero",
    location: "Jimbaran, Denpasar",
    modalities: ["Balinese traditional practice", "High priestess"],
    summary:
      "A fifth-generation Balinese Balian and Mangku whose practice includes private and group work.",
    image: "/images/people/ibu-jero.jpg",
    imageAlt: "Ibu Jero standing at a Balinese water temple",
  },
  {
    slug: "sook-fun-chen",
    name: "Sook Fun Chen",
    location: "Seminyak, Ubud",
    modalities: ["Pilates", "Gyrotonic", "Rolfing"],
    summary:
      "Founder of Movement Matters Bali, with practice across Pilates, Gyrotonic, Rolfing and functional anatomy.",
    image: "/images/people/sook-fun-chen.jpg",
    imageAlt: "Portrait of Sook Fun Chen",
  },
  {
    slug: "rachel-ellery",
    name: "Rachel Ellery",
    location: "Ubud",
    modalities: ["Osteopathy", "Functional anatomy", "Pilates"],
    summary:
      "A British School of Osteopathy graduate with more than 26 years of professional practice.",
    image: "/images/people/rachel-ellery.jpg",
    imageAlt: "Rachel Ellery holding an anatomical spine model",
  },
];

export function getPractitionerBySlug(slug: string) {
  return practitioners.find((practitioner) => practitioner.slug === slug);
}

/** A practitioner's approved location string may name more than one place. */
export function getLocations(practitioner: Practitioner) {
  return practitioner.location.split(",").map((place) => place.trim());
}

function sortedUnique(values: readonly string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * Facet options are derived from the approved copy only, so every option is
 * backed by a practitioner record rather than an invented taxonomy.
 */
export const areaOfSupportOptions = sortedUnique(
  practitioners.flatMap((practitioner) => practitioner.modalities),
);

export const locationOptions = sortedUnique(practitioners.flatMap(getLocations));
