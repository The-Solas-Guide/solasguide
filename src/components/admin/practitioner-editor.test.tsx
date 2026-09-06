// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PractitionerEditor } from "./practitioner-editor";
import type { AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";

type TestPractitionerRecord = AdminPractitionerRecord & {
  portrait_approval_required?: boolean;
};

const mocks = vi.hoisted(() => ({
  save: vi.fn<
    (form: FormData) =>
      Promise<{
        ok: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      }>
  >(),
  publish: vi.fn<(id: string) => Promise<{ ok: boolean; error?: string }>>(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, replace: vi.fn() }) }));
vi.mock("@/lib/admin/practitioner-actions", () => ({
  savePractitioner: mocks.save,
  publishPractitioner: mocks.publish,
  archivePractitioner: vi.fn(),
  deletePractitioner: vi.fn(),
  setPractitionerFeaturedPosition: vi.fn(),
}));

describe("portrait upload state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ ok: true });
    mocks.publish.mockResolvedValue({ ok: true });
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

describe("practitioner draft workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({ ok: true });
    mocks.publish.mockResolvedValue({ ok: true });
  });

  afterEach(() => cleanup());

  const savedDraft = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Māia Hart",
    slug: "maia-hart",
    status: "draft",
    archived_at: null,
    summary: null,
    about: null,
    image_path: null,
    image_alt: null,
    image_focal_x: 50,
    image_focal_y: 50,
    featured_position: null,
    terms: [],
    created_at: "2026-09-06T00:00:00.000Z",
  } as unknown as TestPractitionerRecord;

  it("generates an accent-safe editable slug from a new name", () => {
    render(<PractitionerEditor record={null} terms={[]} isNew />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Áine O’Connor & Co" },
    });

    expect((screen.getByLabelText("Profile URL") as HTMLInputElement).value).toBe(
      "aine-oconnor-and-co",
    );
  });

  it("keeps a manually edited slug when the new name changes", () => {
    render(<PractitionerEditor record={null} terms={[]} isNew />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Māia Hart" },
    });
    fireEvent.change(screen.getByLabelText("Profile URL"), {
      target: { value: "custom-profile" },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Another Name" },
    });

    expect((screen.getByLabelText("Profile URL") as HTMLInputElement).value).toBe(
      "custom-profile",
    );
  });

  it("keeps the form values and shows a duplicate URL error inline", async () => {
    mocks.save.mockResolvedValue({
      ok: false,
      fieldErrors: {
        slug: "That profile URL is already in use. Choose another.",
      },
    });
    const { container } = render(
      <PractitionerEditor record={null} terms={[]} isNew />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Māia Hart" },
    });
    fireEvent.change(screen.getByLabelText("Profile URL"), {
      target: { value: "already-used" },
    });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() =>
      expect(
        screen.getAllByText("That profile URL is already in use. Choose another.").length,
      ).toBeGreaterThan(0),
    );
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Māia Hart");
    expect((screen.getByLabelText("Profile URL") as HTMLInputElement).value).toBe("already-used");
  });

  it("labels creation as a draft and hides publication controls for a new record", () => {
    render(<PractitionerEditor record={null} terms={[]} isNew />);

    expect(screen.getByRole("button", { name: "Create draft" })).toBeTruthy();
    expect(screen.queryByText("Before publishing")).toBeNull();
    expect(screen.queryByText("Public lifecycle")).toBeNull();
  });

  it("shows missing publication requirements for a saved draft", () => {
    render(<PractitionerEditor record={savedDraft} terms={[]} />);

    expect(screen.getByText("Before publishing")).toBeTruthy();
    expect(screen.getByText("Add a summary")).toBeTruthy();
    expect(screen.getByText("Add about text")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Publish" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("publishes a saved complete draft through the separate publish action", async () => {
    const completeDraft = {
      ...savedDraft,
      summary: "A considered practice.",
      about: "About this practice.",
      image_path: "00000000-0000-4000-8000-000000000001/portrait.jpg",
      portrait_approval_required: false,
      terms: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          type: "location",
          name: "Ubud",
          is_active: true,
          archived_at: null,
        },
      ],
    } as unknown as TestPractitionerRecord;
    render(
      <PractitionerEditor
        record={completeDraft}
        terms={completeDraft.terms}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() =>
      expect(mocks.publish).toHaveBeenCalledWith(completeDraft.id),
    );
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
  });

  it("requires confirmation for a saved portrait without approval evidence", () => {
    const needsApproval = {
      ...savedDraft,
      summary: "A considered practice.",
      about: "About this practice.",
      image_path: "00000000-0000-4000-8000-000000000001/portrait.jpg",
      portrait_approval_required: true,
      terms: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          type: "location",
          name: "Ubud",
          is_active: true,
          archived_at: null,
        },
      ],
    } as unknown as TestPractitionerRecord;
    render(
      <PractitionerEditor
        record={needsApproval}
        terms={needsApproval.terms}
      />,
    );

    expect(
      screen.getByLabelText("I confirm this saved portrait is approved for public use."),
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Publish" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("keeps an existing slug when a saved name changes", () => {
    render(<PractitionerEditor record={savedDraft} terms={[]} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Renamed practitioner" },
    });

    expect((screen.getByLabelText("Profile URL") as HTMLInputElement).value).toBe(
      "maia-hart",
    );
  });

  it("unpublishes from the practitioner form when the sidebar has a form", async () => {
    render(<>
      <form aria-label="Sign out"><button>Sign out</button></form>
      <PractitionerEditor record={{ ...savedDraft, status: "published" }} terms={[]} />
    </>);

    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    const form = mocks.save.mock.calls[0][0];
    expect(form.get("name")).toBe(savedDraft.name);
    expect(form.get("slug")).toBe(savedDraft.slug);
    expect(form.get("status")).toBe("draft");
  });
});
