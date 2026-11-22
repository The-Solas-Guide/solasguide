import { expect, test } from "@playwright/test";
import {
  SOLAS_LETTER_SIGNUP_FORM_URL,
  SOLAS_TABLE_BOOKING_FORM_URL,
  practiseWhatsAppHref,
} from "../../src/lib/membership-content";

test("explains practitioner membership", async ({ page }) => {
  await page.goto("/become-a-practitioner");
  await expect(page).toHaveURL(/\/membership$/);
  await expect(page).toHaveTitle("Practitioner membership · The Solas Guide, Bali");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A membership for experienced wellness practitioners in Bali. A verified editorial profile, consideration for introductions where there's a fit, help practising in Bali, and access to Solas Tables. Introductions aren't guaranteed. USD $350 a year.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/membership");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Practitioner membership · The Solas Guide, Bali",
  );
  await expect(page.getByText("Practitioner membership · Volume One, Bali")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Your practice, properly recognised in Bali." })).toBeVisible();
  await expect(page.getByText("59", { exact: true })).toBeVisible();
  await expect(page.getByText("practitioners have joined a Solas Table or signed up for our Bali briefing call")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Solas Learning" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "We can help you practise in Bali." })).toHaveCount(0);
  await expect(page.getByText("This week")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Business Sustainability Blueprint" })).toBeVisible();
  await expect(page.getByText("Monday 23 November 2026")).toBeVisible();
  await expect(page.getByText("A short note will follow the session.")).toBeVisible();
  await expect(page.getByText("We'll add a short write-up after the event.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Reserve your place" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Be put forward for work" })).toBeVisible();
  await expect(page.getByText("Introductions aren't guaranteed.").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Access to Solas Tables" })).toBeVisible();
  await expect(page.getByText("A seat at every Solas Table")).toHaveCount(0);
  await expect(page.getByText("Members join every Solas Table free.")).toHaveCount(0);
  await expect(page.getByText("Venue to be confirmed")).toBeVisible();
  await expect(page.getByText("22 seats")).toHaveCount(0);
  await expect(page.getByText("Thursday 10 December 2026").first()).toBeVisible();
  await expect(page.getByText("In support of Sari Hati School for Special Needs Children.").first()).toBeVisible();
  await expect(page.getByText("IDR 350k")).toHaveCount(0);
  await expect(page.getByText("Edition 01, September 2026, and Edition 02, October 2026, have already gone out to members and non-members.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Future editions." })).toBeVisible();
  await expect(page.getByText("Sign up to receive the next Letter.")).toBeVisible();
  await expect(page.getByText("no newsletter has been sent")).toHaveCount(0);
  await expect(page.getByText("I've had the same offers for communities, but it's never felt right. This one does.", { exact: true })).toBeVisible();
  await expect(page.getByText("Melanie Midegs, Founding Practitioner")).toHaveCount(1);
  await expect(page.getByText("After being in Bali for so many years")).toHaveCount(0);
  await expect(page.getByText("Face Reading Soirées")).toHaveCount(0);
  await expect(page.getByText("Made warm connections. I enjoy my talks with Jit.", { exact: true })).toBeVisible();
  await expect(page.getByText("Rajiv Arapurakal, Founding Practitioner")).toBeVisible();
  await expect(page.getByText("Beautiful connection with great people.", { exact: true })).toBeVisible();
  await expect(page.getByText("Dirk Hamelijnck, Founding Practitioner")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Why Solas" })).toHaveAttribute("href", "/#why-solas");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "How it works" })).toHaveCount(0);
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Working in Bali briefing", exact: true })).toHaveAttribute("href", "/working-in-bali");
  await expect(page.getByRole("link", { name: "Practising in Bali: visas, permits and what practitioners need to know about working in Bali" })).toHaveAttribute("href", "/working-in-bali");
  await expect(page.getByText("General information, not legal advice. Solas does not provide immigration, legal or permit services.")).toBeVisible();
  await expect(page.getByText("Want to practise or host in Bali? Talk to us.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Nikki Heyder" })).toBeVisible();
  await expect(page.getByText("Open briefing · The Solas Guide × Trident Treehouse")).toHaveCount(0);
  await expect(page.getByText("Trident Treehouse")).toHaveCount(0);

  const call = page.getByRole("link", { name: "Book a call with Jitesh" });
  const apply = page.getByRole("link", { name: "Apply now · USD $350 a year" });
  await expect(apply).toHaveCount(2);
  await expect(page.locator('a[href="https://cal.com/solasguide/solas-discovery-call"]')).toHaveCount(6);
  await expect(page.locator('a[href="https://cal.com/solassolas/30min-private-conversation"]')).toHaveCount(0);
  await expect(call).toHaveCount(4);
  for (const link of await call.all()) {
    await expect(link).toHaveAttribute("href", "https://cal.com/solasguide/solas-discovery-call");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(apply.first()).toHaveAttribute("href", "https://tally.so/r/XxQvJz");
  await expect(apply.first()).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "Get in touch on WhatsApp" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", practiseWhatsAppHref);
  await expect(page.locator('a[href="https://tally.so/r/bZqJ5o"]')).toHaveCount(0);
  const book = page.getByRole("link", { name: "Book your place" });
  await expect(book).toHaveCount(1);
  await expect(book).toHaveAttribute("href", SOLAS_TABLE_BOOKING_FORM_URL);
  await expect(book).toHaveAttribute("target", "_blank");
  await expect(book).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByText("The booking form is being set up.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Get the Letter" })).toHaveAttribute("href", SOLAS_LETTER_SIGNUP_FORM_URL);

  await page.getByRole("button", { name: /Past edition · Edition 02/ }).click();
  const letterBook = page.getByRole("link", { name: "Book your place" }).nth(1);
  await expect(letterBook).toHaveAttribute("href", SOLAS_TABLE_BOOKING_FORM_URL);
  await expect(letterBook).toHaveAttribute("target", "_blank");
  await expect(letterBook).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByText("Sent to members and non-members.").first()).toBeVisible();
  await expect(page.getByText("You can't be everything to everyone")).toBeVisible();

  await page.goto("/working-in-bali");
  await expect(page).toHaveTitle("Working in Bali · The Solas Guide");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "General information for practitioners considering clients, workshops, retreats or other work in Bali. Not immigration, legal or permit advice.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/working-in-bali");
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "I want to see my own clients" })).toBeVisible();
  await expect(page.getByText("There is no simple freelancer visa.")).toBeVisible();
  await expect(page.getByText("The Solas Guide does not provide immigration, legal, tax or permit advice").first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByText("Trident Treehouse")).toHaveCount(0);

  const html = await page.content();
  const text = await page.locator("body").innerText();
  expect(html.toLowerCase()).not.toContain("solas-table-guest-contacts");
  expect(html).not.toContain("Human Library");
  expect(html).not.toContain("27 Sep");
  expect(html).not.toContain("27 September");
  expect(html).not.toContain("wa.me/6285939817503");
  expect(html).not.toContain("Manu Ashwalayan");
  expect(text).not.toContain("USD 200");
  expect(text).not.toContain("$200");
  expect(text).not.toContain("Human Library");
  expect(text).not.toContain("no newsletter has been sent");

  await page.goto("/become-a-practitioner/express-interest");
  await expect(page).toHaveURL(/\/membership\/apply$/);
  await expect(page.getByText("Volume One: Bali, expanding across Southeast Asia")).toBeVisible();
});

