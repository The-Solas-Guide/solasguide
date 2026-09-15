import { expect, test, type Page } from "@playwright/test";

async function fillProgrammeEnquiry(page: Page) {
  await page.getByLabel("Your name", { exact: true }).fill("Programme Test");
  await page.getByLabel("Email address", { exact: true }).fill("programme@example.com");
  await page.getByLabel("Organisation", { exact: false }).fill("Synthetic Retreat");
  await page.getByLabel("What are you planning?", { exact: true }).selectOption("retreat");
  await page.getByLabel("When are you thinking?", { exact: true }).fill("October 2027");
  await page.getByLabel("What would you like your group to take away?", { exact: true }).fill("A shared experience for twelve people.");
}

for (const width of [1440, 390]) {
  test(`standalone programme enquiry validates and retries at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const submissions: Record<string, unknown>[] = [];
    await page.route("**/api/enquiries/programme", async (route) => {
      submissions.push(route.request().postDataJSON());
      await route.fulfill({
        status: submissions.length === 1 ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(submissions.length === 1
          ? { error: "We could not send your enquiry. Please try again." }
          : { ok: true, deliveryPending: true }),
      });
    });
    await page.goto("/programmes");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Begin your enquiry" })).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("link", { name: "Tell us about your plans", exact: true }).first().click();
    await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
    expect(await page.getByLabel("Your name", { exact: true }).evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
    expect(submissions).toHaveLength(0);
    await fillProgrammeEnquiry(page);
    await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
    expect(submissions).toHaveLength(0);
    await page.getByRole("checkbox", { name: /may contact me/ }).check();
    await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
    await expect(page.getByRole("form", { name: "Programme enquiry" }).getByRole("alert")).toContainText("Please try again.");
    await expect(page.getByLabel("Your name", { exact: true })).toHaveValue("Programme Test");
    await expect(page.getByLabel("What would you like your group to take away?", { exact: true })).toHaveValue("A shared experience for twelve people.");
    await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Thank you. Your enquiry is with us.");
    expect(submissions).toHaveLength(2);
    expect(submissions[1]).toEqual(submissions[0]);
    expect(submissions[1]).toMatchObject({
      fullName: "Programme Test", email: "programme@example.com", organisation: "Synthetic Retreat",
      experience: "retreat", dates: "October 2027", intention: "A shared experience for twelve people.", consentConfirmed: true,
    });
    expect(submissions[1]).not.toHaveProperty("answers");
    expect(submissions[1]).not.toHaveProperty("phone");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("a changed saved submission requires an explicit new enquiry", async ({ page }) => {
  const tokens: string[] = [];
  await page.route("**/api/enquiries/programme", async (route) => {
    tokens.push(route.request().postDataJSON().submissionToken);
    await route.fulfill({ status: tokens.length === 1 ? 409 : 200, contentType: "application/json", body: JSON.stringify(tokens.length === 1 ? { error: "This enquiry was already saved with different details. Please start a new enquiry." } : { ok: true }) });
  });
  await page.goto("/programmes");
  await fillProgrammeEnquiry(page);
  await page.getByRole("checkbox", { name: /may contact me/ }).check();
  await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start a conversation", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Start a new enquiry with these details" }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue("Programme Test");
  await page.getByRole("button", { name: "Start a conversation", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your enquiry is with us");
  expect(tokens[1]).not.toBe(tokens[0]);
});

test("programmes is discoverable and keeps its font scoped", async ({ page }) => {
  await page.goto("/");
  const homeFont = await page.getByRole("heading", { level: 1 }).evaluate((heading) => getComputedStyle(heading).fontFamily);
  await page.getByRole("navigation", { name: "Primary navigation", exact: true }).getByRole("link", { name: "Programmes", exact: true }).click();
  await expect(page).toHaveURL(/\/programmes$/);
  await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate((heading) => getComputedStyle(heading).fontFamily)).toContain("Fraunces");
  await page.locator("header").getByRole("link", { name: "The Solas Guide", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.getByRole("heading", { level: 1 }).evaluate((heading) => getComputedStyle(heading).fontFamily)).toBe(homeFont);
});
