import { expect, test, type Page } from "@playwright/test";

function cards(page: Page) {
  return page.locator("main ul li article");
}

test.describe("practitioner directory", () => {
  test("shows the empty local state when no profiles are published", async ({ page }) => {
    await page.goto("/practitioners");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The founding practitioners of The Solas Guide.",
      }),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    await expect(
      page
        .getByText("Showing 0 of 0 practitioners")
        .or(page.getByRole("status")),
    ).toBeVisible();
  });

  test("keeps search and all taxonomy filters empty without published records", async ({ page }) => {
    await page.goto("/practitioners");

    const search = page.getByLabel("Search the Guide");
    if (!(await search.isVisible())) {
      await expect(page.getByRole("status")).toBeVisible();
      return;
    }

    await search.fill("somatic");
    await expect(cards(page)).toHaveCount(0);
    await expect(page.getByText("Showing 0 of 0 practitioners")).toBeVisible();

    await page.getByRole("button", { name: "Filters" }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    for (const field of [
      "Areas of support",
      "Approach",
      "Works with",
      "Location",
      "In-person or online",
      "Languages",
    ]) {
      await expect(dialog.getByLabel(field, { exact: true })).toBeDisabled();
    }
  });

  test("shows a safe state for an unavailable profile route", async ({ page }) => {
    await page.goto("/practitioners/riza-sukman");
    await expect(
      page
        .getByRole("heading", { name: "This profile is unavailable right now." })
        .or(page.getByText("This page could not be found.", { exact: true })),
    ).toBeVisible();
  });
});

test.describe("practitioner directory at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens filters without horizontal overflow", async ({ page }) => {
    await page.goto("/practitioners");

    const searchInput = page.getByLabel("Search the Guide");
    if (!(await searchInput.isVisible())) {
      await expect(page.getByRole("status")).toBeVisible();
      return;
    }

    const search = await searchInput.boundingBox();
    const filterButton = await page.getByRole("button", { name: "Filters" }).boundingBox();
    expect(search).not.toBeNull();
    expect(filterButton).not.toBeNull();
    expect(Math.abs(search!.y - filterButton!.y)).toBeLessThan(4);

    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });
});
