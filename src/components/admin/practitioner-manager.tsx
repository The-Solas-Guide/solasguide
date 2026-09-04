"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SlidersHorizontalIcon, StarIcon } from "lucide-react";
import { AdminTableShell } from "@/components/admin/admin-table";
import { AdminArchiveDialog } from "@/components/admin/record-deletion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAdminTableQuery } from "@/hooks/use-admin-table-query";
import { formatAdminDate, getFeaturedReadiness, getPractitionerLifecycle } from "@/lib/admin/practitioner-cms";
import { archivePractitioner, reorderFeaturedPractitioners, setPractitionerFeaturedPosition, type AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";
import { taxonomyTypeLabel } from "@/lib/admin/taxonomy-cms";
import { cn } from "@/lib/utils";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "published" ? "default" : status === "archived" ? "secondary" : "outline"}>{statusLabel(status)}</Badge>;
}

function FeaturedSheet({ records, onChanged }: { records: AdminPractitionerRecord[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const featured = records.filter((record) => record.featured_position !== null).sort((left, right) => (left.featured_position ?? 99) - (right.featured_position ?? 99));
  const readiness = getFeaturedReadiness(featured.length);
  const move = (index: number, direction: -1 | 1) => {
    const next = [...featured];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      const result = await reorderFeaturedPractitioners(next.map((record) => record.id));
      if (result.ok) {
        onChanged();
        return;
      }
      window.alert(result.error ?? "The featured order could not be saved.");
    });
  };
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button type="button" variant="outline"><SlidersHorizontalIcon />Manage featured</Button></SheetTrigger><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg"><SheetHeader><SheetTitle>Featured practitioners</SheetTitle><SheetDescription>Featured ordering stays inside Practitioners. Move published records into the order used on the public site.</SheetDescription></SheetHeader><div className="grid gap-4 px-4"><div className={cn("rounded-md border p-4 text-sm", readiness.ready ? "border-primary/40 bg-primary/5" : "bg-muted/30")}><p className="font-medium">{readiness.count} of {readiness.required} positions filled</p><p className="mt-1 text-muted-foreground">Initial setup can use fewer records. Release approval needs eight published practitioners.</p></div>{featured.length === 0 ? <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">No published practitioners are featured yet.</p> : <ol className="grid gap-2" aria-label="Featured practitioner order">{featured.map((record, index) => <li key={record.id} className="flex min-h-14 items-center gap-3 rounded-md border p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{index + 1}</span><span className="min-w-0 flex-1 truncate font-medium">{record.name}</span><div className="flex gap-1"><Button type="button" variant="ghost" size="icon" aria-label={`Move ${record.name} up`} disabled={pending || index === 0} onClick={() => move(index, -1)}><ArrowUpIcon /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Move ${record.name} down`} disabled={pending || index === featured.length - 1} onClick={() => move(index, 1)}><ArrowDownIcon /></Button></div></li>)}</ol>}</div><SheetFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button></SheetFooter></SheetContent></Sheet>;
}

export function PractitionerManager({ initialRecords }: { initialRecords: AdminPractitionerRecord[] }) {
  const [records] = useState(initialRecords);
  const [pending, startTransition] = useTransition();
  const { state: query, dispatch } = useAdminTableQuery({ filters: { featured: [] } });
  const refresh = () => window.location.reload();
  const filtered = useMemo(() => {
    const search = query.search.toLowerCase();
    const featuredFilter = query.filters.featured?.[0];
    return records.filter((record) => {
      const lifecycle = getPractitionerLifecycle(record);
      const matchesStatus = query.status === "all" || lifecycle === query.status;
      const matchesFeatured = featuredFilter === "featured" ? record.featured_position !== null : featuredFilter === "not-featured" ? record.featured_position === null : true;
      const matchesSearch = !search || [record.name, record.slug, record.descriptor, record.summary].filter(Boolean).join(" ").toLowerCase().includes(search);
      return matchesStatus && matchesFeatured && matchesSearch;
    }).sort((left, right) => {
      const direction = query.sort?.direction === "desc" ? -1 : 1;
      if (query.sort?.id === "name") return left.name.localeCompare(right.name) * direction;
      if (query.sort?.id === "status") return left.status.localeCompare(right.status) * direction;
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });
  }, [query, records]);
  const feature = (record: AdminPractitionerRecord) => {
    const next = record.featured_position === null ? Math.min(8, records.filter((item) => item.featured_position !== null).length + 1) : null;
    startTransition(async () => {
      const result = await setPractitionerFeaturedPosition(record.id, next);
      if (!result.ok) window.alert(result.error ?? "Featured status could not be saved.");
      else refresh();
    });
  };
  const archive = (record: AdminPractitionerRecord) => startTransition(async () => { const result = await archivePractitioner(record.id); if (!result.ok) window.alert(result.error ?? "The practitioner could not be archived."); else refresh(); });
  const counts = { all: records.length, draft: records.filter((record) => getPractitionerLifecycle(record) === "draft").length, published: records.filter((record) => getPractitionerLifecycle(record) === "published").length, archived: records.filter((record) => getPractitionerLifecycle(record) === "archived").length };
  const columns = [
    { accessorKey: "name", header: "Name", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <div className="min-w-0"><p className="truncate font-medium">{row.original.name}</p><p className="truncate text-xs text-muted-foreground">{row.original.slug}</p></div> },
    { accessorKey: "status", header: "Status", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <StatusBadge status={getPractitionerLifecycle(row.original)} /> },
    { id: "featured", header: "Featured", cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => row.original.featured_position ? <span className="inline-flex items-center gap-1 text-sm"><StarIcon className="size-4 fill-current" />{row.original.featured_position}</span> : <span className="text-sm text-muted-foreground">Not featured</span> },
    { accessorKey: "updated_at", header: "Updated", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <span className="text-sm text-muted-foreground">{formatAdminDate(row.original.updated_at)}</span> },
  ];
  return <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6"><header className="flex min-w-0 flex-wrap items-start justify-between gap-4 border-b pb-5"><div className="min-w-0"><p className="text-sm font-medium text-muted-foreground">Public content</p><h1 className="break-words font-display text-4xl leading-tight">Practitioners</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Manage practitioner records, public visibility, portraits, taxonomy, and featured ordering.</p></div><div className="flex flex-wrap gap-2"><FeaturedSheet records={records} onChanged={refresh} /><Button asChild><Link href="/admin/practitioners/new"><PlusIcon />New practitioner</Link></Button></div></header><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Featured readiness</p><p className="mt-2 text-2xl font-semibold">{records.filter((record) => record.featured_position !== null).length} / 8</p><p className="mt-1 text-sm text-muted-foreground">Release approval requires eight.</p></div><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Published</p><p className="mt-2 text-2xl font-semibold">{counts.published}</p><p className="mt-1 text-sm text-muted-foreground">Changes publish when saved.</p></div><div className="rounded-md border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">All records</p><p className="mt-2 text-2xl font-semibold">{counts.all}</p><p className="mt-1 text-sm text-muted-foreground">Draft and archived records stay private.</p></div></div><AdminTableShell data={filtered} columns={columns} getRowId={(row) => row.id} query={query} onQueryChange={(next) => dispatch({ type: "hydrate", state: next })} totalCount={filtered.length} hasNextPage={false} statusTabs={[{ value: "all", label: "Every record", count: counts.all }, { value: "draft", label: "Draft", count: counts.draft }, { value: "published", label: "Published", count: counts.published }, { value: "archived", label: "Archived", count: counts.archived }]} filters={[{ id: "featured", label: "Featured", options: [{ value: "featured", label: "Featured only" }, { value: "not-featured", label: "Not featured" }] }]} rowActions={(record) => <div className="flex flex-wrap gap-1"><Button asChild variant="ghost"><Link href={`/admin/practitioners/${record.id}`}>Edit</Link></Button>{record.status === "published" && <Button type="button" variant="ghost" onClick={() => feature(record)} disabled={pending}>{record.featured_position ? "Remove featured" : "Feature"}</Button>}{record.status === "archived" ? <Button type="button" variant="ghost" onClick={() => startTransition(async () => { const result = await archivePractitioner(record.id, true); if (!result.ok) window.alert(result.error ?? "The practitioner could not be restored."); else refresh(); })} disabled={pending}>Restore</Button> : <AdminArchiveDialog recordName={record.name} onArchive={() => archive(record)} disabled={pending} />}</div>} renderMobileCard={(record) => <div className="grid gap-2"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium">{record.name}</p><p className="truncate text-xs text-muted-foreground">{record.slug}</p></div><StatusBadge status={getPractitionerLifecycle(record)} /></div><p className="text-sm text-muted-foreground">{record.featured_position ? `Featured position ${record.featured_position}` : "Not featured"}</p><p className="text-xs text-muted-foreground">Updated {formatAdminDate(record.updated_at)}</p></div>} /> <p className="sr-only" aria-live="polite">{pending ? "Saving practitioner changes" : ""}</p></div>;
}

export { taxonomyTypeLabel };
