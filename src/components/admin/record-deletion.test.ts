// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AdminArchiveDialog,
  AdminPermanentDeleteDialog,
  AdminRelationshipSummary,
} from "@/components/admin/record-deletion";

describe("admin archive and deletion patterns", () => {
  afterEach(cleanup);
  it("renders relationship summaries with named links and reasons", () => {
    render(
      createElement(AdminRelationshipSummary, {
        relationships: [
          { name: "Practitioner term links", href: "/admin/taxonomy/area", reason: "Remove links first." },
        ],
      }),
    );

    expect(screen.getByRole("link", { name: "Practitioner term links" }).getAttribute("href")).toBe("/admin/taxonomy/area");
    expect(screen.getByText("Remove links first.")).toBeTruthy();
  });

  it("keeps archive confirmation separate from permanent delete", () => {
    const onArchive = vi.fn();
    render(createElement(AdminArchiveDialog, { recordName: "Maya Hart", onArchive }));

    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(screen.getByRole("heading", { name: "Archive Maya Hart?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    expect(onArchive).toHaveBeenCalledOnce();
  });

  it("supports keyboard focus and restores focus to the archive trigger", async () => {
    render(createElement(AdminArchiveDialog, { recordName: "Maya Hart", onArchive: vi.fn() }));
    const trigger = screen.getByRole("button", { name: "Archive" });
    trigger.focus();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });
    expect(screen.getByRole("heading", { name: "Archive Maya Hart?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("blocks permanent deletion and lists every dependency", () => {
    render(
      createElement(AdminPermanentDeleteDialog, {
        recordName: "Area term",
        relationships: [
          { name: "Maya Hart", href: "/admin/practitioners/maya", reason: "Practitioner uses this term." },
          { name: "Rani Sari", href: "/admin/practitioners/rani", reason: "Practitioner uses this term." },
        ],
        onDelete: vi.fn(),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Permanent Delete" }));
    expect(screen.getByText("Permanent delete is blocked.")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Confirm permanent delete" })).toBeNull();
  });

  it("requires typed confirmation and does not offer normal permanent delete for submissions", () => {
    const onDelete = vi.fn();
    const { rerender } = render(
      createElement(AdminPermanentDeleteDialog, { recordName: "Maya Hart", onDelete }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Permanent Delete" }));
    expect(screen.getByRole("button", { name: "Confirm permanent delete" })).toHaveProperty("disabled", true);
    fireEvent.change(screen.getByRole("textbox", { name: "Type Maya Hart to confirm" }), { target: { value: "Maya Hart" } });
    expect(screen.getByRole("button", { name: "Confirm permanent delete" })).toHaveProperty("disabled", false);
    fireEvent.click(screen.getByRole("button", { name: "Confirm permanent delete" }));
    expect(onDelete).toHaveBeenCalledOnce();

    rerender(createElement(AdminPermanentDeleteDialog, { recordName: "Submission", isSubmission: true, onDelete }));
    expect(screen.queryByRole("button", { name: "Permanent Delete" })).toBeNull();
  });
});
