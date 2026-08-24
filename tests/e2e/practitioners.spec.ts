import { expect, test, type Page } from "@playwright/test";

const totalPractitioners = 8;

function cards(page: Page) {
  return page.locator("main ul li article");
}

function resultsCount(page: Page) {
  return page.getByText(/Showing \d+ of \d+ practitioners/);
}

async function checkFilter(page: Page, group: string, option: string) {
  await page.getByLabel(group, { exact: true }).selectOption(option);
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
    await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(
      0,
    );
  });

  test("narrows results with local keyword search", async ({ page }) => {
    await page.goto("/practitioners");

    await page.getByLabel("Search the Guide").fill("reiki");

    await expect(cards(page)).toHaveCount(1);
    await expect(resultsCount(page)).toHaveText(
      `Showing 1 of ${totalPractitioners} practitioners`,
    );
    await expect(
      page.getByRole("heading", { level: 3, name: "Cat Wheeler" }),
    ).toBeVisible();

    // Search also reaches the name and the location, not only the practices.
    await page.getByLabel("Search the Guide").fill("sanur");
    await expect(cards(page)).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 3, name: "Pak Merta Ada" }),
    ).toBeVisible();
  });

  test("combines search with filters and removes them individually", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    await checkFilter(page, "Modality", "Pilates");
    await expect(cards(page)).toHaveCount(2);

    await checkFilter(page, "Location", "Seminyak");
    await expect(cards(page)).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 3, name: "Sook Fun Chen" }),
    ).toBeVisible();

    // Search narrows further on top of the two active filters.
    await page.getByLabel("Search the Guide").fill("Rolfing");
    await expect(cards(page)).toHaveCount(1);
    await page.getByLabel("Search the Guide").fill("Osteopathy");
    await expect(cards(page)).toHaveCount(0);
    await page.getByLabel("Search the Guide").fill("");

    const activeFilters = page
      .getByRole("list", { name: "Active filters" })
      .getByRole("button");
    await expect(activeFilters).toHaveCount(2);

    // Removing one filter widens the results back out.
    await page
      .getByRole("button", { name: "Remove Location filter Seminyak" })
      .click();
    await expect(activeFilters).toHaveCount(1);
    await expect(cards(page)).toHaveCount(2);
  });

  test("clears every filter and the search term at once", async ({ page }) => {
    await page.goto("/practitioners");

    await checkFilter(page, "Modality", "Breathwork");
    await page.getByLabel("Search the Guide").fill("Pablo");
    await expect(cards(page)).toHaveCount(1);

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(cards(page)).toHaveCount(totalPractitioners);
    await expect(page.getByLabel("Search the Guide")).toHaveValue("");
    await expect(
      page.getByRole("list", { name: "Active filters" }),
    ).toHaveCount(0);
  });

  test("shows an empty state that can be recovered from", async ({ page }) => {
    await page.goto("/practitioners");

    await page.getByLabel("Search the Guide").fill("kitesurfing");

    await expect(cards(page)).toHaveCount(0);
    await expect(resultsCount(page)).toHaveText(
      `Showing 0 of ${totalPractitioners} practitioners`,
    );
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "No practitioners match yet.",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear all filters" }).click();

    await expect(cards(page)).toHaveCount(totalPractitioners);
    await expect(page.getByLabel("Search the Guide")).toHaveValue("");
  });

  test("places the requested filter structure above the results", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    const filters = page.getByRole("complementary", {
      name: "Filter practitioners",
    });
    for (const field of [
      "Search the Guide",
      "Pathway",
      "Modality",
      "Location",
      "Format",
    ]) {
      await expect(filters.getByLabel(field, { exact: true })).toBeVisible();
    }
    await expect(filters.getByLabel("Pathway")).toBeDisabled();
    await expect(filters.getByLabel("Format")).toBeDisabled();
  });
});

test.describe("practitioner profile", () => {
  test("navigates from the listing to the Riza Sukman profile and back", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    await page.getByRole("link", { name: /Riza Sukman/ }).click();
    await expect(page).toHaveURL("/practitioners/riza-sukman");

    await expect(
      page.getByRole("heading", { level: 1, name: "Riza Sukman" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Riza is trained in Somatic Experiencing.*support in Bali\./,
      ),
    ).toBeVisible();

    const credentialRecord = page.getByRole("region", {
      name: "Credential record",
    });
    for (const field of [
      "Accreditation",
      "Training",
      "Pathway",
      "Practitioner tier",
      "CPD log",
    ]) {
      await expect(
        credentialRecord.getByText(field, { exact: true }),
      ).toBeVisible();
    }
    await expect(
      credentialRecord.getByText("Somatic Experiencing", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Editorial profile" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Practice formats" }),
    ).toContainText("Retreat-intensive work");
    const practical = page.getByRole("region", { name: "Practical" });
    for (const field of ["Languages", "Formats", "Working from", "Currently"]) {
      await expect(practical.getByText(field, { exact: true })).toBeVisible();
    }
    await expect(
      practical.getByText("Ubud, Bali", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "References on file" }),
    ).toBeVisible();

    await expect(
      page
        .getByRole("region", {
          name: "Would you like to explore an introduction?",
        })
        .getByRole("link", { name: "Begin your enquiry" }),
    ).toHaveAttribute("href", "/find-a-match");

    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Practitioners" })
      .click();
    await expect(page).toHaveURL("/practitioners");
  });

  test("publishes no invented standing or private contact details", async ({
    page,
  }) => {
    await page.goto("/practitioners/riza-sukman");

    const body = page.locator("body");
    for (const forbidden of [
      "Lead Practitioner",
      "Listed · current",
      "WhatsApp",
      "@",
      "+62",
    ]) {
      await expect(body).not.toContainText(forbidden);
    }
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  });

  test("only the practitioner with a published profile is linked", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    await expect(page.locator('main a[href^="/practitioners/"]')).toHaveCount(
      1,
    );
    await expect(page.getByText("View editorial profile")).toHaveCount(0);
  });
});

test.describe("practitioner prototype at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stacks the top filters and avoids horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/practitioners");

    const filters = page.getByRole("complementary", {
      name: "Filter practitioners",
    });
    await expect(filters).toBeVisible();

    await checkFilter(page, "Location", "Ubud");
    await expect(cards(page)).toHaveCount(6);

    await expect(
      page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });

  test("renders the profile without horizontal overflow", async ({ page }) => {
    await page.goto("/practitioners/riza-sukman");

    await expect(
      page.getByRole("heading", { level: 1, name: "Riza Sukman" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });
});
