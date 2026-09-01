import { expect, test, type Page } from "@playwright/test";
import { installPractitionerImageFixture } from "./practitioner-fixtures";

function cards(page: Page) {
  return page.locator("main ul li article");
}

test.beforeEach(async ({ page }) => {
  await installPractitionerImageFixture(page);
});

test.describe("published practitioner directory", () => {
  test("renders published cards and loaded profile images", async ({ page }) => {
    await page.goto("/practitioners");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The founding practitioners of The Solas Guide.",
      }),
    ).toBeVisible();
    await expect(page.getByText("Showing 3 of 3 practitioners")).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(cards(page).getByRole("heading", { level: 2, name: "Kartika Alexandra" })).toBeVisible();
    await expect(cards(page).getByRole("heading", { level: 2, name: "Sandra Echemendia" })).toBeVisible();
    await expect(cards(page).getByRole("heading", { level: 2, name: "Indri Hapsari" })).toBeVisible();

    for (const image of await cards(page).locator("img").all()) {
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test("searches profile fields and every linked taxonomy term", async ({ page }) => {
    await page.goto("/practitioners");
    const search = page.getByLabel("Search the Guide");

    await search.fill("HHHypnosis");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Kartika Alexandra" })).toBeVisible();

    await search.fill("breathwork");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Indri Hapsari" })).toBeVisible();

    await search.fill("strategy");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Sandra Echemendia" })).toBeVisible();
  });

  test("synchronises search in the URL and restores it after refresh", async ({ page }) => {
    await page.goto("/practitioners");
    const search = page.getByLabel("Search the Guide");

    await search.fill("breathwork");
    await expect(page).toHaveURL(/\/practitioners\?search=breathwork$/);
    await expect(cards(page)).toHaveCount(1);
    await page.reload();

    await expect(page.getByLabel("Search the Guide")).toHaveValue("breathwork");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Indri Hapsari" })).toBeVisible();
  });

  test("filters by linked areas, approaches, audiences, locations, format, and languages", async ({ page }) => {
    await page.goto("/practitioners");
    const cases = [
      ["Areas of support", "Trauma & nervous system", "Kartika Alexandra"],
      ["Approach", "Coaching", "Sandra Echemendia"],
      ["Works with", "Groups", "Indri Hapsari"],
      ["Location", "International", "Sandra Echemendia"],
      ["In-person or online", "Online", ""],
      ["Languages", "English", ""],
    ] as const;

    for (const [label, optionLabel, expectedName] of cases) {
      await page.getByRole("button", { name: /Filters/ }).click();
      const dialog = page.getByRole("dialog", { name: "Filters" });
      await dialog
        .getByLabel(label, { exact: true })
        .selectOption({ label: optionLabel });
      await dialog.getByRole("button", { name: /Show .* results/ }).click();

      await expect(cards(page)).toHaveCount(expectedName ? 1 : 3);
      if (expectedName) {
        await expect(cards(page).getByRole("heading", { name: expectedName })).toBeVisible();
      }
      await page.getByRole("button", { name: "Clear all" }).click();
      await expect(cards(page)).toHaveCount(3);
    }
  });

  test("writes stable repeated slug parameters for combined filters", async ({ page }) => {
    await page.goto("/practitioners");
    await page.getByRole("button", { name: /Filters/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });

    await dialog.getByLabel("Areas of support", { exact: true }).selectOption({
      label: "Leadership & work",
    });
    await dialog.getByLabel("Location", { exact: true }).selectOption({
      label: "International",
    });
    await dialog.getByRole("button", { name: /Show .* results/ }).click();

    await expect(page).toHaveURL(
      /\/practitioners\?areas=leadership-and-work&locations=international$/,
    );
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).getByRole("heading", { name: "Sandra Echemendia" })).toBeVisible();
  });

  test("restores directory results and controls through back and forward navigation", async ({ page }) => {
    await page.goto("/practitioners");
    const search = page.getByLabel("Search the Guide");
    await search.fill("kartika");
    await expect(page).toHaveURL(/\/practitioners\?search=kartika$/);

    await page.getByRole("button", { name: /Filters/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await dialog.getByLabel("Areas of support", { exact: true }).selectOption({
      label: "Trauma & nervous system",
    });
    await dialog.getByRole("button", { name: /Show .* results/ }).click();
    await expect(page).toHaveURL(
      /\/practitioners\?search=kartika&areas=trauma-and-nervous-system$/,
    );
    await expect(cards(page)).toHaveCount(1);
    await expect(search).toHaveValue("kartika");
    await expect(
      page.getByRole("button", {
        name: "Remove Areas of support filter Trauma & nervous system",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Filters/ })).toContainText("1");
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3100/practitioners");
    await expect(cards(page)).toHaveCount(3);
    await expect(search).toHaveValue("");
    await expect(page.getByRole("button", { name: /Filters/ })).not.toContainText("1");
    await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(
      /\/practitioners\?search=kartika&areas=trauma-and-nervous-system$/,
    );
    await expect(cards(page)).toHaveCount(1);
    await expect(search).toHaveValue("kartika");
    await expect(
      page.getByRole("button", {
        name: "Remove Areas of support filter Trauma & nervous system",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Filters/ })).toContainText("1");
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(
      page
        .getByRole("dialog", { name: "Filters" })
        .getByLabel("Areas of support", { exact: true })
        .locator("option:checked"),
    ).toHaveText("Trauma & nervous system");
    await page.keyboard.press("Escape");

    await page.goForward();
    await expect(page).toHaveURL("http://127.0.0.1:3100/practitioners");
    await expect(cards(page)).toHaveCount(3);
    await expect(search).toHaveValue("");
    await expect(page.getByRole("button", { name: /Filters/ })).not.toContainText("1");
    await expect(
      page.getByRole("button", {
        name: "Remove Areas of support filter Trauma & nervous system",
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(0);
    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(
      page
        .getByRole("dialog", { name: "Filters" })
        .getByLabel("Areas of support", { exact: true }),
    ).toHaveValue("");
  });

  test("explains unknown filter values without echoing them", async ({ page }) => {
    const unknown = "secret-filter-value";
    await page.goto(`/practitioners?areas=${unknown}`);

    await expect(
      page.getByText(
        "Some filters in this link are no longer available. The Guide is showing results using the remaining filters.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator("main")).not.toContainText(unknown);
  });

  test("clear all removes only directory parameters", async ({ page }) => {
    await page.goto("/practitioners?ref=campaign&areas=leadership-and-work&search=sandra");
    await expect(cards(page)).toHaveCount(1);
    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(page).toHaveURL("http://127.0.0.1:3100/practitioners?ref=campaign");
    await expect(cards(page)).toHaveCount(3);
  });

  test("supports keyboard close and trigger focus restoration for filters", async ({ page }) => {
    await page.goto("/practitioners");
    const trigger = page.getByRole("button", { name: /Filters/ });
    await trigger.focus();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("renders optional profile fields only when supplied", async ({ page }) => {
    await page.goto("/practitioners/indri-hapsari");

    await expect(page.getByRole("heading", { level: 1, name: "Indri Hapsari" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Credentials and significant training" })).toBeVisible();
    await expect(page.getByText("Significant training", { exact: true })).toBeVisible();
    await expect(page.getByText("Credentials", { exact: true })).toHaveCount(0);
    const profile = page.locator("main article");
    await expect(profile.getByRole("link", { name: "Website" })).toHaveCount(0);
    await expect(profile.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/indrihapsari___/",
    );
  });

  test("renders the dynamic profile route, external links, and focal image position", async ({ page }) => {
    await page.goto("/practitioners/kartika-alexandra");

    await expect(page).toHaveTitle(/Kartika Alexandra \| The Solas Guide/);
    await expect(page.getByRole("heading", { level: 1, name: "Kartika Alexandra" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(page.getByText("Credentials", { exact: true })).toBeVisible();
    const profile = page.locator("main article");
    await expect(profile.getByRole("link", { name: "Website" })).toHaveAttribute(
      "href",
      "https://www.kartikaalexandra.com/",
    );
    await expect(profile.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/kartikaalexandra/",
    );

    const image = page.locator("main article img");
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveCSS("object-position", "35% 65%");
  });
});

test.describe("practitioner taxonomy discovery pages", () => {
  test("renders a support-area page with matching practitioners and a directory return link", async ({ page }) => {
    await page.goto("/practitioners/areas/trauma-and-nervous-system");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Trauma & nervous system",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Explore practitioners whose published profiles include this area of support.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(1);
    await expect(
      cards(page).getByRole("heading", { name: "Kartika Alexandra" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to the guide/i }),
    ).toHaveAttribute("href", "/practitioners");
  });

  test("renders a location page with matching practitioners", async ({ page }) => {
    await page.goto("/practitioners/locations/international");

    await expect(
      page.getByRole("heading", { level: 1, name: "International" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Explore practitioners whose published profiles include this location.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(1);
    await expect(
      cards(page).getByRole("heading", { name: "Sandra Echemendia" }),
    ).toBeVisible();
  });

  test("links profile support areas and locations to discovery pages", async ({ page }) => {
    await page.goto("/practitioners/kartika-alexandra");

    await expect(
      page.getByRole("link", { name: "Trauma & nervous system" }),
    ).toHaveAttribute(
      "href",
      "/practitioners/areas/trauma-and-nervous-system",
    );
    await expect(page.getByRole("link", { name: "Bali" })).toHaveAttribute(
      "href",
      "/practitioners/locations/bali",
    );
  });

  test("links active directory taxonomy summaries to discovery pages", async ({ page }) => {
    await page.goto(
      "/practitioners?areas=trauma-and-nervous-system&locations=bali",
    );

    await expect(
      page.getByRole("link", { name: "Explore Trauma & nervous system" }),
    ).toHaveAttribute(
      "href",
      "/practitioners/areas/trauma-and-nervous-system",
    );
    await expect(
      page.getByRole("link", { name: "Explore Bali" }),
    ).toHaveAttribute("href", "/practitioners/locations/bali");
  });

  test("returns not found for missing and inactive taxonomy slugs", async ({ page }) => {
    const missingArea = await page.goto(
      "/practitioners/areas/not-a-real-area",
    );
    expect(missingArea?.status()).toBe(404);

    const inactiveLocation = await page.goto(
      "/practitioners/locations/inactive-location",
    );
    expect(inactiveLocation?.status()).toBe(404);
  });

  test("renders an empty state for an active area without published practitioners", async ({ page }) => {
    await page.goto("/practitioners/areas/unlinked-area");

    await expect(
      page.getByRole("heading", { level: 1, name: "Unlinked area" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Explore practitioners whose published profiles include this area of support.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: "No practitioners are listed under this area yet.",
      }),
    ).toBeVisible();
  });

  test("publishes canonical social and robots metadata for the directory", async ({ page }) => {
    await page.goto("/practitioners?areas=trauma-and-nervous-system");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/practitioners",
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "http://localhost:3000/practitioners",
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index, follow/,
    );
  });

  test("publishes profile JSON-LD with only public profile facts", async ({ page }) => {
    await page.goto("/practitioners/kartika-alexandra");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/practitioners/kartika-alexandra",
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "profile",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index, follow/,
    );

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).not.toBeNull();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed).toMatchObject({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: "Kartika Alexandra",
      },
    });
    expect(jsonLd).not.toMatch(
      /aggregateRating|medicalCondition|review|booking|telephone|email|availability/i,
    );
  });

  test("publishes discovery metadata and only linked terms in the sitemap", async ({ page }) => {
    await page.goto("/practitioners/areas/trauma-and-nervous-system");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/practitioners/areas/trauma-and-nervous-system",
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "http://localhost:3000/practitioners/areas/trauma-and-nervous-system",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index, follow/,
    );

    const sitemapResponse = await page.request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBe(true);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).toContain("http://localhost:3000/practitioners");
    expect(sitemap).toContain(
      "http://localhost:3000/practitioners/kartika-alexandra",
    );
    expect(sitemap).toContain(
      "http://localhost:3000/practitioners/areas/trauma-and-nervous-system",
    );
    expect(sitemap).toContain(
      "http://localhost:3000/practitioners/locations/bali",
    );
    expect(sitemap).not.toContain("unlinked-area");
    expect(sitemap).not.toContain("inactive-location");

    await page.goto("/practitioners/locations/bali");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/practitioners/locations/bali",
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "http://localhost:3000/practitioners/locations/bali",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index, follow/,
    );
  });

  test("keeps missing profile and discovery routes unavailable", async ({ page }) => {
    const missingProfile = await page.goto("/practitioners/not-a-real-profile");
    expect(missingProfile?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, nofollow/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    const missingArea = await page.goto("/practitioners/areas/not-a-real-area");
    expect(missingArea?.status()).toBe(404);
    const missingLocation = await page.goto(
      "/practitioners/locations/not-a-real-location",
    );
    expect(missingLocation?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, nofollow/,
    );
  });
});

test.describe("published practitioner directory at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stacks cards, keeps the profile usable, and contains the filter dialog", async ({ page }) => {
    await page.goto("/practitioners");
    await expect(cards(page)).toHaveCount(3);

    const firstCard = await cards(page).nth(0).boundingBox();
    const secondCard = await cards(page).nth(1).boundingBox();
    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(secondCard!.y).toBeGreaterThan(firstCard!.y + 20);

    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);

    await page.goto("/practitioners/indri-hapsari");
    await expect(page.getByRole("heading", { level: 1, name: "Indri Hapsari" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });

  test("keeps discovery pages usable without horizontal overflow", async ({ page }) => {
    await page.goto("/practitioners/areas/trauma-and-nervous-system");
    await expect(
      page.getByRole("heading", { level: 1, name: "Trauma & nervous system" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);

    await page.goto("/practitioners/locations/international");
    await expect(
      page.getByRole("heading", { level: 1, name: "International" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).resolves.toBe(false);
  });
});
