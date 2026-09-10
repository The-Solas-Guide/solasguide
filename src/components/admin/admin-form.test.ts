// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminFormField, AdminFormLayout, AdminFormSection } from "@/components/admin/admin-form";

describe("AdminFormLayout", () => {
  afterEach(cleanup);
  it("separates editable sections from protected fields and keeps an explicit save", () => {
    render(
      createElement(
        AdminFormLayout,
        {
          title: "Edit Maya Hart",
          status: "Published",
          statusKind: "published",
          protectedFields: [
            { label: "Record ID", value: "rec_123" },
            { label: "Created", value: "04 Sep 2026" },
          ],
        },
        createElement(
          AdminFormSection,
          { title: "Public profile" },
          createElement("input", { name: "summary", defaultValue: "A guide" }),
        ),
      ),
    );

    expect(screen.getByRole("heading", { name: "Edit Maya Hart" })).toBeTruthy();
    expect(screen.getByText("Public profile")).toBeTruthy();
    expect(screen.getByText("Record ID")).toBeTruthy();
    expect(screen.getByDisplayValue("rec_123")).toHaveProperty("readOnly", true);
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByText("Saving changes to a published record updates the public site.")).toBeTruthy();
  });

  it("shows pending, saved, validation, and overall server errors", () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      createElement(AdminFormLayout, {
        title: "New record",
        onSubmit,
        pending: true,
        validationErrors: { name: "Name is required" },
        error: "The record could not be saved.",
      }),
    );

    expect(screen.getByRole("button", { name: /saving/i })).toHaveProperty("disabled", true);
    expect(screen.getByText("Name is required")).toBeTruthy();
    expect(screen.getAllByRole("alert").some((alert) => alert.textContent?.includes("The record could not be saved."))).toBe(true);
    rerender(createElement(AdminFormLayout, { title: "New record", saved: true }));
    expect(screen.getByText("Saved")).toBeTruthy();
  });

  it("warns before leaving a dirty editor and supports cancellation", () => {
    const onCancel = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(createElement(AdminFormLayout, { title: "Edit record", isDirty: true, onCancel }));

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    confirm.mockRestore();
  });

  it("guards dirty cancel actions and internal admin links", () => {
    const onCancel = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      createElement(
        AdminFormLayout,
        { title: "Edit record", isDirty: true, onCancel },
        createElement("a", { href: "/admin/practitioners" }, "Practitioners"),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("link", { name: "Practitioners" }));

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(onCancel).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("wires field errors beside their field with invalid and described-by state", () => {
    render(
      createElement(
        AdminFormLayout,
        { title: "New record", validationErrors: { summary: "Summary is required" } },
        createElement(
          AdminFormSection,
          { title: "Public profile" },
          createElement(
            AdminFormField,
            { name: "summary", label: "Summary" },
            createElement("input", { name: "summary" }),
          ),
        ),
      ),
    );

    const field = screen.getByRole("textbox", { name: "Summary" });
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.getAttribute("aria-describedby")).toBe("summary-error");
    expect(field.parentElement?.parentElement?.textContent).toContain("Summary is required");
  });

  it("links the validation summary to fields and expands a collapsed group", async () => {
    const renderEditor = (validationErrors: Record<string, string>) =>
      createElement(
        AdminFormLayout,
        { title: "Edit practitioner", validationErrors },
        createElement(
          "details",
          { id: "location" },
          createElement("summary", null, "Location"),
          createElement("input", { type: "checkbox", name: "location-term" }),
        ),
        createElement(
          AdminFormField,
          { name: "portrait", label: "Portrait file" },
          createElement("input", { type: "file" }),
        ),
      );

    const { rerender } = render(
      renderEditor({
        location: "Select an active location",
        image: "Upload an approved portrait",
      }),
    );

    const locationDetails = screen.getByText("Location").closest("details");
    const locationSummary = screen.getByText("Location");
    const portrait = screen.getByLabelText("Portrait file");

    expect(screen.getByRole("region", { name: "Review these fields before saving" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Location: Select an active location/ }).getAttribute("href")).toBe("#location");
    expect(screen.getByRole("link", { name: /Portrait: Upload an approved portrait/ }).getAttribute("href")).toBe("#portrait");
    await waitFor(() => {
      expect(locationDetails).toHaveProperty("open", true);
      expect(document.activeElement).toBe(locationSummary);
    });

    fireEvent.click(screen.getByRole("link", { name: /Portrait: Upload an approved portrait/ }));
    expect(document.activeElement).toBe(portrait);
    expect(portrait.classList.contains("scroll-mt-24")).toBe(true);

    if (locationDetails instanceof HTMLDetailsElement) locationDetails.open = false;
    rerender(renderEditor({}));
    rerender(renderEditor({ location: "Select an active location" }));
    await waitFor(() => {
      expect(locationDetails).toHaveProperty("open", true);
      expect(document.activeElement).toBe(locationSummary);
    });
  });

  it("ignores empty validation entries", () => {
    render(
      createElement(
        AdminFormLayout,
        { title: "Edit practitioner", validationErrors: { image: "" } },
        createElement(
          AdminFormField,
          { name: "portrait", label: "Portrait file" },
          createElement("input", { type: "file" }),
        ),
      ),
    );

    expect(screen.queryByRole("region", { name: "Review these fields before saving" })).toBeNull();
    expect(screen.getByLabelText("Portrait file").getAttribute("aria-invalid")).toBeNull();
  });

  it("keeps legacy questionnaire errors attached to submitted context", () => {
    render(
      createElement(
        AdminFormLayout,
        {
          title: "New record",
          validationErrors: { questionnaire_answers: "Add submitted context." },
        },
        createElement(
          AdminFormField,
          { name: "submission_context", label: "Submitted context" },
          createElement("textarea"),
        ),
      ),
    );

    const field = screen.getByRole("textbox", { name: "Submitted context" });
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(
      screen
        .getByRole("link", {
          name: /Submitted context: Add submitted context/,
        })
        .getAttribute("href"),
    ).toBe("#submission_context");
  });

  it("supports state-specific saved labels without changing generic defaults", () => {
    const { rerender } = render(
      createElement(AdminFormLayout, {
        title: "New practitioner",
        saved: true,
        successMessage: "Draft saved",
        savedLabel: "Draft saved",
      }),
    );

    expect(screen.getAllByText("Draft saved").length).toBe(2);
    rerender(createElement(AdminFormLayout, { title: "New record", saved: true }));
    expect(screen.getByRole("button", { name: "Saved" })).toBeTruthy();
  });
});
