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
    vi.stubGlobal("CSS", { escape: (value: string) => value });
    mocks.save.mockResolvedValue({ ok: true });
    mocks.publish.mockResolvedValue({ ok: true });
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = vi.fn(() => "blob:portrait");
      static revokeObjectURL = vi.fn();
    });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  function selectPortrait() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
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
    vi.stubGlobal("CSS", { escape: (value: string) => value });
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
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Profile published" })).toBeTruthy(),
    );
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

  it("labels draft and live saves clearly, and prevents a stale preview", () => {
    const { rerender } = render(<PractitionerEditor record={savedDraft} terms={[]} />);
    expect(screen.getByRole("button", { name: "Save draft" })).toBeTruthy();
    expect(screen.getByText("Preview shows the latest saved version.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Changed practitioner" },
    });
    expect(screen.getByText("Preview shows the last saved version. Save changes to update it.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Preview saved version" }).getAttribute("aria-disabled")).toBe("true");

    rerender(<PractitionerEditor key="published" record={{ ...savedDraft, status: "published" }} terms={[]} />);
    expect(screen.getByRole("button", { name: "Update live profile" })).toBeTruthy();
  });

  it("moves keyboard navigation focus to the chosen editor section", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    render(<PractitionerEditor record={savedDraft} terms={[]} />);

    fireEvent.click(screen.getByRole("link", { name: "Practice areas" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(document.getElementById("section-practice-areas")),
    );
    scrollTo.mockRestore();
  });

  it("keeps selected practice areas visible while searching", () => {
    const selectedLocation = {
      id: "00000000-0000-4000-8000-000000000002",
      type: "location",
      name: "Ubud",
      is_active: true,
      archived_at: null,
      slug: "ubud",
      sort_order: 0,
      created_at: "2026-09-06T00:00:00.000Z",
      updated_at: "2026-09-06T00:00:00.000Z",
    };
    const matchedPractice = {
      id: "00000000-0000-4000-8000-000000000003",
      type: "practice_area",
      name: "Breathwork",
      is_active: true,
      archived_at: null,
      slug: "breathwork",
      sort_order: 0,
      created_at: "2026-09-06T00:00:00.000Z",
      updated_at: "2026-09-06T00:00:00.000Z",
    };
    const hiddenPractice = {
      id: "00000000-0000-4000-8000-000000000004",
      type: "practice_area",
      name: "Yoga",
      is_active: true,
      archived_at: null,
      slug: "yoga",
      sort_order: 0,
      created_at: "2026-09-06T00:00:00.000Z",
      updated_at: "2026-09-06T00:00:00.000Z",
    };
    render(
      <PractitionerEditor
        record={{ ...savedDraft, terms: [selectedLocation] } as TestPractitionerRecord}
        terms={[selectedLocation, matchedPractice, hiddenPractice]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search practice areas"), {
      target: { value: "breath" },
    });
    expect(screen.getAllByText("Ubud").length).toBeGreaterThan(0);
    expect(screen.getByText("Breathwork")).toBeTruthy();
    expect(screen.queryByText("Yoga")).toBeNull();
  });

  it("reports when no practice areas match a search", () => {
    const term = {
      id: "00000000-0000-4000-8000-000000000005",
      type: "practice_area",
      name: "Breathwork",
      is_active: true,
      archived_at: null,
      slug: "breathwork",
      sort_order: 0,
      created_at: "2026-09-06T00:00:00.000Z",
      updated_at: "2026-09-06T00:00:00.000Z",
    };
    render(<PractitionerEditor record={null} terms={[term]} isNew />);

    fireEvent.change(screen.getByLabelText("Search practice areas"), {
      target: { value: "yoga" },
    });

    expect(screen.getByText("No practice areas match your search.")).toBeTruthy();
  });

  it("does not mark profile content dirty when choosing a featured position", () => {
    const published = {
      ...savedDraft,
      status: "published",
      featured_position: 2,
    } as TestPractitionerRecord;
    render(<PractitionerEditor record={published} terms={[]} />);

    fireEvent.change(screen.getByLabelText("Featured position"), {
      target: { value: "3" },
    });

    expect(screen.getByText("Position changed. Save featured position to apply it.")).toBeTruthy();
    expect(screen.queryByText("Unsaved changes")).toBeNull();
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
