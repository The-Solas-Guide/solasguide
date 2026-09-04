// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PractitionerEditor } from "./practitioner-editor";

const mocks = vi.hoisted(() => ({
  save: vi.fn<(form: FormData) => Promise<{ ok: boolean; error?: string }>>(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, replace: vi.fn() }) }));
vi.mock("@/lib/admin/practitioner-actions", () => ({
  savePractitioner: mocks.save,
  archivePractitioner: vi.fn(),
  deletePractitioner: vi.fn(),
  setPractitionerFeaturedPosition: vi.fn(),
}));

describe("portrait upload state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ ok: true });
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = vi.fn(() => "blob:portrait");
      static revokeObjectURL = vi.fn();
    });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  function selectPortrait() {
    const input = screen.getByLabelText("Portrait file") as HTMLInputElement;
    const file = new File(["portrait"], "portrait.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByLabelText("I confirm this portrait is approved for public use."));
    return { input, file };
  }

  it("uploads once and clears the selection after a successful save", async () => {
    const { container } = render(<PractitionerEditor record={null} terms={[]} />);
    const { input, file } = selectPortrait();
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
    expect(mocks.save.mock.calls[0][0].get("portrait")).toBe(file);
    expect(input.value).toBe("");
    expect(screen.queryByLabelText("I confirm this portrait is approved for public use.")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:portrait");

    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][0].has("portrait")).toBe(false);
    expect(mocks.save.mock.calls[1][0].has("imageApproved")).toBe(false);
  });

  it("retains the selected portrait when saving fails", async () => {
    mocks.save.mockResolvedValue({ ok: false, error: "Save failed." });
    const { container, unmount } = render(<PractitionerEditor record={null} terms={[]} />);
    const { file } = selectPortrait();
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(screen.getAllByText("Save failed.").length).toBeGreaterThan(0));
    expect((screen.getByLabelText("I confirm this portrait is approved for public use.") as HTMLInputElement).checked).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][0].get("portrait")).toBe(file);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:portrait");
  });
});
