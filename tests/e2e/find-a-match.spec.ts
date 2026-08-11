import { expect, test } from "@playwright/test";

test("submits a complete buyer questionnaire", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  const analyticsEvents: unknown[][] = [];

  await page.exposeFunction("captureAnalyticsEvent", (...args: unknown[]) => {
    analyticsEvents.push(args);
  });
  await page.addInitScript(() => {
    const analyticsWindow = window as typeof window & {
      captureAnalyticsEvent: (...args: unknown[]) => void;
      va: (...args: unknown[]) => void;
    };
    analyticsWindow.va = (...args: unknown[]) => analyticsWindow.captureAnalyticsEvent(...args);
  });
  await page.route("**/script.debug.js", (route) => route.abort());

  await page.route("**/api/enquiries/customer", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, duplicate: false, deliveryPending: true }),
    });
  });

  await page.goto("/find-a-match");
  await expect(page.getByRole("heading", { name: "What brings you to The Solas Guide today?" })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole("radio", { name: "Personal wellbeing" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("radio", { name: "My partner" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("checkbox", { name: "Burnout" }).check();
  await page.getByRole("checkbox", { name: "Stress" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("radio", { name: "Planning ahead" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Anything else").fill("Synthetic test enquiry.");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Name").fill("Alex Morgan");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByLabel("WhatsApp").fill("+1 416 555 0100");
  await expect(page.getByLabel("Name")).toHaveAttribute("required", "");
  await expect(page.getByLabel("Email")).toHaveAttribute("required", "");
  await expect(page.getByLabel("WhatsApp")).toHaveAttribute("required", "");
  await page.getByRole("button", { name: /Review your enquiry/ }).click();

  await expect(page.getByText("Synthetic test enquiry.")).toBeVisible();
  await expect(page.getByText("Alex Morgan — alex@example.com — WhatsApp: +1 416 555 0100")).toBeVisible();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByRole("heading", { name: "Thank you. We will take it from here." })).toBeFocused();
  expect(submittedBody).toMatchObject({
    fullName: "Alex Morgan",
    email: "alex@example.com",
    phone: "+1 416 555 0100",
    contactPreference: "whatsapp",
    consentConfirmed: true,
    answers: {
      formVersion: 3,
      q1: "personal-wellbeing",
      q2: "my-partner",
      q3: ["burnout", "stress"],
      q4: "planning-ahead",
      q5: "Synthetic test enquiry.",
    },
  });

  const eventNames = analyticsEvents
    .filter(([eventType]) => eventType === "event")
    .map(([, event]) => (event as { name?: unknown }).name);
  expect(eventNames).toEqual(expect.arrayContaining([
    "enquiry_started",
    "enquiry_step_completed",
    "enquiry_submitted",
  ]));
  expect(JSON.stringify(analyticsEvents)).not.toContain("alex@example.com");
  expect(JSON.stringify(analyticsEvents)).not.toContain("personal-wellbeing");
  expect(JSON.stringify(analyticsEvents)).not.toContain("Synthetic test enquiry.");
});

test("blocks an invalid WhatsApp number before review", async ({ page }) => {
  await page.goto("/find-a-match");

  await page.getByRole("radio", { name: "Personal wellbeing" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Just for me" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("checkbox", { name: "Stress" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Planning ahead" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Name").fill("Alex Morgan");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByLabel("WhatsApp").fill("not a phone number");
  await page.getByRole("button", { name: "Review your enquiry" }).click();

  await expect(page.getByText("Add a valid WhatsApp number.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How can we contact you?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send enquiry" })).toHaveCount(0);
});

test("recovers the questionnaire draft in this tab without contact details", async ({ browser, page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("solas-customer-enquiry-draft-v2", JSON.stringify({
      submissionToken: "legacy-token",
      needs: ["stress"],
      context: "Legacy private context",
    }));
  });
  await page.goto("/find-a-match");
  await page.getByRole("radio", { name: "Relationships" }).check();

  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("solas-customer-enquiry-draft-v3"))).not.toBeNull();
  const storedDraft = await page.evaluate(() => JSON.parse(sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null"));
  expect(Object.keys(storedDraft).sort()).toEqual(["q1", "q2", "q3", "q4", "q5", "submissionToken"]);
  expect(JSON.stringify(storedDraft)).not.toContain("alex@example.com");
  expect(JSON.stringify(storedDraft)).not.toContain("+1 416 555 0100");
  expect(await page.evaluate(() => localStorage.getItem("solas-customer-enquiry-draft-v3"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("solas-customer-enquiry-draft-v2"))).toBeNull();

  await page.reload();
  await expect(page.getByRole("radio", { name: "Relationships" })).toBeChecked();

  const otherTab = await page.context().newPage();
  await otherTab.goto(new URL("/find-a-match", await page.url()).toString());
  await expect(otherTab.getByRole("radio", { name: "Relationships" })).not.toBeChecked();
  const otherTabDraft = await otherTab.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ));
  expect(otherTabDraft.q1).toBe("");
  expect(otherTabDraft.submissionToken).not.toBe(storedDraft.submissionToken);
  await otherTab.close();

  const [openedTab] = await Promise.all([
    page.waitForEvent("popup"),
    page.evaluate(() => window.open("/find-a-match", "_blank")),
  ]);
  await openedTab.waitForLoadState();
  await expect(openedTab.getByRole("radio", { name: "Relationships" })).not.toBeChecked();
  const openedTabDraft = await openedTab.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ));
  expect(openedTabDraft.q1).toBe("");
  expect(openedTabDraft.submissionToken).not.toBe(storedDraft.submissionToken);
  await openedTab.close();

  const otherSession = await browser.newContext();
  const otherSessionPage = await otherSession.newPage();
  await otherSessionPage.goto(new URL("/find-a-match", await page.url()).toString());
  await expect(otherSessionPage.getByRole("radio", { name: "Relationships" })).not.toBeChecked();
  const otherSessionDraft = await otherSessionPage.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ));
  expect(otherSessionDraft.q1).toBe("");
  expect(otherSessionDraft.submissionToken).not.toBe(storedDraft.submissionToken);
  await otherSession.close();
});

