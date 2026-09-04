// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OperationalLifecycleControls,
  PublicLifecycleControls,
  TaxonomyLifecycleControls,
} from "@/components/admin/lifecycle-controls";

describe("admin lifecycle controls", () => {
  afterEach(cleanup);
  it("shows publish and public-site warning only for public records", () => {
    const onChange = vi.fn();
    render(createElement(PublicLifecycleControls, { value: "draft", onChange }));

    expect(screen.getByRole("button", { name: "Publish" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(onChange).toHaveBeenCalledWith("published");
    expect(screen.getByText("Publishing makes this record visible on the public site.")).toBeTruthy();
  });

  it("keeps taxonomy lifecycle separate from publishing", () => {
    render(createElement(TaxonomyLifecycleControls, { value: "active", onChange: vi.fn() }));

    expect(screen.queryByRole("button", { name: /publish/i })).toBeNull();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mark inactive" })).toBeTruthy();
  });

  it("keeps operational submissions workflow-only and exposes archive separately", () => {
    render(createElement(OperationalLifecycleControls, { value: "new", onChange: vi.fn(), onArchive: vi.fn(), isSubmission: true }));

    expect(screen.queryByText(/publish/i)).toBeNull();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Workflow status" })).toBeTruthy();
  });
});
