import { expect, test } from "@playwright/test";

const legalPages = [
  { path: "/privacy", heading: "Privacy" },
  { path: "/terms", heading: "Website terms" },
] as const;

for (const legalPage of legalPages) {
  test(`${legalPage.heading} page is clearly marked as a draft`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(legalPage.path);

    await expect(page.getByRole("heading", { name: legalPage.heading, exact: true })).toBeVisible();
    await expect(page.getByText("Draft placeholder", { exact: true })).toBeVisible();
    await expect(page.getByText("Client-approved content pending.", { exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("footer links connect the two legal placeholders", async ({ page }) => {
  await page.goto("/privacy");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
  await expect(footer.getByRole("link", { name: "Website terms", exact: true })).toHaveAttribute("href", "/terms");

  await footer.getByRole("link", { name: "Website terms", exact: true }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole("heading", { name: "Website terms", exact: true })).toBeVisible();
});