test("submits and reviews a practitioner membership application", async ({ page }) => {
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

  await page.route("**/api/enquiries/practitioner", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, duplicate: false }),
    });
  });

  await page.goto("/membership/apply");

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
  await page.getByRole("button", { name: /Review your application/ }).click();
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

  await page.getByRole("button", { name: /Review your application/ }).click();

  await expect(page.getByText("Ubud Practice Studio")).toBeVisible();
  await page.getByRole("button", { name: "Edit your practice" }).click();
  await page.getByLabel("Professional role or practice").fill("Yoga teacher and somatic facilitator");
  await page.getByRole("button", { name: /^Return to review/ }).click();
  await expect(page.getByText("Yoga teacher and somatic facilitator")).toBeVisible();

  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.getByText("Confirm that we may use these details to review your membership application.")).toBeVisible();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  await page.getByRole("button", { name: "Send application" }).click();

  await expect(page.getByRole("heading", { name: "Thank you. Your membership application has been received." })).toBeVisible();
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

  const eventNames = analyticsEvents
    .filter(([eventType]) => eventType === "event")
    .map(([, event]) => (event as { name?: unknown }).name);
  expect(eventNames).toEqual(expect.arrayContaining([
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
  await expect(response.json()).resolves.toEqual({ error: "The membership application could not be read." });
});

test("recovers from a submission token conflict", async ({ page }) => {
  await page.route("**/api/enquiries/practitioner", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({ error: "This membership application could not be retried." }),
  }));
  await page.goto("/membership/apply");

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
  await page.getByRole("button", { name: /Review your application/ }).click();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  const originalToken = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null").draft.submissionToken,
  );
  await page.getByRole("button", { name: "Send application" }).click();
  await page.getByRole("button", { name: "Start a new application" }).click();

  await expect(page.getByRole("heading", { name: "Tell us about your work." })).toBeFocused();
  await expect(page.getByLabel("Professional role or practice")).toHaveValue("");
  const replacementToken = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("solas-practitioner-interest-draft-v1") || "null").draft.submissionToken,
  );
  expect(replacementToken).not.toBe(originalToken);
});

test("keeps the practitioner journey usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/membership");

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const cta = page.getByRole("link", { name: "Book a call with Jitesh" }).first();
  expect((await cta.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await page.goto("/membership/apply");

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
