import { expect, test } from "@playwright/test";

test.describe("homepage recognition content", () => {
  test("shows the approved recognition process without verification content", async ({ page }) => {
    await page.goto("/");

    const recognition = page.locator("#recognition");

    await expect(
      recognition.getByRole("heading", {
        level: 2,
        name: "Recognition is earned. Not purchased.",
      }),
    ).toBeVisible();
    await expect(
      recognition.getByText(
        "Every practitioner is reviewed before being recognised by The Solas Guide.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      recognition.getByText(
        "We look at professional standing, experience, training and contribution to practice, and verify the claims we publish where they can be independently corroborated.",
        { exact: true },
      ),
    ).toBeVisible();
    const processStatement = recognition.locator("p").filter({
      hasText: "Recognition cannot be purchased.",
    });
    await expect(processStatement).toContainText("Recognition cannot be purchased.");
    await expect(processStatement).toContainText("It is the result of our review and editorial judgement.");

    const standards = [
      [
        "Independent Review",
        "We review professional history, training and the information that can be independently verified.",
      ],
      [
        "Editorial Profile",
        "Every profile is written and maintained by Solas to give readers a clear and consistent picture of the practitioner and their work.",
      ],
      [
        "Thoughtful Introductions",
        "If you would like help choosing, tell us what you are looking for and we’ll suggest who we think may be worth speaking to.",
      ],
    ] as const;

    for (const [title, description] of standards) {
      await expect(recognition.getByRole("heading", { level: 3, name: title })).toBeVisible();
      await expect(recognition.getByText(description, { exact: true })).toBeVisible();
    }

    await expect(page.locator("footer").getByRole("link", { name: "How Recognition Works" })).toHaveAttribute(
      "href",
      "/#recognition",
    );
    await expect(page.locator('a[href="/verify"]')).toHaveCount(0);
    const statisticCards = page.locator("#why-solas > div:last-child > div");
    for (const [value, label] of [
      ["20+", "Founding Practitioners"],
      ["8", "Practice Disciplines"],
      ["100%", "Independently Reviewed"],
    ] as const) {
      const statistic = statisticCards.filter({ hasText: value }).filter({ hasText: label });
      await expect(statistic).toHaveCount(1);
      await expect(statistic.getByText(value, { exact: true })).toBeVisible();
      await expect(statistic.getByText(label, { exact: true })).toBeVisible();
    }
  });
});
