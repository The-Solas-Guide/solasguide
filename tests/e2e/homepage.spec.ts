import { expect, test, type Locator } from "@playwright/test";

type FoundingPractitioner = {
  name: string;
  image: string;
  location: string;
  primaryPractice: string;
  supportingPractices: readonly string[];
  summary: string;
};

const foundingPractitioners: readonly FoundingPractitioner[] = [
  {
    name: "Riza Sukman",
    image: "/images/people/riza-sukman.jpg",
    location: "Ubud",
    primaryPractice: "Somatic Experiencing",
    supportingPractices: ["Bodywork", "Breathwork"],
    summary:
      "Riza offers somatic, trauma-informed support for people navigating grief, anxiety, relationship difficulties and disconnection from self.",
  },
  {
    name: "Pablo Castro",
    image: "/images/people/pablo-castro.jpg",
    location: "Ubud",
    primaryPractice: "Breathwork",
    supportingPractices: ["Water work", "Water therapy"],
    summary:
      "An Alchemy of Breath senior trainer with more than five years of experience across somatic, breathwork and water-based practice.",
  },
  {
    name: "Wayan Marcus Wistika",
    image: "/images/people/marcus-wistika.jpg",
    location: "Ubud",
    primaryPractice: "Vinyasa",
    supportingPractices: ["Power yoga", "Hatha"],
    summary:
      "A Balinese E-RYT 500+ teacher whose work includes resorts, hotels, private villas and The Yoga Barn.",
  },
  {
    name: "Pak Merta Ada",
    image: "/images/people/pak-merta-ada.jpg",
    location: "Sanur",
    primaryPractice: "Bali Usada health meditation",
    supportingPractices: [],
    summary:
      "A teacher within the Bali Usada lineage who has shared this practice internationally since 1993.",
  },
  {
    name: "Cat Wheeler",
    image: "/images/people/cat-wheeler.jpg",
    location: "Ubud",
    primaryPractice: "Usui Reiki",
    supportingPractices: ["Teaching", "Private sessions"],
    summary:
      "A Certified Reiki Master Teacher who has taught since 1998 and worked with more than 1,000 students.",
  },
  {
    name: "Ibu Jero",
    image: "/images/people/ibu-jero.jpg",
    location: "Jimbaran, Denpasar",
    primaryPractice: "Balinese traditional practice",
    supportingPractices: ["High priestess"],
    summary:
      "A fifth-generation Balinese Balian and Mangku whose practice includes private and group work.",
  },
  {
    name: "Sook Fun Chen",
    image: "/images/people/sook-fun-chen.jpg",
    location: "Seminyak, Ubud",
    primaryPractice: "Pilates",
    supportingPractices: ["Gyrotonic", "Rolfing"],
    summary:
      "Founder of Movement Matters Bali, with practice across Pilates, Gyrotonic, Rolfing and functional anatomy.",
  },
  {
    name: "Rachel Ellery",
    image: "/images/people/rachel-ellery.jpg",
    location: "Ubud",
    primaryPractice: "Osteopathy",
    supportingPractices: ["Functional anatomy", "Pilates"],
    summary:
      "A British School of Osteopathy graduate with more than 26 years of professional practice.",
  },
];

function getImageSourcePath(src: string | null) {
  if (!src) throw new Error("Founding practitioner image has no src attribute");

  const imageUrl = new URL(src, "http://127.0.0.1:3100");
  return imageUrl.searchParams.get("url") ?? imageUrl.pathname;
}

async function expectLoadedImage(image: Locator, expectedSource: string) {
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  expect(getImageSourcePath(await image.getAttribute("src"))).toBe(expectedSource);
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const candidate = element as HTMLImageElement;
        return candidate.complete && candidate.naturalWidth > 0;
      }),
    )
    .toBe(true);
}

async function expectPractitionerCard(card: Locator, practitioner: FoundingPractitioner) {
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { level: 3, name: practitioner.name, exact: true })).toBeVisible();
  await expect(card.getByText(practitioner.location, { exact: true })).toBeVisible();
  await expect(card.getByText("Specific modalities", { exact: true })).toBeAttached();
  await expect(card.getByText(practitioner.summary, { exact: true })).toBeVisible();

  await expect(
    card.getByText(
      [practitioner.primaryPractice, ...practitioner.supportingPractices].join(" · "),
      { exact: true },
    ),
  ).toBeVisible();

  await expectLoadedImage(card.locator("img"), practitioner.image);
}

test.describe("homepage", () => {
  test("follows the approved client flow", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Finding someone isn't difficult. Knowing who to trust is.",
      }),
    ).toBeVisible();

    const sections = [
      "Why The Solas Guide Exists",
      "Recognition is earned. Not purchased.",
      "Meet the Founding Practitioners",
      "Who the Guide is for",
      "Need help choosing?",
      "Professional enquiries",
      "Practitioner applications",
    ];

    for (const section of sections) {
      await expect(page.getByText(section, { exact: false }).first()).toBeVisible();
    }

    await expect(page.getByText("Recognised venues", { exact: false })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Start Questionnaire" }).first()).toHaveAttribute(
      "href",
      "/find-a-match",
    );
    await expect(page.getByRole("link", { name: "Apply for Recognition" }).first()).toHaveAttribute(
      "href",
      "/become-a-practitioner",
    );
  });

  test("shows a static founding practitioner preview", async ({ page }) => {
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry).toBeVisible();
    await expect(
      registry.getByText(
        "The inaugural edition of The Solas Guide brings together practitioners recognised for the quality of their work, depth of practice and professional standing.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      registry.getByText(
        "Browse the Guide or explore individual editorial profiles to understand who may be the right fit.",
        { exact: true },
      ),
    ).toBeVisible();

    const cards = registry.locator("article");
    await expect(cards).toHaveCount(foundingPractitioners.length);

    for (const [index, practitioner] of foundingPractitioners.entries()) {
      await expectPractitionerCard(cards.nth(index), practitioner);
    }

    await expect(registry.getByRole("link")).toHaveCount(1);
    await expect(registry.getByRole("link", { name: /Riza Sukman/ })).toHaveAttribute(
      "href",
      "/practitioners/riza-sukman",
    );
    await expect(registry.getByText("Build Your Retreat", { exact: true })).toHaveCount(0);
  });

  test("keeps all founding practitioner cards loaded at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    const cards = registry.locator("article");
    await expect(cards).toHaveCount(foundingPractitioners.length);

    for (const [index, practitioner] of foundingPractitioners.entries()) {
      const card = cards.nth(index);
      await expect(card).toBeVisible();
      await expectLoadedImage(card.locator("img"), practitioner.image);
    }

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasOverflow).toBe(false);
  });
});
