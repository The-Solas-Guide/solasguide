// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { PractitionerEditor } from "@/components/admin/practitioner-editor";
import { firstFreeFeaturedPosition, imageProps, PractitionerManager } from "@/components/admin/practitioner-manager";
import { TaxonomyEditor } from "@/components/admin/taxonomy-editor";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import type { AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";
import type { AdminTaxonomyRecord } from "@/lib/admin/taxonomy-actions";

const mocks = vi.hoisted(() => ({
  archivePractitioner: vi.fn(async () => ({ ok: true })),
  deletePractitioner: vi.fn(async () => ({ ok: true })),
  reorderFeaturedPractitioners: vi.fn(async () => ({ ok: true })),
  savePractitioner: vi.fn(async () => ({ ok: true, data: { id: "00000000-0000-4000-8000-000000000001" } })),
  setPractitionerFeaturedPosition: vi.fn(async () => ({ ok: true })),
  archiveTaxonomy: vi.fn(async () => ({ ok: true })),
  deleteTaxonomy: vi.fn(async () => ({ ok: true })),
  saveTaxonomy: vi.fn(async () => ({ ok: true, data: { id: "00000000-0000-4000-8000-000000000011" } })),
  replace: vi.fn(),
  refresh: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() } }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/practitioners",
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
  useSearchParams: () => mocks.searchParams,
}));
vi.mock("@/lib/admin/practitioner-actions", () => ({
  archivePractitioner: mocks.archivePractitioner,
  deletePractitioner: mocks.deletePractitioner,
  reorderFeaturedPractitioners: mocks.reorderFeaturedPractitioners,
  savePractitioner: mocks.savePractitioner,
  setPractitionerFeaturedPosition: mocks.setPractitionerFeaturedPosition,
}));
vi.mock("@/lib/admin/taxonomy-actions", () => ({
  archiveTaxonomy: mocks.archiveTaxonomy,
  deleteTaxonomy: mocks.deleteTaxonomy,
  saveTaxonomy: mocks.saveTaxonomy,
}));

const practitionerId = "00000000-0000-4000-8000-000000000001";
const termId = "00000000-0000-4000-8000-000000000011";
const practitioner = {
  id: practitionerId,
  slug: "test-practitioner",
  name: "Test Practitioner",
  descriptor: "Therapist",
  years_active: 8,
  summary: "A concise summary.",
  about: "A longer description.",
  credentials: [],
  significant_training: [],
  offers_in_person: true,
  offers_online: true,
  website_url: null,
  instagram_url: null,
  image_path: null,
  image_alt: null,
  image_focal_x: 35,
  image_focal_y: 65,
  status: "published",
  archived_at: null,
  published_at: "2026-09-04T00:00:00Z",
  featured_position: 2,
  created_at: "2026-09-04T00:00:00Z",
  updated_at: "2026-09-04T00:00:00Z",
  terms: [],
} as AdminPractitionerRecord;
const taxonomy = {
  id: termId,
  type: "location",
  name: "Bali",
  slug: "bali",
  sort_order: 0,
  is_active: false,
  archived_at: "2026-09-04T00:00:00Z",
  created_at: "2026-09-04T00:00:00Z",
  updated_at: "2026-09-04T00:00:00Z",
  usageCount: 1,
  practitioners: [{ id: practitionerId, name: practitioner.name, slug: practitioner.slug }],
} as AdminTaxonomyRecord;
const archivedLinkedTerm = { ...taxonomy, name: "Archived Bali", slug: "archived-bali" };
const archivedUnlinkedTerm = { ...taxonomy, id: "00000000-0000-4000-8000-000000000012", name: "Archived Tokyo", slug: "archived-tokyo", practitioners: [], usageCount: 0 };
const activeTaxonomy = { ...taxonomy, is_active: true, archived_at: null, practitioners: [], usageCount: 0 };

