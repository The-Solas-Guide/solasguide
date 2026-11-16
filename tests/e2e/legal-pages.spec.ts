import { expect, test } from "@playwright/test";

const legalPages = [
  {
    path: "/privacy",
    heading: "Privacy policy",
    title: "Privacy policy · The Solas Guide",
    description:
      "How The Solas Guide collects, uses, and shares personal information from this website, enquiries, and membership applications.",
  },
  {
    path: "/terms",
    heading: "Website terms of use",
    title: "Website terms of use · The Solas Guide",
    description:
      "The terms for using The Solas Guide website, sending an enquiry, and applying for practitioner membership.",
  },
] as const;

for (const legalPage of legalPages) {
  test(`${legalPage.heading} explains the live site and marks unknown details`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(legalPage.path);

    await expect(page).toHaveTitle(legalPage.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", legalPage.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `http://localhost:3000${legalPage.path}`);
    await expect(page.getByRole("heading", { name: legalPage.heading, exact: true })).toBeVisible();
    await expect(page.getByText("Last updated 15 November 2026")).toBeVisible();
    await expect(page.getByRole("link", { name: "info@solassolas.com" }).first()).toHaveAttribute("href", "mailto:info@solassolas.com");
    await expect(page.getByText("PT PMA Lejit Connections Bali").first()).toBeVisible();
    await expect(page.getByText("To be confirmed: legal entity name.")).toHaveCount(0);
    await expect(page.getByText("To be confirmed: registered address.").first()).toBeVisible();
    await expect(page.getByText("Draft placeholder")).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("footer links connect privacy and website terms", async ({ page }) => {
  await page.goto("/privacy");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
  await expect(footer.getByRole("link", { name: "Website terms", exact: true })).toHaveAttribute("href", "/terms");

  await footer.getByRole("link", { name: "Website terms", exact: true }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole("heading", { name: "Website terms of use", exact: true })).toBeVisible();
  await expect(page.getByText("non-refundable", { exact: false }).first()).toBeVisible();
});
