// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminTableShell } from "@/components/admin/admin-table";
import { defaultAdminTableQuery } from "@/hooks/use-admin-table-query";

type Row = { id: string; name: string; status: string };
const rows: Row[] = [
  { id: "one", name: "Maya Hart", status: "published" },
  { id: "two", name: "Rani Sari", status: "draft" },
];
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
];

function table(overrides: Partial<React.ComponentProps<typeof AdminTableShell<Row>>> = {}) {
  return createElement(AdminTableShell<Row>, {
    data: rows,
    columns,
    getRowId: (row) => row.id,
    query: defaultAdminTableQuery,
    onQueryChange: vi.fn(),
    statusTabs: [
      { value: "all", label: "All" },
      { value: "published", label: "Published", count: 1 },
    ],
    rowActions: (row) => createElement("button", { type: "button" }, `Open ${row.name}`),
    renderMobileCard: (row) => createElement("p", null, row.name),
    ...overrides,
  });
}

describe("AdminTableShell", () => {
  afterEach(cleanup);
  it("renders desktop rows, result counts, sortable headings, and row actions", () => {
    render(table({ totalCount: 2 }));

    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByText("2 results")).toBeTruthy();
    expect(screen.getByRole("button", { name: /sort by name/i })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /open maya hart/i })).toHaveLength(2);
  });

  it("updates URL-backed controls through the query callback", () => {
    let query = defaultAdminTableQuery;
    let rerender: (ui: React.ReactNode) => void = () => undefined;
    const onQueryChange = vi.fn((next) => {
      query = next;
      rerender(table({ query, onQueryChange }));
    });
    ({ rerender } = render(table({ query, onQueryChange })));

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "maya" } });
    fireEvent.mouseDown(screen.getByRole("tab", { name: /published/i }));
    fireEvent.click(screen.getByRole("button", { name: /sort by name/i }));

    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ search: "maya", page: 1 }));
    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ status: "published", page: 1 }));
    expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ sort: { id: "name", direction: "asc" } }));
  });

  it("renders mobile cards and actions without horizontal table overflow", () => {
    render(table());

    expect(screen.getByTestId("admin-table-mobile")).toBeTruthy();
    expect(screen.getByTestId("admin-table-shell").className).toContain("min-w-0");
    expect(screen.getAllByRole("button", { name: /open rani sari/i })).toHaveLength(2);
  });

  it("supports loading, empty, no-results, and retry states", () => {
    const onRetry = vi.fn();
    const { rerender } = render(table({ state: "loading" }));
    expect(screen.getByText("Loading records")).toBeTruthy();

    rerender(table({ data: [], state: "empty" }));
    expect(screen.getByText("No records yet")).toBeTruthy();
    rerender(table({ data: [], state: "no-results" }));
    expect(screen.getByText("No matching records")).toBeTruthy();
    rerender(table({ data: [], state: "server-error", onRetry }));
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
