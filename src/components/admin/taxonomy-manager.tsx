"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";
import { EllipsisIcon, PlusIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminTableShell } from "@/components/admin/admin-table";
import { AdminArchiveConfirmation } from "@/components/admin/record-deletion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminTableQuery } from "@/hooks/use-admin-table-query";
import { archiveTaxonomy, type AdminTaxonomyRecord } from "@/lib/admin/taxonomy-actions";
import { getTaxonomyLifecycle, formatAdminDate } from "@/lib/admin/practitioner-cms";
import { taxonomyTypes, taxonomyTypeLabel } from "@/lib/admin/taxonomy-cms";

function StateBadge({ state }: { state: string }) {
  return <Badge variant={state === "active" ? "default" : state === "archived" ? "secondary" : "outline"}>{state[0].toUpperCase() + state.slice(1)}</Badge>;
}

function TaxonomyRowActions({ record, disabled, onArchive, onRestore }: { record: AdminTaxonomyRecord; disabled: boolean; onArchive: (record: AdminTaxonomyRecord) => void; onRestore: (record: AdminTaxonomyRecord) => void }) {
  const triggerId = useId();
  const [archiveOpen, setArchiveOpen] = useState(false);

  return <><DropdownMenu><DropdownMenuTrigger asChild><Button id={triggerId} type="button" variant="ghost" size="icon" aria-label={`Actions for ${record.name}`} disabled={disabled}><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem asChild className="min-h-10 px-3"><Link href={`/admin/taxonomy/${record.id}`}>Edit term</Link></DropdownMenuItem><DropdownMenuSeparator />{record.archived_at ? <DropdownMenuItem className="min-h-10 px-3" onSelect={() => onRestore(record)}>Restore to inactive</DropdownMenuItem> : <DropdownMenuItem className="min-h-10 px-3" variant="destructive" onSelect={() => setArchiveOpen(true)}>Archive term</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu><AdminArchiveConfirmation open={archiveOpen} onOpenChange={setArchiveOpen} recordName={record.name} onArchive={() => onArchive(record)} returnFocusId={triggerId} /></>;
}

export function TaxonomyManager({ initialRecords }: { initialRecords: AdminTaxonomyRecord[] }) {
  const records = initialRecords;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { state: query, dispatch } = useAdminTableQuery({ filters: { type: [] }, pageSize: 10 });
  const refresh = () => router.refresh();
  const filtered = useMemo(() => {
    const search = query.search.toLowerCase();
    const type = query.filters.type?.[0];
    return records.filter((record) => (query.status === "all" || getTaxonomyLifecycle(record) === query.status) && (!type || record.type === type) && (!search || `${record.name} ${record.slug} ${taxonomyTypeLabel(record.type)}`.toLowerCase().includes(search))).sort((a, b) => {
      const direction = query.sort?.direction === "desc" ? -1 : 1;
      if (query.sort?.id === "name") return a.name.localeCompare(b.name) * direction;
      if (query.sort?.id === "type") return taxonomyTypeLabel(a.type).localeCompare(taxonomyTypeLabel(b.type)) * direction;
      if (query.sort?.id === "state") return getTaxonomyLifecycle(a).localeCompare(getTaxonomyLifecycle(b)) * direction;
      if (query.sort?.id === "usage") return (a.usageCount - b.usageCount) * direction;
      if (query.sort?.id === "sort_order") return (a.sort_order - b.sort_order) * direction || a.name.localeCompare(b.name) * direction;
      if (query.sort?.id === "updated_at") return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * direction;
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });
  }, [query, records]);
  const pageStart = (query.page - 1) * query.pageSize;
  const pageRecords = filtered.slice(pageStart, pageStart + query.pageSize);
  const counts = { all: records.length, active: records.filter((record) => getTaxonomyLifecycle(record) === "active").length, inactive: records.filter((record) => getTaxonomyLifecycle(record) === "inactive").length, archived: records.filter((record) => getTaxonomyLifecycle(record) === "archived").length };
  const columns = [
    { accessorKey: "name", header: "Term", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <div className="min-w-0"><Link href={`/admin/taxonomy/${row.original.id}`} className="font-medium underline-offset-4 hover:underline">{row.original.name}</Link><p className="mt-0.5 truncate text-xs text-muted-foreground">{row.original.slug}</p></div> },
    { accessorKey: "type", header: "Type", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <Badge variant="outline" className="whitespace-nowrap">{taxonomyTypeLabel(row.original.type)}</Badge> },
    { id: "state", accessorFn: (row: AdminTaxonomyRecord) => getTaxonomyLifecycle(row), header: "Status", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <StateBadge state={getTaxonomyLifecycle(row.original)} /> },
    { id: "usage", accessorFn: (row: AdminTaxonomyRecord) => row.usageCount, header: "Practitioners", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm"><UsersIcon className="size-4 text-muted-foreground" /><span className="font-medium tabular-nums">{row.original.usageCount}</span><span className="text-muted-foreground">linked</span></span> },
    { accessorKey: "sort_order", header: "Order", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <span className="tabular-nums text-muted-foreground">{row.original.sort_order}</span> },
    { accessorKey: "updated_at", header: "Updated", enableSorting: true, cell: ({ row }: { row: { original: AdminTaxonomyRecord } }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatAdminDate(row.original.updated_at)}</span> },
  ];
  const restore = (record: AdminTaxonomyRecord) => startTransition(async () => {
    const result = await archiveTaxonomy(record.id, true);
    if (!result.ok) toast.error(result.error ?? "The term could not be restored.");
    else refresh();
  });
  const archive = (record: AdminTaxonomyRecord) => startTransition(async () => {
    const result = await archiveTaxonomy(record.id);
    if (!result.ok) toast.error(result.error ?? "The term could not be archived.");
    else refresh();
  });

  return <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4 border-b pb-5"><div className="min-w-0"><p className="text-sm font-medium text-muted-foreground">Controlled values</p><h1 className="break-words font-display text-4xl leading-tight">Taxonomy</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Manage the terms used to describe practitioner practices and locations.</p></div><Button asChild><Link href="/admin/taxonomy/new"><PlusIcon />New term</Link></Button></header>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Active terms</p><p className="mt-2 text-2xl font-semibold">{counts.active}</p><p className="mt-1 text-sm text-muted-foreground">Available to public records.</p></div><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Inactive</p><p className="mt-2 text-2xl font-semibold">{counts.inactive}</p><p className="mt-1 text-sm text-muted-foreground">Kept for later reuse.</p></div><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Archived</p><p className="mt-2 text-2xl font-semibold">{counts.archived}</p><p className="mt-1 text-sm text-muted-foreground">Restore to inactive or delete if unused.</p></div></div>
    <AdminTableShell data={pageRecords} columns={columns} getRowId={(row) => row.id} query={query} onQueryChange={(next) => dispatch({ type: "hydrate", state: next })} totalCount={filtered.length} hasNextPage={pageStart + query.pageSize < filtered.length} searchPlaceholder="Search terms" statusTabs={[{ value: "all", label: "All", count: counts.all }, { value: "active", label: "Active", count: counts.active }, { value: "inactive", label: "Inactive", count: counts.inactive }, { value: "archived", label: "Archived", count: counts.archived }]} filters={[{ id: "type", label: "Type", options: taxonomyTypes.map((type) => ({ value: type, label: taxonomyTypeLabel(type) })) }]} rowActions={(record) => <TaxonomyRowActions record={record} disabled={pending} onArchive={archive} onRestore={restore} />} renderMobileCard={(record) => <div className="grid gap-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/admin/taxonomy/${record.id}`} className="truncate font-medium underline-offset-4 hover:underline">{record.name}</Link><p className="mt-0.5 truncate text-xs text-muted-foreground">{record.slug}</p></div><StateBadge state={getTaxonomyLifecycle(record)} /></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{taxonomyTypeLabel(record.type)}</Badge><span className="text-xs text-muted-foreground">Order {record.sort_order}</span></div><div className="flex items-center gap-2 text-sm"><UsersIcon className="size-4 text-muted-foreground" /><span><span className="font-medium tabular-nums">{record.usageCount}</span> linked practitioner{record.usageCount === 1 ? "" : "s"}</span></div><p className="text-xs text-muted-foreground">Updated {formatAdminDate(record.updated_at)}</p></div>} />
  </div>;
}
