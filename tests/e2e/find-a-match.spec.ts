import { expect, test } from "@playwright/test";

test("submits a complete business enquiry", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;

  await page.route("**/api/enquiries/customer", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, duplicate: false, deliveryPending: true }),
    });
  });

  await page.goto("/find-a-match");

  await page.getByRole("button", { name: /Support my physical wellbeing/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: /A practitioner/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: /A venue or place/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: "I am still planning" }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: "Ubud" }).click();
  await page.getByLabel("Specific place or area (optional)").fill("Near central Ubud");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: "A business or organisation" }).click();
  await page.getByLabel("Approximate group size").fill("12");
  await page.getByLabel("Business or organisation").fill("Solas Test Company");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: "Breathwork" }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByRole("button", { name: /I have a considered budget/ }).click();
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Additional context (optional)").fill("We are planning a restorative leadership retreat.");
  await page.getByRole("button", { name: /^Continue/ }).click();

  await page.getByLabel("Your name").fill("Alex Morgan");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("button", { name: "WhatsApp" }).click();
  await page.getByRole("button", { name: /Review your enquiry/ }).click();
  await expect(page.getByText("Add a phone number for phone or WhatsApp follow-up.")).toBeVisible();
  await page.getByLabel("Phone or WhatsApp number").fill("+1 416 555 0100");
  await page.getByRole("button", { name: /Review your enquiry/ }).click();

  await expect(page.getByText("Solas Test Company")).toBeVisible();
  await expect(page.getByText("WhatsApp — alex@example.com — +1 416 555 0100")).toBeVisible();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  await page.getByRole("button", { name: /Send enquiry/ }).click();

  await expect(page.getByRole("heading", { name: "Thank you. We will take it from here." })).toBeVisible();
  expect(submittedBody).toMatchObject({
    fullName: "Alex Morgan",
    email: "alex@example.com",
    phone: "+1 416 555 0100",
    contactPreference: "whatsapp",
    consentConfirmed: true,
    answers: {
      outcomes: ["physical-wellbeing"],
      primaryNeed: "practitioner",
      extras: ["venue"],
      timing: "planning",
      location: "ubud",
      locationDetail: "Near central Ubud",
      group: "business",
      groupSize: "12",
      organizationName: "Solas Test Company",
      modalities: ["breathwork"],
      budget: "considered",
      notes: "We are planning a restorative leadership retreat.",
    },
  });
});
