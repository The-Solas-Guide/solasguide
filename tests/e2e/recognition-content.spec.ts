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
      recognition.getByText("Our review combines objective checks with editorial judgement.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      recognition.getByText(
        "Where appropriate we confirm credentials, review professional history, speak with references and assess contribution to practice before deciding whether someone should be recognised.",
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
        "We independently review the information that can be verified and assess each application against our published recognition framework.",
      ],
      [
        "Editorial Profile",
        "Every profile is written and maintained by Solas to ensure consistency, independence and clarity for buyers.",
      ],
      [
        "Thoughtful Introductions",
        "When you're ready, we'll introduce you to the practitioner we believe is the strongest fit for your needs.",
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
