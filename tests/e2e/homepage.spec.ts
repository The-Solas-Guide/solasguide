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
      "Recognition is earned. Not purchased.",
      "Meet the Founding Practitioners",
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

  test("shows the empty dynamic practitioner preview in local state", async ({ page }) => {
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry).toBeVisible();
    await expect(
      registry.getByText(
        "The inaugural edition of The Solas Guide brings together practitioners recognised for the quality of their work, depth of practice and professional standing.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      registry.getByText(
        "Browse the Guide or explore individual editorial profiles to understand who may be the right fit.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(registry.locator("article")).toHaveCount(0);
    await expect(
      registry
        .getByText("Profiles will appear here as they are published.", { exact: true })
        .or(registry.getByRole("status")),
    ).toBeVisible();
    await expect(registry.getByText("Build Your Retreat", { exact: true })).toHaveCount(0);
  });

  test("keeps the empty practitioner preview usable at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry.locator("article")).toHaveCount(0);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasOverflow).toBe(false);
  });

  test("keeps the dynamic preview available at tablet width", async ({ page }) => {
    await page.setViewportSize({ width: 1104, height: 1157 });
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry.locator("article")).toHaveCount(0);
    await expect(
      registry
        .getByText("Profiles will appear here as they are published.", { exact: true })
        .or(registry.getByRole("status")),
    ).toBeVisible();
  });
});
