import { expect, test } from "@playwright/test";
import { installPractitionerImageFixture } from "./practitioner-fixtures";

test.beforeEach(async ({ page }) => {
  await installPractitionerImageFixture(page);
});

test.describe("homepage", () => {
  test("includes canonical and complete social metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^http:\/\/localhost:3000\/?$/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /^http:\/\/localhost:3000\/?$/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", "The Solas Guide is a trusted guide to exceptional wellness practitioners across Southeast Asia.");
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", "The Solas Guide is a trusted guide to exceptional wellness practitioners across Southeast Asia.");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /solas-facebook\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await page.goto("/practitioners");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/practitioners");
  });

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
    await expect(page.getByRole("link", { name: "Need Help Choosing?" }).first()).toHaveAttribute(
      "href",
      "/find-a-match",
    );
    await expect(page.getByRole("link", { name: "Make an Enquiry" }).first()).toHaveAttribute(
      "href",
      "/find-a-match?intent=professional",
    );
    await expect(page.getByText("Volume One").first()).toBeVisible();
    await expect(page.getByText("Southeast Asia").first()).toBeVisible();
    await expect(
      page.getByText(
        "The Solas Guide is an independent editorial guide to exceptional wellness practitioners across Southeast Asia.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.locator("footer").getByText(
        "Volume One features practitioners recognised across Southeast Asia.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "We recognise practitioners through a careful review process, verify the claims we publish, and introduce their work to people looking for someone they can trust.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Not sure who to speak to?" })).toBeVisible();
    await expect(page.getByText("Organisations", { exact: true })).toBeVisible();
    await expect(page.getByText("Corporate Teams")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Apply for Recognition" }).first()).toHaveAttribute(
      "href",
      "/become-a-practitioner",
    );
  });

  test("shows published practitioner cards in the dynamic preview", async ({ page }) => {
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry).toBeVisible();
    await expect(
      registry.getByText(
        "Volume One brings together practitioners recognised for the quality of their work, depth of practice and professional standing.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      registry.getByText(
        "Browse the Guide to explore their work, experience and approach.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(registry.locator("article")).toHaveCount(3);
    await expect(registry.getByRole("heading", { level: 3, name: "Kartika Alexandra" })).toBeVisible();
    await expect(registry.getByRole("heading", { level: 3, name: "Sandra Echemendia" })).toBeVisible();
    await expect(registry.getByRole("heading", { level: 3, name: "Indri Hapsari" })).toBeVisible();
    await expect(registry.locator("article").nth(0)).toContainText("Kartika Alexandra");
    await expect(registry.locator("article").nth(1)).toContainText("Indri Hapsari");
    await expect(registry.locator("article").nth(2)).toContainText("Sandra Echemendia");
    await expect(registry.locator("img")).toHaveCount(3);
    await expect(registry.getByRole("link", { name: /Kartika Alexandra/ })).toHaveAttribute(
      "href",
      "/practitioners/kartika-alexandra",
    );
    await expect(registry.getByRole("link", { name: "View All Practitioners" })).toHaveAttribute(
      "href",
      "/practitioners",
    );
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "The Guide" })).toHaveAttribute(
      "href",
      "/practitioners",
    );
    await expect(page.locator("footer").getByRole("link", { name: "Browse the Guide" })).toHaveAttribute(
      "href",
      "/practitioners",
    );
    await expect(registry.getByText("Build Your Retreat", { exact: true })).toHaveCount(0);
  });

  test("keeps the published practitioner preview usable at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry.locator("article")).toHaveCount(3);
    await expect(registry.getByRole("heading", { name: "Kartika Alexandra" })).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    expect(hasOverflow).toBe(false);
  });

  test("keeps the dynamic preview available at tablet width", async ({ page }) => {
    await page.setViewportSize({ width: 1104, height: 1157 });
    await page.goto("/");

    const registry = page.getByRole("region", { name: "Meet the Founding Practitioners" });
    await expect(registry.locator("article")).toHaveCount(3);
    await expect(registry.getByRole("heading", { name: "Kartika Alexandra" })).toBeVisible();
  });
});
