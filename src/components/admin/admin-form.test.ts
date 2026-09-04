// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
});
