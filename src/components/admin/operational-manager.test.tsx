// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationalManager } from "./operational-manager";
import type { OperationalRecord } from "@/lib/admin/operational-cms";
import { defaultAdminTableQuery } from "@/lib/admin/types";

const mocks = vi.hoisted(() => ({ query: { search: "", filters: {} as Record<string, string[]>, status: "all", page: 1, pageSize: 10, sort: undefined as { id: string; direction: "asc" | "desc" } | undefined } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/hooks/use-admin-table-query", () => ({ useAdminTableQuery: () => ({ state: mocks.query, dispatch: vi.fn() }) }));
vi.mock("@/lib/admin/operational-actions", () => ({ setOperationalArchive: vi.fn() }));
afterEach(() => { cleanup(); mocks.query = { ...defaultAdminTableQuery, pageSize: 10, sort: undefined }; });
const records = [
  { id: "one", full_name: "Active Person", email: "active@example.test", phone: null, status: "contacted", archived_at: null, created_at: "2026-09-01T12:00:00Z" },
  { id: "two", full_name: "Archived Person", email: "archived@example.test", phone: null, status: "contacted", archived_at: "2026-09-03T12:00:00Z", created_at: "2026-09-02T12:00:00Z" },
] as OperationalRecord[];

describe("operational list", () => {
  it("filters archive state independently from workflow status", () => {
    mocks.query.status = "contacted";
    mocks.query.filters = { archive: ["archived"] };
    render(<OperationalManager kind="customer-enquiries" initialRecords={records} />);
    expect(screen.getAllByText("Archived Person").length).toBeGreaterThan(0);
    expect(screen.queryByText("Active Person")).toBeNull();
    expect(screen.getAllByText("Contacted").length).toBeGreaterThan(0);
    expect(screen.queryByText("Published")).toBeNull();
  });
  it("searches contacts and presents no results", () => {
    mocks.query.search = "missing@example.test";
    render(<OperationalManager kind="practitioner-interest" initialRecords={records} />);
    expect(screen.getByText("No matching records")).toBeTruthy();
  });
  it("shows a retryable error without claiming the collection is empty", () => {
    render(<OperationalManager kind="customer-enquiries" initialRecords={[]} error="Unavailable" />);
    expect(screen.getByText("Records could not be loaded")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("No records yet")).toBeNull();
  });
  it("keeps the last available page visible after records leave the current page", () => {
    mocks.query.page = 5;
    render(<OperationalManager kind="customer-enquiries" initialRecords={records} />);
    expect(screen.getAllByText("Active Person").length).toBeGreaterThan(0);
    expect(screen.getByText("Page 1")).toBeTruthy();
  });
});
