import { expect, test } from "@playwright/test";

test("public controls retain their explicit border and font styles", async ({ page }) => {
  await page.goto("/design-system");
  const primary = page.getByRole("button", { name: "Start an enquiry", exact: true });
  const ghost = page.getByRole("button", { name: "Back", exact: true });

  await expect(ghost).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await expect(primary).toHaveCSS("font-size", "12px");
  await expect(primary).toHaveCSS("font-weight", "600");
  await expect(primary).toHaveCSS("text-transform", "uppercase");
  await primary.focus();
  await expect(primary).toHaveCSS("outline-style", "solid");
  await expect(primary).toHaveCSS("outline-width", "2px");
});

test("admin control styles also reach elements mounted outside the page wrapper", async ({ page }) => {
  await page.goto("/admin/sign-in");
  const button = page.getByRole("main").getByRole("button", { name: "Send sign-in code", exact: true });
  await expect(button).toHaveCSS("font-weight", "600");
  await expect(button).toHaveCSS("text-transform", "none");

  // Radix portals mount beneath body, outside the admin page wrapper.
  await button.evaluate((element) => {
    const portalButton = element.cloneNode(true) as HTMLElement;
    portalButton.id = "portal-style-check";
    document.body.append(portalButton);
  });
  const portalButton = page.locator("#portal-style-check");
  await expect(portalButton).toHaveCSS("text-transform", "none");
  expect(["normal", "0px"]).toContain(
    await portalButton.evaluate((element) => getComputedStyle(element).letterSpacing),
  );
  await expect(portalButton).toHaveCSS("font-size", "13px");
  const email = page.getByLabel("Email", { exact: true });
  await email.focus();
  await expect(email).toHaveCSS("border-top-color", "rgb(82, 117, 99)");
  await button.focus();
  await expect(email).toHaveCSS("border-top-color", "rgb(211, 221, 214)");
});
