"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, EllipsisIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminMetricRow, AdminPage, AdminPageHeader, AdminStatus } from "@/components/admin/admin-page";
import { AdminTableShell } from "@/components/admin/admin-table";
import { AdminArchiveConfirmation } from "@/components/admin/record-deletion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAdminTableQuery } from "@/hooks/use-admin-table-query";
import { formatAdminDate, getFeaturedReadiness, getPractitionerLifecycle } from "@/lib/admin/practitioner-cms";
import { archivePractitioner, reorderFeaturedPractitioners, setPractitionerFeaturedPosition, type AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";
import { cn } from "@/lib/utils";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  return <AdminStatus value={status} label={statusLabel(status)} />;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function imageUrl(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path ? `${base}/storage/v1/object/public/profile-images/${path}` : null;
}

export function imageProps(path: string | null, alt: string) {
  const src = imageUrl(path);
  return src ? getImageProps({ src, alt, width: 40, height: 40 }).props : undefined;
}

export function firstFreeFeaturedPosition(records: Pick<AdminPractitionerRecord, "featured_position">[]) {
  const occupied = new Set(records.map((item) => item.featured_position).filter((position): position is number => position !== null));
  return [1, 2, 3, 4, 5, 6, 7, 8].find((position) => !occupied.has(position)) ?? null;
}

type PractitionerRowActionsProps = {
  record: AdminPractitionerRecord;
  disabled: boolean;
  onFeature: (record: AdminPractitionerRecord) => void;
  onArchive: (record: AdminPractitionerRecord) => void;
  onRestore: (record: AdminPractitionerRecord) => void;
};

function PractitionerRowActions({ record, disabled, onFeature, onArchive, onRestore }: PractitionerRowActionsProps) {
  const triggerId = useId();
  const [archiveOpen, setArchiveOpen] = useState(false);

  return <><DropdownMenu><DropdownMenuTrigger asChild><Button id={triggerId} type="button" variant="ghost" size="icon" aria-label={`Actions for ${record.name}`} disabled={disabled}><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem asChild className="min-h-10 px-3"><Link href={`/admin/practitioners/${record.id}`}>Edit practitioner</Link></DropdownMenuItem>{record.status === "published" && <DropdownMenuItem className="min-h-10 px-3" onSelect={() => onFeature(record)}>{record.featured_position ? "Remove from featured" : "Add to featured"}</DropdownMenuItem>}<DropdownMenuSeparator />{record.status === "archived" ? <DropdownMenuItem className="min-h-10 px-3" onSelect={() => onRestore(record)}>Restore to draft</DropdownMenuItem> : <DropdownMenuItem className="min-h-10 px-3" variant="destructive" onSelect={() => setArchiveOpen(true)}>Archive practitioner</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu><AdminArchiveConfirmation open={archiveOpen} onOpenChange={setArchiveOpen} recordName={record.name} onArchive={() => onArchive(record)} returnFocusId={triggerId} /></>;
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
      if (result.ok) onChanged();
      else toast.error(result.error ?? "The featured order could not be saved.");
    });
  };

  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button type="button" variant="outline"><SlidersHorizontalIcon />Manage featured</Button></SheetTrigger>
    <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
      <SheetHeader><SheetTitle>Featured practitioners</SheetTitle><SheetDescription>Move practitioners up or down to change their order on the public site.</SheetDescription></SheetHeader>
      <div className="grid gap-5 px-4">
        <div className="border-y py-4 text-sm">
          <p className={cn("font-medium", readiness.ready ? "text-foreground" : "text-foreground")}>{readiness.count} of {readiness.required} positions filled</p>
          <p className="mt-1 text-muted-foreground">Add eight published practitioners before launch.</p>
        </div>
        {featured.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No published practitioners are featured yet.</p> : <ol className="grid gap-0" aria-label="Featured practitioner order">{featured.map((record, index) => <li key={record.id} className="flex min-h-14 items-center gap-3 border-b py-3 last:border-b-0"><span className="w-6 shrink-0 tabular-nums text-sm text-muted-foreground">{index + 1}</span><span className="min-w-0 flex-1 truncate font-medium">{record.name}</span><div className="flex gap-1"><Button type="button" variant="ghost" size="icon" aria-label={`Move ${record.name} up`} disabled={pending || index === 0} onClick={() => move(index, -1)}><ArrowUpIcon /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Move ${record.name} down`} disabled={pending || index === featured.length - 1} onClick={() => move(index, 1)}><ArrowDownIcon /></Button></div></li>)}</ol>}
      </div>
      <SheetFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button></SheetFooter>
    </SheetContent>
  </Sheet>;
}

export function PractitionerManager({ initialRecords }: { initialRecords: AdminPractitionerRecord[] }) {
  const records = initialRecords;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { state: query, dispatch } = useAdminTableQuery({ filters: { featured: [], term: [] }, pageSize: 10 });
  const refresh = () => router.refresh();
  const termOptions = useMemo(() => [...new Map(records.flatMap((record) => record.terms.map((term) => [term.id, term.name]))).entries()].map(([value, label]) => ({ value, label })), [records]);

  const filtered = useMemo(() => {
    const search = query.search.toLowerCase();
    const featuredFilter = query.filters.featured?.[0];
    const termFilter = query.filters.term?.[0];
    return records.filter((record) => {
      const lifecycle = getPractitionerLifecycle(record);
      const matchesStatus = query.status === "all" || lifecycle === query.status;
      const matchesFeatured = featuredFilter === "featured" ? record.featured_position !== null : featuredFilter === "not-featured" ? record.featured_position === null : true;
      const matchesTerm = !termFilter || record.terms.some((term) => term.id === termFilter);
      const matchesSearch = !search || [record.name, record.slug, record.descriptor, record.summary].filter(Boolean).join(" ").toLowerCase().includes(search);
      return matchesStatus && matchesFeatured && matchesTerm && matchesSearch;
    }).sort((left, right) => {
      const direction = query.sort?.direction === "desc" ? -1 : 1;
      if (query.sort?.id === "name") return left.name.localeCompare(right.name) * direction;
      if (query.sort?.id === "status") return left.status.localeCompare(right.status) * direction;
      if (query.sort?.id === "updated_at") {
        return (new Date(left.updated_at).getTime() - new Date(right.updated_at).getTime()) * direction;
      }
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });
  }, [query, records]);
  const pageStart = (query.page - 1) * query.pageSize;
  const pageRecords = filtered.slice(pageStart, pageStart + query.pageSize);

  const feature = (record: AdminPractitionerRecord) => {
    const next = record.featured_position === null ? firstFreeFeaturedPosition(records) : null;
    if (record.featured_position === null && next === null) {
      toast.error("All eight featured positions are filled. Remove one before adding another.");
      return;
    }
    startTransition(async () => {
      const result = await setPractitionerFeaturedPosition(record.id, next);
      if (!result.ok) toast.error(result.error ?? "Featured status could not be saved.");
      else refresh();
    });
  };
  const archive = (record: AdminPractitionerRecord) => startTransition(async () => {
    const result = await archivePractitioner(record.id);
    if (!result.ok) toast.error(result.error ?? "The practitioner could not be archived.");
    else refresh();
  });
  const restore = (record: AdminPractitionerRecord) => startTransition(async () => {
    const result = await archivePractitioner(record.id, true);
    if (!result.ok) toast.error(result.error ?? "The practitioner could not be restored.");
    else refresh();
  });
  const counts = { all: records.length, draft: records.filter((record) => getPractitionerLifecycle(record) === "draft").length, published: records.filter((record) => getPractitionerLifecycle(record) === "published").length, archived: records.filter((record) => getPractitionerLifecycle(record) === "archived").length };
  const columns = [
    { accessorKey: "name", header: "Practitioner", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <div className="flex min-w-0 items-center gap-3"><Avatar size="lg"><AvatarImage {...imageProps(row.original.image_path, row.original.image_alt ?? "")} /><AvatarFallback>{initials(row.original.name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-medium">{row.original.name}</p><p className="truncate text-xs text-muted-foreground">{row.original.slug}</p></div></div> },
    { accessorKey: "status", header: "Status", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <StatusBadge status={getPractitionerLifecycle(row.original)} /> },
    { id: "featured", header: "Featured", cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => row.original.featured_position ? <span className="text-sm tabular-nums">Position {row.original.featured_position}</span> : <span className="text-sm text-muted-foreground">Not featured</span> },
    { accessorKey: "updated_at", header: "Updated", enableSorting: true, cell: ({ row }: { row: { original: AdminPractitionerRecord } }) => <span className="text-sm text-muted-foreground">{formatAdminDate(row.original.updated_at)}</span> },
  ];

  return <AdminPage>
    <AdminPageHeader title="Practitioners" description="Manage practitioner records, public visibility, portraits, taxonomy, and featured ordering." actions={<><FeaturedSheet records={records} onChanged={refresh} /><Button asChild><Link href="/admin/practitioners/new"><PlusIcon />New practitioner</Link></Button></>} />
    <AdminMetricRow items={[{ label: "Featured readiness", value: `${records.filter((record) => record.featured_position !== null).length} / 8`, hint: "Release approval requires eight." }, { label: "Published", value: counts.published, hint: "Changes publish when saved." }, { label: "All records", value: counts.all, hint: "Draft and archived records stay private." }]} />
    <AdminTableShell data={pageRecords} columns={columns} getRowId={(row) => row.id} query={query} onQueryChange={(next) => dispatch({ type: "hydrate", state: next })} totalCount={filtered.length} hasNextPage={pageStart + query.pageSize < filtered.length} statusTabs={[{ value: "all", label: "All", count: counts.all }, { value: "draft", label: "Draft", count: counts.draft }, { value: "published", label: "Published", count: counts.published }, { value: "archived", label: "Archived", count: counts.archived }]} filters={[{ id: "featured", label: "Featured", options: [{ value: "featured", label: "Featured only" }, { value: "not-featured", label: "Not featured" }] }, { id: "term", label: "Taxonomy term", options: termOptions }]} rowActions={(record) => <PractitionerRowActions record={record} disabled={pending} onFeature={feature} onArchive={archive} onRestore={restore} />} renderMobileCard={(record) => <div className="grid gap-2"><div className="flex min-w-0 items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><Avatar size="lg"><AvatarImage {...imageProps(record.image_path, record.image_alt ?? "")} /><AvatarFallback>{initials(record.name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-medium">{record.name}</p><p className="truncate text-xs text-muted-foreground">{record.slug}</p></div></div><StatusBadge status={getPractitionerLifecycle(record)} /></div><p className="text-sm text-muted-foreground">{record.featured_position ? `Featured position ${record.featured_position}` : "Not featured"}</p><p className="text-xs text-muted-foreground">Updated {formatAdminDate(record.updated_at)}</p></div>} />
    <p className="sr-only" aria-live="polite">{pending ? "Saving practitioner changes" : ""}</p>
  </AdminPage>;
}
