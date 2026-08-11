import { expect, test } from "@playwright/test";

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
      "Why you can trust who we introduce.",
      "Facilitators recognised for the depth of their work.",
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

  test("does not overflow at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasOverflow).toBe(false);
  });
});
