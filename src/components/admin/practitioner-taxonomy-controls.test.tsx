// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PractitionerEditor } from "@/components/admin/practitioner-editor";
import { PractitionerManager } from "@/components/admin/practitioner-manager";
import { TaxonomyEditor } from "@/components/admin/taxonomy-editor";
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
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/practitioners",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
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

describe("practitioner and taxonomy CMS controls", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows editor preview, focal controls, and feature controls", () => {
    render(<PractitionerEditor record={practitioner} terms={[]} />);
    expect(screen.getByRole("link", { name: "Preview" }).getAttribute("href")).toBe(`/admin/practitioners/${practitionerId}/preview`);
    expect((screen.getByLabelText("Focal X (0–100)") as HTMLInputElement).value).toBe("35");
    expect((screen.getByLabelText("Focal Y (0–100)") as HTMLInputElement).value).toBe("65");
    expect(screen.getByRole("button", { name: "Save featured position" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Unfeature" })).toBeTruthy();
  });

  it("shows featured actions and readiness on the practitioner screen", () => {
    render(<PractitionerManager initialRecords={[practitioner]} />);
    expect(screen.getByRole("button", { name: "Manage featured" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Remove featured" })).toHaveLength(2);
    expect(screen.getAllByText("1 / 8")).toHaveLength(1);
  });

  it("shows exact linked practitioner names and links on taxonomy screens", () => {
    render(<TaxonomyEditor record={taxonomy} />);
    expect(screen.getByRole("link", { name: practitioner.name }).getAttribute("href")).toBe(`/admin/practitioners/${practitionerId}`);
    expect(screen.getByText(/Used by 1 practitioner/)).toBeTruthy();
  });
});
