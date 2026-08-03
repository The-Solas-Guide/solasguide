export type Practitioner = {
  slug: string;
  name: string;
  modality: string;
  location: string;
  descriptor: string;
  experience: string;
  imageSrc: string;
  imageAlt: string;
};

export const practitioners: Practitioner[] = [
  {
    slug: "made-wirawan",
    name: "Made Wirawan",
    modality: "Balinese traditional healing",
    location: "Ubud · Bali",
    descriptor: "A place-rooted practice shaped by family lineage, careful listening, and more than two decades of active work.",
    experience: "22 years active practice",
    imageSrc: "/images/solas-imagery/journey-practitioner.png",
    imageAlt: "Made Wirawan seated in an open-air pavilion surrounded by greenery",
  },
  {
    slug: "elena-marchetti",
    name: "Elena Marchetti",
    modality: "Somatic therapy",
    location: "Ubud · Bali",
    descriptor: "A body-led practice grounded in clinical training, nervous-system awareness, and long-term client work.",
    experience: "14 years active practice",
    imageSrc: "/images/solas-imagery/journey-practitioner.png",
    imageAlt: "Elena Marchetti in a natural-light timber practice room",
  },
  {
    slug: "sofia-lindqvist",
    name: "Sofia Lindqvist",
    modality: "Breathwork",
    location: "Canggu · Bali",
    descriptor: "Small, focused breathwork sessions with a clear emphasis on preparation, integration, and personal context.",
    experience: "9 years active practice",
    imageSrc: "/images/solas-imagery/journey-practitioner.png",
    imageAlt: "Sofia Lindqvist walking beside a shaded retreat building",
  },
  {
    slug: "ayu-pradnyani",
    name: "Ayu Pradnyani",
    modality: "Yoga and meditation",
    location: "Sanur · Bali",
    descriptor: "Private and small-group practices that bring breath, movement, and attentive pacing into one coherent session.",
    experience: "12 years active practice",
    imageSrc: "/images/solas-imagery/journey-practitioner.png",
    imageAlt: "A practitioner seated in a calm open-air studio",
  },
  {
    slug: "dharma-santoso",
    name: "Dharma Santoso",
    modality: "Bodywork",
    location: "Ubud · Bali",
    descriptor: "A practical bodywork approach informed by movement, recovery, and an understanding of the visitor's wider stay.",
    experience: "17 years active practice",
    imageSrc: "/images/solas-imagery/journey-practitioner.png",
    imageAlt: "A practitioner preparing a calm treatment space",
  },
  {
    slug: "maya-rahardjo",
    name: "Maya Rahardjo",
    modality: "Sound and music practice",
    location: "North Bali",
    descriptor: "Intimate sound-led experiences designed around setting, group needs, and enough space for quiet integration.",
    experience: "11 years active practice",
    imageSrc: "/images/solas-imagery/how-it-works-brief.png",
    imageAlt: "A sound-led gathering in a natural setting",
  },
];

export const featuredPractitioner = practitioners[0];