test("keeps the enquiry until the customer starts a new enquiry after a changed retry", async ({ page }) => {
  await page.route("**/api/enquiries/customer", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({
      error: "This enquiry was already saved with different details. Please start a new enquiry.",
    }),
  }));
  await page.goto("/find-a-match");

  await page.getByRole("radio", { name: "Relationships" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Just for me" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("checkbox", { name: "Stress" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Planning ahead" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByLabel("Name").fill("Alex Morgan");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByLabel("WhatsApp").fill("+1 416 555 0100");
  await page.getByRole("button", { name: "Review your enquiry" }).click();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();

  const originalToken = await page.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ).submissionToken);
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "A little more detail is needed" })).toContainText("Please start a new enquiry.");
  await expect(page.getByRole("button", { name: "Start a new enquiry" })).toBeVisible();
  await expect(page.getByText("Alex Morgan — alex@example.com — WhatsApp: +1 416 555 0100")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ).submissionToken)).toBe(originalToken);

  await page.getByRole("button", { name: "Start a new enquiry" }).click();
  await expect(page.getByRole("heading", { name: "What brings you to The Solas Guide today?" })).toBeFocused();
  await expect(page.getByRole("radio", { name: "Relationships" })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Start a new enquiry" })).toHaveCount(0);

  const replacementDraft = await page.evaluate(() => JSON.parse(
    sessionStorage.getItem("solas-customer-enquiry-draft-v3") || "null",
  ));
  expect(replacementDraft.submissionToken).not.toBe(originalToken);
  expect(replacementDraft.q1).toBe("");
  expect(replacementDraft.q2).toBe("");
  expect(replacementDraft.q3).toEqual([]);
  expect(replacementDraft.q4).toBe("");
  expect(replacementDraft.q5).toBe("");
  expect(JSON.stringify(replacementDraft)).not.toContain("alex@example.com");

  await page.getByRole("radio", { name: "Personal wellbeing" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Just for me" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("checkbox", { name: "Stress" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("radio", { name: "Planning ahead" }).check();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await expect(page.getByLabel("Name")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByLabel("WhatsApp")).toHaveValue("");
  await page.getByLabel("Name").fill("New Alex");
  await page.getByLabel("Email").fill("new-alex@example.com");
  await page.getByLabel("WhatsApp").fill("+1 416 555 0101");
  await page.getByRole("button", { name: "Review your enquiry" }).click();
  await expect(page.getByRole("checkbox", { name: /may use these details/ })).not.toBeChecked();
});
