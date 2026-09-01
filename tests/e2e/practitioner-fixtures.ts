import type { Page } from "@playwright/test";

const neutralPractitionerImage = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800">
  <rect width="640" height="800" fill="#d8d0c2"/>
  <path d="M0 580h640v220H0z" fill="#9b8f7a"/>
  <circle cx="320" cy="300" r="150" fill="#f0e9dc"/>
  <path d="M100 580c55-120 145-178 220-178s165 58 220 178" fill="#695f54"/>
</svg>
`.trim();

/** Fulfil the explicit test fixture's public storage image request. */
export async function installPractitionerImageFixture(page: Page) {
  await page.route(
    "https://example.supabase.test/storage/v1/object/public/profile-images/**",
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: neutralPractitionerImage,
      }),
  );
}
