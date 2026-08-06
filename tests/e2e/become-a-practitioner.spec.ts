import { expect, test } from "@playwright/test";

test("submits and reviews a practitioner expression of interest", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  const analyticsEvents: unknown[][] = [];

  await page.exposeFunction("capturePractitionerEvent", (...args: unknown[]) => {
    analyticsEvents.push(args);
  });
  await page.addInitScript(() => {
    const analyticsWindow = window as typeof window & {
      capturePractitionerEvent: (...args: unknown[]) => void;
      gtag: (...args: unknown[]) => void;
    };
    analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.capturePractitionerEvent(...args);
  });

  await page.route("**/api/enquiries/practitioner", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, duplicate: false }),
    });
  });

  await page.goto("/become-a-practitioner");
  await page.getByRole("link", { name: "Express your interest" }).first().click();
  await expect(page).toHaveURL(/\/become-a-practitioner\/express-interest$/);

  await page.getByLabel("Professional role or practice").fill("Yoga teacher and facilitator");
  await page.getByLabel("Practice or business name (optional)").fill("Ubud Practice Studio");
  await page.getByRole("button", { name: "Based in Bali" }).click();
  await page.getByRole("button", { name: "Ubud" }).click();
  await page.getByLabel("Location detail (optional)").fill("Central Ubud");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: "Yoga" }).click();
  await page.getByRole("button", { name: "Other" }).click();
  await page.getByLabel("Other practice").fill("Somatic education");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Relevant experience").fill(
    "I have led individual and small-group yoga sessions in Bali for eight years, with additional training in somatic education.",
  );
  await page.getByLabel("Primary website or profile (optional)").fill("https://example.com/practice");
  await page.getByLabel("Additional link 1 (optional)").fill("https://instagram.com/example");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Full name").fill("Alex Morgan");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("button", { name: "WhatsApp" }).click();
  await page.getByRole("button", { name: /Review your expression of interest/ }).click();
  await expect(page.getByText("Add a phone number for phone or WhatsApp follow-up.")).toBeVisible();
  await page.getByLabel("Phone or WhatsApp number").fill("+62 812 555 0100");

  const persistedDraft = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null"),
  );
  expect(Object.keys(persistedDraft.draft).sort()).toEqual([
    "area",
    "baliRelationship",
    "practiceAreas",
    "submissionToken",
  ]);
  expect(JSON.stringify(persistedDraft)).not.toContain("alex@example.com");
  expect(JSON.stringify(persistedDraft)).not.toContain("eight years");

  await page.getByRole("button", { name: /Review your expression of interest/ }).click();

  await expect(page.getByText("Ubud Practice Studio")).toBeVisible();
  await page.getByRole("button", { name: "Edit your practice" }).click();
  await page.getByLabel("Professional role or practice").fill("Yoga teacher and somatic facilitator");
  await page.getByRole("button", { name: /^Return to review/ }).click();
  await expect(page.getByText("Yoga teacher and somatic facilitator")).toBeVisible();

  await page.getByRole("button", { name: "Send expression of interest" }).click();
  await expect(page.getByText("Confirm that we may use these details to respond to your expression of interest.")).toBeVisible();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  await page.getByRole("button", { name: "Send expression of interest" }).click();

  await expect(page.getByRole("heading", { name: "Thank you. Your expression of interest has been received." })).toBeVisible();
  expect(submittedBody).toMatchObject({
    fullName: "Alex Morgan",
    email: "alex@example.com",
    phone: "+62 812 555 0100",
    contactPreference: "whatsapp",
    consentConfirmed: true,
    practiceName: "Ubud Practice Studio",
    websiteUrl: "https://example.com/practice",
    answers: {
      formVersion: 1,
      professionalRole: "Yoga teacher and somatic facilitator",
      baliRelationship: "based-in-bali",
      area: "ubud",
      locationDetail: "Central Ubud",
      practiceAreas: ["yoga", "other"],
      otherPractice: "Somatic education",
      experienceSummary:
        "I have led individual and small-group yoga sessions in Bali for eight years, with additional training in somatic education.",
      additionalLinks: ["https://instagram.com/example"],
    },
  });

  const eventNames = analyticsEvents.map((event) => event[1]);
  expect(eventNames).toEqual(expect.arrayContaining([
    "practitioner_interest_cta_clicked",
    "practitioner_interest_started",
    "practitioner_interest_step_completed",
    "practitioner_interest_reviewed",
    "practitioner_interest_submitted",
  ]));
  expect(JSON.stringify(analyticsEvents)).not.toContain("alex@example.com");
});

test("rejects an unreadable practitioner submission", async ({ request }) => {
  const response = await request.post("/api/enquiries/practitioner", {
    data: { answers: "not-an-object" },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "The expression of interest could not be read." });
});

test("recovers from a submission token conflict", async ({ page }) => {
  await page.route("**/api/enquiries/practitioner", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({ error: "This expression of interest could not be retried." }),
  }));
  await page.goto("/become-a-practitioner/express-interest");

  await page.getByLabel("Professional role or practice").fill("Yoga teacher");
  await page.getByRole("button", { name: "Based in Bali" }).click();
  await page.getByRole("button", { name: "Ubud" }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: "Yoga" }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByLabel("Relevant experience").fill(
    "I have supported regular yoga sessions in Bali for more than five years.",
  );
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByLabel("Full name").fill("Alex Morgan");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("button", { name: /Review your expression of interest/ }).click();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  const originalToken = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null").draft.submissionToken,
  );
  await page.getByRole("button", { name: "Send expression of interest" }).click();
  await page.getByRole("button", { name: "Start a new expression" }).click();

  await expect(page.getByRole("heading", { name: "Tell us about your work in Bali." })).toBeFocused();
  await expect(page.getByLabel("Professional role or practice")).toHaveValue("");
  const replacementToken = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null").draft.submissionToken,
  );
  expect(replacementToken).not.toBe(originalToken);
});

test("keeps the practitioner journey usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/become-a-practitioner");

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const cta = page.getByRole("link", { name: "Express your interest" }).first();
  expect((await cta.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await cta.click();

  await expect.poll(() => page.evaluate(() => localStorage.getItem("solas-practitioner-interest-draft-v1"))).not.toBeNull();
  const initialExpiry = await page.evaluate(() => JSON.parse(
    localStorage.getItem("solas-practitioner-interest-draft-v1") as string,
  ).expiresAt);
  await page.reload();
  const restoredExpiry = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null").expiresAt,
  );
  expect(restoredExpiry).toBe(initialExpiry);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: /^Continue/ }).click();
  const formAlert = page.getByRole("alert").filter({ hasText: "A little more detail is needed" });
  await expect(formAlert).toContainText("Add your professional role or practice.");
  expect(await formAlert.evaluate((element) => element.parentElement === document.activeElement)).toBe(true);
});
