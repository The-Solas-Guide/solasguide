import { expect, test, type Page } from "@playwright/test";
import { installPractitionerImageFixture } from "./practitioner-fixtures";

function cards(page: Page) {
  return page.locator("main ul li article");
}

test.beforeEach(async ({ page }) => {
  await installPractitionerImageFixture(page);
});

test.describe("published practitioner directory", () => {
  test("renders published cards and loaded profile images", async ({ page }) => {
    await page.goto("/practitioners");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The founding practitioners of The Solas Guide.",
      }),
    ).toBeVisible();
    await expect(page.getByText("Showing 3 of 3 practitioners")).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(cards(page).getByRole("heading", { name: "Kartika Alexandra" })).toBeVisible();
    await expect(cards(page).getByRole("heading", { name: "Sandra Echemendia" })).toBeVisible();
    await expect(cards(page).getByRole("heading", { name: "Indri Hapsari" })).toBeVisible();

    for (const image of await cards(page).locator("img").all()) {
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test("searches profile fields and every linked taxonomy term", async ({ page }) => {
    await page.goto("/practitioners");
    const search = page.getByLabel("Search the Guide");

    await search.fill("HHHypnosis");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Kartika Alexandra" })).toBeVisible();

    await search.fill("breathwork");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Indri Hapsari" })).toBeVisible();

    await search.fill("strategy");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Sandra Echemendia" })).toBeVisible();
  });

  test("filters by linked areas, approaches, audiences, locations, format, and languages", async ({ page }) => {
    await page.goto("/practitioners");
    const cases = [
      ["Areas of support", "trauma-and-nervous-system", "Kartika Alexandra"],
      ["Approach", "coaching", "Sandra Echemendia"],
      ["Works with", "groups", "Indri Hapsari"],
      ["Location", "international", "Sandra Echemendia"],
      ["In-person or online", "online", ""],
      ["Languages", "english", ""],
    ] as const;

    for (const [label, value, expectedName] of cases) {
      await page.getByRole("button", { name: /Filters/ }).click();
      const dialog = page.getByRole("dialog", { name: "Filters" });
      await dialog.getByLabel(label, { exact: true }).selectOption(value);
      await dialog.getByRole("button", { name: /Show .* results/ }).click();

      await expect(cards(page)).toHaveCount(expectedName ? 1 : 3);
      if (expectedName) {
        await expect(cards(page).getByRole("heading", { name: expectedName })).toBeVisible();
      }
      await page.getByRole("button", { name: "Clear all" }).click();
      await expect(cards(page)).toHaveCount(3);
    }
  });

  test("supports keyboard close and trigger focus restoration for filters", async ({ page }) => {
    await page.goto("/practitioners");
    const trigger = page.getByRole("button", { name: /Filters/ });
    await trigger.focus();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("renders optional profile fields only when supplied", async ({ page }) => {
    await page.goto("/practitioners/indri-hapsari");

    await expect(page.getByRole("heading", { level: 1, name: "Indri Hapsari" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Credentials and significant training" })).toBeVisible();
    await expect(page.getByText("Significant training", { exact: true })).toBeVisible();
    await expect(page.getByText("Credentials", { exact: true })).toHaveCount(0);
    const profile = page.locator("main article");
    await expect(profile.getByRole("link", { name: "Website" })).toHaveCount(0);
    await expect(profile.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/indrihapsari___/",
    );
  });

  test("renders the dynamic profile route, external links, and focal image position", async ({ page }) => {
    await page.goto("/practitioners/kartika-alexandra");

    await expect(page).toHaveTitle(/Kartika Alexandra \| The Solas Guide/);
    await expect(page.getByRole("heading", { level: 1, name: "Kartika Alexandra" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(page.getByText("Credentials", { exact: true })).toBeVisible();
    const profile = page.locator("main article");
    await expect(profile.getByRole("link", { name: "Website" })).toHaveAttribute(
      "href",
      "https://www.kartikaalexandra.com/",
    );
    await expect(profile.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/kartikaalexandra/",
    );

    const image = page.locator("main article img");
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-position", "35% 65%");
  });
});

test.describe("published practitioner directory at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stacks cards, keeps the profile usable, and contains the filter dialog", async ({ page }) => {
    await page.goto("/practitioners");
    await expect(cards(page)).toHaveCount(3);

    const firstCard = await cards(page).nth(0).boundingBox();
    const secondCard = await cards(page).nth(1).boundingBox();
    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(secondCard!.y).toBeGreaterThan(firstCard!.y + 20);

    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);

    await page.goto("/practitioners/indri-hapsari");
    await expect(page.getByRole("heading", { level: 1, name: "Indri Hapsari" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });
});
