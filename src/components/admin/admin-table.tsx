"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminTableQueryState } from "@/lib/admin/types";

export type AdminTableState =
  | "ready"
  | "loading"
  | "empty"
  | "no-results"
  | "loading-more"
  | "server-error"
  | "unauthorized"
  | "expired-session";

export type AdminTableFilter = {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
};

export type AdminStatusTab = {
  value: string;
  label: string;
  count?: number;
};

type AdminTableShellProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  query: AdminTableQueryState;
  onQueryChange: (query: AdminTableQueryState) => void;
  state?: AdminTableState;
  totalCount?: number;
  hasNextPage?: boolean;
  searchPlaceholder?: string;
  filters?: readonly AdminTableFilter[];
  statusTabs?: readonly AdminStatusTab[];
  rowActions?: (row: T) => React.ReactNode;
  renderMobileCard?: (row: T) => React.ReactNode;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
};

function resultLabel(count: number) {
  return `${count} result${count === 1 ? "" : "s"}`;
}

function readableColumnLabel<T extends object>(column: ReturnType<ReturnType<typeof useReactTable<T>>["getAllColumns"]>[number]) {
  const header = column.columnDef.header;
  return typeof header === "string" ? header : column.id.replaceAll("_", " ");
}

function AdminTableEmptyState({ state, onRetry }: { state: AdminTableState; onRetry?: () => void }) {
  if (state === "server-error" || state === "unauthorized" || state === "expired-session") {
    const title = state === "server-error" ? "Records could not be loaded" : state === "unauthorized" ? "Access unavailable" : "Your session expired";
    const description = state === "server-error" ? "Try again, or return later if the problem continues." : state === "unauthorized" ? "You do not have permission to view these records." : "Sign in again to continue managing records.";
    return <Alert variant="destructive"><AlertTitle>{title}</AlertTitle><AlertDescription>{description}</AlertDescription>{onRetry && <Button className="mt-3" variant="outline" onClick={onRetry}>Retry</Button>}</Alert>;
  }
  const title = state === "no-results" ? "No matching records" : "No records yet";
  const description = state === "no-results" ? "Try a different search or clear a filter." : "Records will appear here when they are available.";
  return <Empty className="min-h-48 border"><EmptyHeader><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader></Empty>;
}

function AdminTableShell<T extends object>({
  data,
  columns,
  getRowId,
  query,
  onQueryChange,
  state = "ready",
  totalCount,
  hasNextPage = false,
  searchPlaceholder = "Search records",
  filters = [],
  statusTabs = [],
  rowActions,
  renderMobileCard,
  onRetry,
  onPageChange,
}: AdminTableShellProps<T>) {
  // TanStack owns the table instance lifecycle and returns stable state helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting: query.sort ? [{ id: query.sort.id, desc: query.sort.direction === "desc" }] : [],
    },
  });
  const count = totalCount ?? data.length;
  const hasSearchOrFilters = Boolean(query.search || query.status !== "all" || Object.values(query.filters).some((values) => values.length));

  const update = (next: Partial<AdminTableQueryState>) => onQueryChange({ ...query, ...next });
  const changePage = (page: number) => {
    const nextPage = Math.max(1, page);
    update({ page: nextPage });
    onPageChange?.(nextPage);
  };

  return (
    <section data-testid="admin-table-shell" className="flex min-w-0 w-full flex-col gap-4 overflow-hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <Input type="search" role="searchbox" aria-label="Search records" value={query.search} onChange={(event) => update({ search: event.currentTarget.value, page: 1 })} placeholder={searchPlaceholder} className="min-w-0 lg:max-w-sm" />
          {filters.map((filter) => {
            const selected = query.filters[filter.id]?.[0] ?? "all";
            return <Select key={filter.id} value={selected} onValueChange={(value) => update({ filters: { ...query.filters, [filter.id]: value === "all" ? [] : [value] }, page: 1 })}><SelectTrigger aria-label={filter.label} className="w-full lg:w-48"><SelectValue placeholder={filter.label} /></SelectTrigger><SelectContent><SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>{filter.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
          })}
        </div>
        {statusTabs.length > 0 && <Tabs value={query.status} onValueChange={(status) => update({ status, page: 1 })}><TabsList aria-label="Record status"><TabsTrigger value="all">All</TabsTrigger>{statusTabs.filter((tab) => tab.value !== "all").map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}{typeof tab.count === "number" && <Badge variant="outline" className="ml-1 min-h-5 px-1.5">{tab.count}</Badge>}</TabsTrigger>)}</TabsList></Tabs>}
      </div>

      <div className="flex min-h-7 items-center justify-between gap-3 text-sm text-muted-foreground"><span aria-live="polite">{resultLabel(count)}</span>{hasSearchOrFilters && <Button type="button" variant="link" onClick={() => onQueryChange({ ...query, search: "", filters: {}, status: "all", page: 1 })}>Clear filters</Button>}</div>

      {state === "loading" ? <div className="grid gap-3" aria-label="Loading records"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><span className="sr-only">Loading records</span></div> : state === "empty" || state === "no-results" || state === "server-error" || state === "unauthorized" || state === "expired-session" || (state === "ready" && data.length === 0) ? <AdminTableEmptyState state={state === "ready" ? (hasSearchOrFilters ? "no-results" : "empty") : state} onRetry={onRetry} /> : <>
        <div className="hidden min-w-0 overflow-hidden rounded-md border md:block"><Table><TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" className="inline-flex min-h-11 items-center text-left focus-visible:ring-2 focus-visible:ring-ring/40" aria-label={`Sort by ${readableColumnLabel(header.column)}`} onClick={() => update({ sort: query.sort?.id === header.column.id && query.sort.direction === "asc" ? { id: header.column.id, direction: "desc" } : query.sort?.id === header.column.id ? undefined : { id: header.column.id, direction: "asc" }, page: 1 })}>{flexRender(header.column.columnDef.header, header.getContext())}{query.sort?.id === header.column.id && <span aria-hidden="true" className="ml-1">{query.sort.direction === "asc" ? "↑" : "↓"}</span>}</button> : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}{rowActions && <TableCell className="w-1 whitespace-nowrap text-right">{rowActions(row.original)}</TableCell>}</TableRow>)}</TableBody></Table></div>
        <div data-testid="admin-table-mobile" className="grid min-w-0 gap-3 md:hidden">{table.getRowModel().rows.map((row) => <article key={row.id} className="min-w-0 overflow-hidden rounded-md border bg-card p-4"><div className="min-w-0">{renderMobileCard ? renderMobileCard(row.original) : row.getVisibleCells().map((cell) => <div key={cell.id} className="flex min-w-0 justify-between gap-3 border-b py-2 last:border-0"><span className="shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{readableColumnLabel(cell.column)}</span><span className="min-w-0 truncate text-right">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span></div>)}</div>{rowActions && <div className="mt-3 border-t pt-3">{rowActions(row.original)}</div>}</article>)}</div>
      </>}

      {state === "loading-more" && <div className="flex min-h-11 items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite"><Skeleton className="size-4 rounded-full" />Loading more records</div>}
      <nav aria-label="Record pagination" className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><span className="text-xs text-muted-foreground">Page {query.page}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => changePage(query.page - 1)} disabled={query.page <= 1}>Previous</Button><Button type="button" variant="outline" size="sm" onClick={() => changePage(query.page + 1)} disabled={!hasNextPage}>Next</Button></div></nav>
    </section>
  );
}

export { AdminTableShell, AdminTableEmptyState };
