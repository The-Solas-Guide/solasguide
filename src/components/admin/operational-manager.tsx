"use client";

import Link from "next/link";
import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EllipsisIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPage,
  AdminPageHeader,
  AdminStatus,
} from "@/components/admin/admin-page";
import {
  AdminTableEmptyState,
  AdminTableShell,
} from "@/components/admin/admin-table";
import { AdminArchiveConfirmation } from "@/components/admin/record-deletion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminTableQuery } from "@/hooks/use-admin-table-query";
import { formatAdminDate } from "@/lib/admin/practitioner-cms";
import {
  operationalConfig,
  type OperationalKind,
  type OperationalRecord,
} from "@/lib/admin/operational-cms";
import {
  saveOperationalRecord,
  setOperationalArchive,
} from "@/lib/admin/operational-actions";

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function WorkflowBadges({ record }: { record: OperationalRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <AdminStatus value={record.status} label={label(record.status)} />
      {record.archived_at ? (
        <AdminStatus value="archived" label="Archived" />
      ) : null}
    </div>
  );
}

function RowActions({
  kind,
  record,
  pending,
  onArchive,
  onWorkflowChange,
}: {
  kind: OperationalKind;
  record: OperationalRecord;
  pending: boolean;
  onArchive: (record: OperationalRecord, archive: boolean) => void;
  onWorkflowChange: (record: OperationalRecord, status: string) => void;
}) {
  const config = operationalConfig(kind);
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${record.full_name}`}
            disabled={pending}
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild className="min-h-10 px-3">
            <Link href={`/admin/${kind}/${record.id}`}>Open record</Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="min-h-10 px-3">
              Change workflow
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {config.statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  className="min-h-10 px-3"
                  disabled={record.status === status}
                  onSelect={() => onWorkflowChange(record, status)}
                >
                  Set to {label(status)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          {record.archived_at ? (
            <DropdownMenuItem
              className="min-h-10 px-3"
              onSelect={() => onArchive(record, false)}
            >
              Restore record
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="min-h-10 px-3"
              onSelect={() => setOpen(true)}
            >
              Archive record
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AdminArchiveConfirmation
        open={open}
        onOpenChange={setOpen}
        recordName={record.full_name}
        onArchive={() => onArchive(record, true)}
        returnFocusId={id}
      />
    </>
  );
}

export function OperationalManager({
  kind,
  initialRecords,
  error,
}: {
  kind: OperationalKind;
  initialRecords: OperationalRecord[];
  error?: string;
}) {
  const config = operationalConfig(kind);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [archiveUpdates, setArchiveUpdates] = useState<
    Record<string, { source: boolean; value: boolean }>
  >({});
  const [workflowUpdates, setWorkflowUpdates] = useState<
    Record<string, { source: string; value: string }>
  >({});
  const [previousRecords, setPreviousRecords] = useState(initialRecords);
  if (initialRecords !== previousRecords) {
    setPreviousRecords(initialRecords);
    setArchiveUpdates((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id, update]) => {
          const record = initialRecords.find((item) => item.id === id);
          return record && Boolean(record.archived_at) === update.source;
        }),
      ),
    );
    setWorkflowUpdates((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id, update]) => {
          const record = initialRecords.find((item) => item.id === id);
          return record && record.status === update.source;
        }),
      ),
    );
  }
  const records = useMemo(
    () =>
      initialRecords.map((record) => ({
        ...record,
        archived_at:
          archiveUpdates[record.id] &&
            Boolean(record.archived_at) === archiveUpdates[record.id].source
            ? archiveUpdates[record.id].value
              ? new Date().toISOString()
              : null
            : record.archived_at,
        status:
          workflowUpdates[record.id] &&
            record.status === workflowUpdates[record.id].source
            ? workflowUpdates[record.id].value
            : record.status,
      })) as OperationalRecord[],
    [archiveUpdates, initialRecords, workflowUpdates],
  );
  const { state: query, dispatch } = useAdminTableQuery({
    filters: { archive: ["active"] },
    pageSize: 10,
  });
  const searchable = useMemo(
    () =>
      records.filter((record) => {
        const archive = query.filters.archive?.[0];
        return (
          (archive === "active"
            ? !record.archived_at
            : archive === "archived"
              ? Boolean(record.archived_at)
              : true) &&
          [
            record.full_name,
            record.email,
            record.phone,
            "practice_name" in record ? record.practice_name : "",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query.search.toLowerCase().trim())
        );
      }),
    [records, query.filters.archive, query.search],
  );
  const filtered = useMemo(
    () =>
      searchable
        .filter(
          (record) => query.status === "all" || record.status === query.status,
        )
        .sort((left, right) => {
          const key = query.sort?.id;
          const direction = query.sort?.direction === "desc" ? -1 : 1;
          if (key === "full_name" || key === "status" || key === "email")
            return left[key].localeCompare(right[key]) * direction;
          if (key === "created_at")
            return left.created_at.localeCompare(right.created_at) * direction;
          return (
            right.created_at.localeCompare(left.created_at) ||
            left.id.localeCompare(right.id)
          );
        }),
    [searchable, query.sort, query.status],
  );
  // Keep a valid page after archive removes the final row on the current page.
  const page = Math.min(
    query.page,
    Math.max(1, Math.ceil(filtered.length / query.pageSize)),
  );
  const start = (page - 1) * query.pageSize;
  const archive = (record: OperationalRecord, archived: boolean) =>
    startTransition(async () => {
      try {
        const result = await setOperationalArchive(kind, record.id, archived);
        if (!result.ok)
          toast.error(result.error ?? "The archive state could not be saved.");
        else {
          setArchiveUpdates((current) => ({
            ...current,
            [record.id]: { source: Boolean(record.archived_at), value: archived },
          }));
          const archiveView = query.filters.archive?.[0];
          if (
            (archived && archiveView === "active") ||
            (!archived && archiveView === "archived")
          ) {
            window.setTimeout(() => {
              document.querySelector<HTMLInputElement>('[role="searchbox"]')?.focus();
            }, 0);
          }
          toast.success(archived ? "Record archived" : "Record restored");
          router.refresh();
        }
      } catch {
        toast.error("The archive state could not be saved. Try again.");
      }
    });
  const changeWorkflow = (record: OperationalRecord, status: string) =>
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", record.id);
        formData.set("status", status);
        const result = await saveOperationalRecord(kind, formData);
        if (!result.ok) {
          toast.error(result.error ?? "The workflow status could not be saved.");
          return;
        }
        setWorkflowUpdates((current) => ({
          ...current,
          [record.id]: { source: record.status, value: status },
        }));
        toast.success(`Workflow set to ${label(status)}`);
        router.refresh();
      } catch {
        toast.error("The workflow status could not be saved. Try again.");
      }
    });
  const columns = [
    {
      accessorKey: "full_name",
      header: "Contact",
      enableSorting: true,
      cell: ({ row }: { row: { original: OperationalRecord } }) => (
        <div className="min-w-0 max-w-[22rem]">
          <Link
            className="block break-words font-medium underline-offset-4 hover:underline"
            href={`/admin/${kind}/${row.original.id}`}
          >
            {row.original.full_name}
          </Link>
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {row.original.email}
          </p>
          {row.original.phone ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {row.original.phone}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Workflow",
      enableSorting: true,
      cell: ({ row }: { row: { original: OperationalRecord } }) => (
        <WorkflowBadges record={row.original} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Received",
      enableSorting: true,
      cell: ({ row }: { row: { original: OperationalRecord } }) => (
        <time
          dateTime={row.original.created_at}
          className="whitespace-nowrap text-sm text-muted-foreground"
        >
          {formatAdminDate(row.original.created_at)}
        </time>
      ),
    },
  ];
  const statusCounts = new Map<string, number>();
  searchable.forEach((record) =>
    statusCounts.set(record.status, (statusCounts.get(record.status) ?? 0) + 1),
  );
  return (
    <AdminPage>
      <AdminPageHeader
        title={config.title}
        description="A private inbox for reviewing submissions and keeping the next step clear."
        actions={
          <Button asChild>
            <Link href={`/admin/${kind}/new`}>
              <PlusIcon />
              New {config.singular}
            </Link>
          </Button>
        }
      />
      {error ? (
        <AdminTableEmptyState
          state="server-error"
          onRetry={() => router.refresh()}
        />
      ) : (
        <AdminTableShell
          data={filtered.slice(start, start + query.pageSize)}
          columns={columns}
          getRowId={(row) => row.id}
          query={{ ...query, page }}
          onQueryChange={(next) => dispatch({ type: "hydrate", state: next })}
          onRetry={() => router.refresh()}
          totalCount={filtered.length}
          hasNextPage={start + query.pageSize < filtered.length}
          searchPlaceholder="Search name, email, or phone"
          filters={[
            {
              id: "archive",
              label: "Archive states",
              options: [
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ],
            },
          ]}
          statusTabs={[
            { value: "all", label: "All workflows", count: searchable.length },
            ...config.statuses.map((status) => ({
              value: status,
              label: label(status),
              count: statusCounts.get(status) ?? 0,
            })),
          ]}
          rowActions={(record) => (
            <RowActions
              kind={kind}
              record={record}
              pending={pending}
              onArchive={archive}
              onWorkflowChange={changeWorkflow}
            />
          )}
          renderMobileCard={(record) => (
            <div className="grid min-w-0 gap-2.5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <Link
                  className="break-words font-medium underline underline-offset-4"
                  href={`/admin/${kind}/${record.id}`}
                >
                  {record.full_name}
                </Link>
                <time
                  dateTime={record.created_at}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatAdminDate(record.created_at)}
                </time>
              </div>
              <p className="break-all text-sm text-muted-foreground">
                {record.email}
              </p>
              {record.phone ? (
                <p className="text-sm text-muted-foreground">{record.phone}</p>
              ) : null}
              <WorkflowBadges record={record} />
            </div>
          )}
          defaultQuery={{ filters: { archive: ["active"] } }}
          preserveAllFilterSelection
        />
      )}
      <p role="status" className="sr-only">
        {pending ? "Saving changes" : ""}
      </p>
    </AdminPage>
  );
}