describe("practitioner and taxonomy CMS controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });
  afterEach(() => cleanup());

  it("shows editor preview, focal controls, and feature controls", () => {
    render(<PractitionerEditor record={practitioner} terms={[]} />);
    expect(screen.getByRole("link", { name: "Preview" }).getAttribute("href")).toBe(`/admin/practitioners/${practitionerId}/preview`);
    expect((screen.getByLabelText("Horizontal position") as HTMLInputElement).value).toBe("35");
    expect((screen.getByLabelText("Vertical position") as HTMLInputElement).value).toBe("65");
    expect(screen.getByRole("button", { name: "Save featured position" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Unfeature" })).toBeTruthy();
  });

  it("shows featured actions and readiness on the practitioner screen", () => {
    render(<PractitionerManager initialRecords={[practitioner]} />);
    expect(screen.getByRole("button", { name: "Manage featured" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Actions for Test Practitioner" })).toHaveLength(2);
    expect(screen.getByRole("tab", { name: /All 1/ })).toBeTruthy();
    expect(screen.getAllByText("1 / 8")).toHaveLength(1);
  });

  it("uses the first free featured position when the current order has gaps", async () => {
    const other = { ...practitioner, id: "00000000-0000-4000-8000-000000000003", name: "Other Practitioner", slug: "other-practitioner", featured_position: 1 };
    const candidate = { ...practitioner, id: "00000000-0000-4000-8000-000000000004", name: "Candidate Practitioner", slug: "candidate-practitioner", featured_position: null };
    expect(firstFreeFeaturedPosition([other, practitioner, candidate])).toBe(3);
  });

  it("returns no available position when all featured slots are filled", () => {
    const records = Array.from({ length: 8 }, (_, index) => ({
      ...practitioner,
      id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
      name: `Featured Practitioner ${index + 1}`,
      slug: `featured-practitioner-${index + 1}`,
      featured_position: index + 1,
    }));
    expect(firstFreeFeaturedPosition(records)).toBeNull();
  });

  it("renders refreshed practitioner props instead of keeping the initial records", () => {
    const { rerender } = render(<PractitionerManager initialRecords={[practitioner]} />);
    rerender(<PractitionerManager initialRecords={[{ ...practitioner, name: "Updated Practitioner" }]} />);
    expect(screen.getAllByText("Updated Practitioner").length).toBeGreaterThan(0);
  });

  it("paginates practitioner records", () => {
    const records = Array.from({ length: 11 }, (_, index) => ({
      ...practitioner,
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      name: `Practitioner ${String(index + 1).padStart(2, "0")}`,
      slug: `practitioner-${index + 1}`,
    }));
    render(<PractitionerManager initialRecords={records} />);
    expect(screen.getByText("Page 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2")).toBeTruthy();
    expect(screen.getAllByText("Practitioner 11").length).toBeGreaterThan(0);
    expect(screen.queryByText("Practitioner 01")).toBeNull();
  });

  it("uses the page size from the table query", () => {
    mocks.searchParams = new URLSearchParams("pageSize=25");
    const records = Array.from({ length: 11 }, (_, index) => ({
      ...practitioner,
      id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
      name: `Practitioner ${String(index + 1).padStart(2, "0")}`,
      slug: `practitioner-${index + 1}`,
    }));
    render(<PractitionerManager initialRecords={records} />);
    expect(screen.getAllByText("Practitioner 11").length).toBeGreaterThan(0);
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders resized table portrait props", () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    const props = imageProps("portrait/avatar.jpg", "Approved portrait");

    expect(props?.width).toBe(40);
    expect(props?.height).toBe(40);
    expect(props?.src).toContain("w=96");
    expect(props?.srcSet).toContain("w=48");
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
  });

  it("sorts practitioner updated dates in both directions", async () => {
    const older = { ...practitioner, id: "00000000-0000-0000-0000-000000000021", name: "Older Practitioner", slug: "older-practitioner", updated_at: "2026-09-01T00:00:00Z" };
    const newer = { ...practitioner, id: "00000000-0000-0000-0000-000000000022", name: "Newer Practitioner", slug: "newer-practitioner", updated_at: "2026-09-03T00:00:00Z" };
    render(<PractitionerManager initialRecords={[newer, older]} />);
    const table = screen.getByTestId("admin-table-desktop");
    const sortButton = within(table).getByRole("button", { name: "Sort by Updated" });

    fireEvent.click(sortButton);
    await waitFor(() => expect(within(table).getAllByRole("row")[1].textContent).toContain("Older Practitioner"));
    fireEvent.click(sortButton);
    await waitFor(() => expect(within(table).getAllByRole("row")[1].textContent).toContain("Newer Practitioner"));
  });

  it("shows exact linked practitioner names and links on taxonomy screens", () => {
    render(<TaxonomyEditor record={taxonomy} />);
    expect(screen.getByRole("link", { name: practitioner.name }).getAttribute("href")).toBe(`/admin/practitioners/${practitionerId}`);
    expect(screen.getByText(/Used by 1 practitioner/)).toBeTruthy();
  });

  it("clears the saved state when an existing taxonomy term is edited", async () => {
    render(<TaxonomyEditor record={activeTaxonomy} />);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocks.saveTaxonomy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: "Saved" })).toBeTruthy());
    expect(mocks.refresh).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Changed term" } });
    expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
  });

  it("blocks practitioner archive while the editor has unsaved changes", async () => {
    render(<PractitionerEditor record={practitioner} terms={[]} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Changed name" } });
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    await waitFor(() => expect(mocks.archivePractitioner).not.toHaveBeenCalled());
    expect(toast.warning).toHaveBeenCalledWith("Save or cancel your changes before archiving or restoring this practitioner.");
  });

  it("keeps the practitioner editor usable after archiving", async () => {
    const { container } = render(<PractitionerEditor record={practitioner} terms={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    await waitFor(() => expect(mocks.archivePractitioner).toHaveBeenCalledWith(practitionerId, false));
    await waitFor(() => expect(container.querySelector('[data-lifecycle="archived"]')?.textContent).toBe("Archived"));
  });

  it("blocks taxonomy archive while the editor has unsaved changes", async () => {
    render(<TaxonomyEditor record={activeTaxonomy} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Changed term" } });
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    await waitFor(() => expect(mocks.archiveTaxonomy).not.toHaveBeenCalled());
    expect(toast.warning).toHaveBeenCalledWith("Save or cancel your changes before archiving or restoring this taxonomy term.");
  });

  it("keeps the taxonomy editor usable after archiving", async () => {
    const { container } = render(<TaxonomyEditor record={activeTaxonomy} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    await waitFor(() => expect(mocks.archiveTaxonomy).toHaveBeenCalledWith(activeTaxonomy.id, false));
    await waitFor(() => expect(container.querySelector('[data-lifecycle="archived"]')?.textContent).toBe("archived"));
  });

  it("paginates taxonomy records", () => {
    const records = Array.from({ length: 11 }, (_, index) => ({
      ...activeTaxonomy,
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      name: `Taxonomy ${String(index + 1).padStart(2, "0")}`,
      slug: `taxonomy-${index + 1}`,
      sort_order: index,
    }));
    render(<TaxonomyManager initialRecords={records} />);
    expect(screen.getByText("Page 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 2")).toBeTruthy();
    expect(screen.getAllByText("Taxonomy 11").length).toBeGreaterThan(0);
    expect(screen.queryByText("Taxonomy 01")).toBeNull();
  });

  it("sorts taxonomy state, usage, and order through sortable accessors", async () => {
    const records = [
      { ...activeTaxonomy, id: "00000000-0000-0000-0000-000000000031", name: "Low usage", slug: "low-usage", usageCount: 1, sort_order: 20 },
      { ...activeTaxonomy, id: "00000000-0000-0000-0000-000000000032", name: "High usage", slug: "high-usage", usageCount: 3, sort_order: 10, is_active: false },
    ];
    render(<TaxonomyManager initialRecords={records} />);
    const table = screen.getByTestId("admin-table-desktop");
    const rowText = () => within(table).getAllByRole("row").slice(1).map((row) => row.textContent ?? "");

    fireEvent.click(within(table).getByRole("button", { name: "Sort by Practitioners" }));
    await waitFor(() => expect(rowText()[0]).toContain("Low usage"));
    fireEvent.click(within(table).getByRole("button", { name: "Sort by Status" }));
    await waitFor(() => expect(rowText()[0]).toContain("Low usage"));
    fireEvent.click(within(table).getByRole("button", { name: "Sort by Order" }));
    await waitFor(() => expect(rowText()[0]).toContain("High usage"));
  });

  it("keeps linked archived taxonomy terms visible, but hides unrelated archived terms", () => {
    render(<PractitionerEditor record={{ ...practitioner, terms: [archivedLinkedTerm] }} terms={[archivedLinkedTerm, archivedUnlinkedTerm]} />);
    expect(screen.getByText("Archived Bali")).toBeTruthy();
    expect(screen.getAllByText("Archived", { selector: "span" }).length).toBeGreaterThan(0);
    expect(screen.queryByText("Archived Tokyo")).toBeNull();
    fireEvent.click(screen.getByLabelText(/Archived Bali/));
    expect(screen.queryByText("Archived Bali")).toBeNull();
  });

  it("hides unlinked inactive taxonomy terms", () => {
    const inactiveTerm = { ...activeTaxonomy, id: "00000000-0000-4000-8000-000000000013", name: "Inactive Tokyo", slug: "inactive-tokyo", is_active: false };
    render(<PractitionerEditor record={practitioner} terms={[activeTaxonomy, inactiveTerm]} />);
    expect(screen.getByText("Bali")).toBeTruthy();
    expect(screen.queryByText("Inactive Tokyo")).toBeNull();
  });
});
