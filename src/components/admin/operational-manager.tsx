"use client";

import Link from "next/link";
import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EllipsisIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminPage, AdminPageHeader, AdminStatus } from "@/components/admin/admin-page";
import { AdminTableEmptyState, AdminTableShell } from "@/components/admin/admin-table";
import { AdminArchiveConfirmation } from "@/components/admin/record-deletion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminTableQuery } from "@/hooks/use-admin-table-query";
import { formatAdminDate } from "@/lib/admin/practitioner-cms";
import { operationalConfig, type OperationalKind, type OperationalRecord } from "@/lib/admin/operational-cms";
import { setOperationalArchive } from "@/lib/admin/operational-actions";

function label(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }

function WorkflowBadges({ record }: { record: OperationalRecord }) {
  return <div className="flex flex-wrap items-center gap-3"><AdminStatus value={record.status} label={label(record.status)} />{record.archived_at ? <span className="text-sm text-muted-foreground">Archived</span> : null}</div>;
}

function RowActions({ kind, record, pending, onArchive }: { kind: OperationalKind; record: OperationalRecord; pending: boolean; onArchive: (record: OperationalRecord, archive: boolean) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button id={id} variant="ghost" size="icon" aria-label={`Actions for ${record.full_name}`} disabled={pending}><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild className="min-h-10"><Link href={`/admin/${kind}/${record.id}`}>View record</Link></DropdownMenuItem>{record.archived_at ? <DropdownMenuItem className="min-h-10" onSelect={() => onArchive(record, false)}>Restore</DropdownMenuItem> : <DropdownMenuItem className="min-h-10" onSelect={() => setOpen(true)}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu><AdminArchiveConfirmation open={open} onOpenChange={setOpen} recordName={record.full_name} onArchive={() => onArchive(record, true)} returnFocusId={id} /></>;
}

export function OperationalManager({ kind, initialRecords, error }: { kind: OperationalKind; initialRecords: OperationalRecord[]; error?: string }) {
  const config = operationalConfig(kind);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { state: query, dispatch } = useAdminTableQuery({ filters: { archive: [] }, pageSize: 10 });
  const filtered = useMemo(() => initialRecords.filter((record) => {
    const archive = query.filters.archive?.[0];
    return (query.status === "all" || record.status === query.status)
      && (archive === "active" ? !record.archived_at : archive === "archived" ? Boolean(record.archived_at) : true)
      && [record.full_name, record.email, record.phone, "practice_name" in record ? record.practice_name : ""].filter(Boolean).join(" ").toLowerCase().includes(query.search.toLowerCase().trim());
  }).sort((left, right) => {
    const key = query.sort?.id;
    const direction = query.sort?.direction === "desc" ? -1 : 1;
    if (key === "full_name" || key === "status" || key === "email") return left[key].localeCompare(right[key]) * direction;
    if (key === "created_at") return left.created_at.localeCompare(right.created_at) * direction;
    return right.created_at.localeCompare(left.created_at) || left.id.localeCompare(right.id);
  }), [initialRecords, query]);
  // Keep a valid page after archive removes the final row on the current page.
  const page = Math.min(query.page, Math.max(1, Math.ceil(filtered.length / query.pageSize)));
  const start = (page - 1) * query.pageSize;
  const archive = (record: OperationalRecord, archived: boolean) => startTransition(async () => {
    try {
      const result = await setOperationalArchive(kind, record.id, archived);
      if (!result.ok) toast.error(result.error ?? "The archive state could not be saved.");
      else { toast.success(archived ? "Record archived" : "Record restored"); router.refresh(); }
    } catch { toast.error("The archive state could not be saved. Try again."); }
  });
  const columns = [
    { accessorKey: "full_name", header: "Name", enableSorting: true, cell: ({ row }: { row: { original: OperationalRecord } }) => <Link className="block max-w-64 break-words font-medium underline-offset-4 hover:underline" href={`/admin/${kind}/${row.original.id}`}>{row.original.full_name}</Link> },
    { accessorKey: "email", header: "Email", enableSorting: true, cell: ({ row }: { row: { original: OperationalRecord } }) => <span className="block max-w-64 break-all">{row.original.email}</span> },
    { accessorKey: "status", header: "Workflow", enableSorting: true, cell: ({ row }: { row: { original: OperationalRecord } }) => <WorkflowBadges record={row.original} /> },
    { accessorKey: "created_at", header: "Received", enableSorting: true, cell: ({ row }: { row: { original: OperationalRecord } }) => formatAdminDate(row.original.created_at) },
  ];
  return <AdminPage>
    <AdminPageHeader title={config.title} description="Review submissions, update workflow status, and keep internal notes." actions={<Button asChild><Link href={`/admin/${kind}/new`}><PlusIcon />New {config.singular}</Link></Button>} />
    {error ? <AdminTableEmptyState state="server-error" onRetry={() => router.refresh()} /> : <AdminTableShell data={filtered.slice(start, start + query.pageSize)} columns={columns} getRowId={(row) => row.id} query={{ ...query, page }} onQueryChange={(next) => dispatch({ type: "hydrate", state: next })} onRetry={() => router.refresh()} totalCount={filtered.length} hasNextPage={start + query.pageSize < filtered.length} searchPlaceholder="Search name, email, or phone" filters={[{ id: "archive", label: "Archive state", options: [{ value: "active", label: "Active records" }, { value: "archived", label: "Archived records" }] }]} statusTabs={[{ value: "all", label: "All workflows" }, ...config.statuses.map((status) => ({ value: status, label: label(status) }))]} rowActions={(record) => <RowActions kind={kind} record={record} pending={pending} onArchive={archive} />} renderMobileCard={(record) => <div className="grid min-w-0 gap-3"><Link className="break-words font-medium underline underline-offset-4" href={`/admin/${kind}/${record.id}`}>{record.full_name}</Link><p className="break-all text-sm text-muted-foreground">{record.email}</p><WorkflowBadges record={record} /><p className="text-xs text-muted-foreground">Received {formatAdminDate(record.created_at)}</p></div>} />}
    <p role="status" className="sr-only">{pending ? "Saving archive state" : ""}</p>
  </AdminPage>;
}
