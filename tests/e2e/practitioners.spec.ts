import { expect, test, type Page } from "@playwright/test";

const totalPractitioners = 8;

function cards(page: Page) {
  return page.locator("main ul li article");
}

function resultsCount(page: Page) {
  return page.getByText(/Showing \d+ of \d+ practitioners/);
}

async function checkFilter(page: Page, group: string, option: string) {
  await page
    .getByRole("group", { name: group })
    .getByRole("checkbox", { name: option, exact: true })
    .check();
}

test.describe("practitioner listing", () => {
  test("lists every founding practitioner by default", async ({ page }) => {
    await page.goto("/practitioners");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The founding practitioners of The Solas Guide.",
      }),
    ).toBeVisible();

    await expect(cards(page)).toHaveCount(totalPractitioners);
    await expect(resultsCount(page)).toHaveText(
      `Showing ${totalPractitioners} of ${totalPractitioners} practitioners`,
    );
    await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(0);
  });

  test("narrows results with local keyword search", async ({ page }) => {
    await page.goto("/practitioners");

    await page.getByLabel("Search the Guide").fill("reiki");

    await expect(cards(page)).toHaveCount(1);
    await expect(resultsCount(page)).toHaveText(`Showing 1 of ${totalPractitioners} practitioners`);
    await expect(page.getByRole("heading", { level: 3, name: "Cat Wheeler" })).toBeVisible();

    // Search also reaches the name and the location, not only the practices.
    await page.getByLabel("Search the Guide").fill("sanur");
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 3, name: "Pak Merta Ada" })).toBeVisible();
  });

  test("combines search with filters and removes them individually", async ({ page }) => {
    await page.goto("/practitioners");

    await checkFilter(page, "Areas of support", "Pilates");
    await expect(cards(page)).toHaveCount(2);

    await checkFilter(page, "Location", "Seminyak");
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 3, name: "Sook Fun Chen" })).toBeVisible();

    // Search narrows further on top of the two active filters.
    await page.getByLabel("Search the Guide").fill("Rolfing");
    await expect(cards(page)).toHaveCount(1);
    await page.getByLabel("Search the Guide").fill("Osteopathy");
    await expect(cards(page)).toHaveCount(0);
    await page.getByLabel("Search the Guide").fill("");

    const activeFilters = page.getByRole("list", { name: "Active filters" }).getByRole("button");
    await expect(activeFilters).toHaveCount(2);

    // Removing one filter widens the results back out.
    await page.getByRole("button", { name: "Remove Location filter Seminyak" }).click();
    await expect(activeFilters).toHaveCount(1);
    await expect(cards(page)).toHaveCount(2);
  });

  test("clears every filter and the search term at once", async ({ page }) => {
    await page.goto("/practitioners");

    await checkFilter(page, "Areas of support", "Breathwork");
    await page.getByLabel("Search the Guide").fill("Pablo");
    await expect(cards(page)).toHaveCount(1);

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(cards(page)).toHaveCount(totalPractitioners);
    await expect(page.getByLabel("Search the Guide")).toHaveValue("");
    await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
  });

  test("shows an empty state that can be recovered from", async ({ page }) => {
    await page.goto("/practitioners");

    await page.getByLabel("Search the Guide").fill("kitesurfing");

    await expect(cards(page)).toHaveCount(0);
    await expect(resultsCount(page)).toHaveText(`Showing 0 of ${totalPractitioners} practitioners`);
    await expect(
      page.getByRole("heading", { level: 2, name: "No practitioners match yet." }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear all filters" }).click();

    await expect(cards(page)).toHaveCount(totalPractitioners);
    await expect(page.getByLabel("Search the Guide")).toHaveValue("");
  });

  test("only offers filters the published profiles support", async ({ page }) => {
    await page.goto("/practitioners");

    const filters = page.getByRole("complementary", { name: "Filter practitioners" });
    await expect(filters.getByRole("group")).toHaveCount(2);
    await expect(filters.getByRole("group", { name: "Areas of support" })).toBeVisible();
    await expect(filters.getByRole("group", { name: "Location" })).toBeVisible();

    for (const absent of ["Approach", "Works with", "In-person or online", "Language"]) {
      await expect(filters.getByRole("group", { name: absent })).toHaveCount(0);
    }
  });
});

test.describe("practitioner profile", () => {
  test("navigates from the listing to the Riza Sukman profile and back", async ({ page }) => {
    await page.goto("/practitioners");

    await page.getByRole("link", { name: "View editorial profile" }).click();
    await expect(page).toHaveURL("/practitioners/riza-sukman");

    await expect(page.getByRole("heading", { level: 1, name: "Riza Sukman" })).toBeVisible();
    await expect(
      page.getByText(
        "Trained in Somatic Experiencing, with experience supporting retreat-intensive work.",
        { exact: true },
      ),
    ).toBeVisible();

    const areas = page.getByRole("region", { name: "Areas of support" });
    for (const modality of ["Somatic Experiencing", "Bodywork", "Breathwork"]) {
      await expect(areas.getByText(modality, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("region", { name: "Location" }).getByText("Ubud")).toBeVisible();

    await expect(page.getByRole("link", { name: "Find a Match" })).toHaveAttribute(
      "href",
      "/find-a-match",
    );

    await page.getByRole("link", { name: "Back to the Guide" }).click();
    await expect(page).toHaveURL("/practitioners");
  });

  test("publishes no tier, listing status or private contact details", async ({ page }) => {
    await page.goto("/practitioners/riza-sukman");

    const body = page.locator("body");
    for (const forbidden of ["Tier", "Listed", "WhatsApp", "@", "+62"]) {
      await expect(body).not.toContainText(forbidden);
    }
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  });

  test("only the practitioner with a published profile is linked", async ({ page }) => {
    await page.goto("/practitioners");

    await expect(page.getByRole("link", { name: "View editorial profile" })).toHaveCount(1);
    await expect(page.locator('main a[href^="/practitioners/"]')).toHaveCount(2);
  });
});

test.describe("practitioner prototype at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps filters behind a toggle and avoids horizontal overflow", async ({ page }) => {
    await page.goto("/practitioners");

    const filters = page.getByRole("complementary", { name: "Filter practitioners" });
    await expect(filters).toBeHidden();

    const toggle = page.getByRole("button", { name: /^Filters/ });
    await toggle.click();
    await expect(filters).toBeVisible();

    await checkFilter(page, "Location", "Ubud");
    await expect(toggle).toHaveText(/Filters \(1\)/);
    await expect(cards(page)).toHaveCount(6);

    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });

  test("renders the profile without horizontal overflow", async ({ page }) => {
    await page.goto("/practitioners/riza-sukman");

    await expect(page.getByRole("heading", { level: 1, name: "Riza Sukman" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });
});
