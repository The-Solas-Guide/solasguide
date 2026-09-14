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
        "Every practitioner is independently reviewed before being recognised by The Solas Guide.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      recognition.getByText(
        "We verify the claims we can: credentials, professional history, and contribution to practice. Editorial judgement decides whether someone should be recognised.",
        { exact: true },
      ),
    ).toBeVisible();
    const processStatement = recognition.locator("p").filter({
      hasText: "Recognition is not purchased.",
    });
    await expect(processStatement).toContainText("Recognition is not purchased.");
    await expect(processStatement).toContainText("It is earned through a transparent review process.");

    const standards = [
      [
        "Independent Review",
        "We independently review the information that can be verified, then assess each application against our recognition framework.",
      ],
      [
        "Editorial Profile",
        "Every profile is written and maintained by Solas so the portrait stays independent, consistent, and clear.",
      ],
      [
        "Thoughtful Introductions",
        "When you ask, we review your context and introduce the practitioner we believe is the strongest fit.",
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
