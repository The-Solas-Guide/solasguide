"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminArchiveDialog } from "@/components/admin/record-deletion";
import type { ArchiveState, OperationalWorkflow, PublicLifecycle, TaxonomyLifecycle } from "@/lib/admin/types";

function ControlGroup({
  children,
  label,
  recordKind,
}: {
  children: React.ReactNode;
  label: string;
  recordKind?: string;
}) {
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      aria-label={label}
      data-record-kind={recordKind}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">{children}</div>
    </section>
  );
}

type PublicLifecycleControlsProps = {
  value: PublicLifecycle;
  onChange: (value: PublicLifecycle) => void;
  disabled?: boolean;
  onArchive?: () => void;
  recordName?: string;
};

function PublicLifecycleControls({
  value,
  onChange,
  disabled = false,
  onArchive,
  recordName = "this record",
}: PublicLifecycleControlsProps) {
  const archive = () => (onArchive ? onArchive() : onChange("archived"));
  return (
    <ControlGroup label="Public lifecycle">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">Public lifecycle</span>
        <span className="text-sm text-muted-foreground">
          Publishing controls public visibility.
        </span>
      </div>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next === "draft" || next === "published") onChange(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Public status" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {value === "archived" && (
            <SelectItem value="archived" disabled>
              Archived
            </SelectItem>
          )}
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <Button
          type="button"
          onClick={() =>
            onChange(value === "archived" ? "draft" : value === "published" ? "draft" : "published")
          }
          disabled={disabled}
        >
          {value === "archived" ? "Restore" : value === "published" ? "Unpublish" : "Publish"}
        </Button>
        {value !== "archived" && (
          <AdminArchiveDialog recordName={recordName} onArchive={archive} disabled={disabled} />
        )}
      </div>
      {value === "draft" && (
        <p className="w-full text-sm text-muted-foreground">
          Publishing makes this record visible on the public site.
        </p>
      )}
      {value === "published" && (
        <p className="w-full text-sm text-muted-foreground">Saving changes updates the public site.</p>
      )}
    </ControlGroup>
  );
}

type TaxonomyLifecycleControlsProps = {
  value: TaxonomyLifecycle;
  onChange: (value: TaxonomyLifecycle) => void;
  disabled?: boolean;
  onArchive?: () => void;
  recordName?: string;
};

function TaxonomyLifecycleControls({
  value,
  onChange,
  disabled = false,
  onArchive,
  recordName = "this record",
}: TaxonomyLifecycleControlsProps) {
  const archive = () => (onArchive ? onArchive() : onChange("archived"));
  return (
    <ControlGroup label="Taxonomy lifecycle">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">Taxonomy lifecycle</span>
        <span className="text-sm text-muted-foreground">
          Activation controls where a value can be used.
        </span>
      </div>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next === "active" || next === "inactive") onChange(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Taxonomy status" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {value === "archived" && (
            <SelectItem value="archived" disabled>
              Archived
            </SelectItem>
          )}
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <Button
          type="button"
          onClick={() =>
            onChange(value === "archived" ? "inactive" : value === "active" ? "inactive" : "active")
          }
          disabled={disabled}
        >
          {value === "archived" ? "Restore" : value === "active" ? "Mark inactive" : "Activate"}
        </Button>
        {value !== "archived" && (
          <AdminArchiveDialog recordName={recordName} onArchive={archive} disabled={disabled} />
        )}
      </div>
    </ControlGroup>
  );
}

type OperationalLifecycleControlsProps<T extends OperationalWorkflow> = {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  isSubmission?: boolean;
  onArchive: () => void;
  onRestore: () => void;
  archiveState: ArchiveState;
  statuses: readonly T[];
  recordName?: string;
};

function formatWorkflow(value: string) {
  return value.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function OperationalLifecycleControls<T extends OperationalWorkflow>({
  value,
  onChange,
  disabled = false,
  onArchive,
  onRestore,
  archiveState,
  statuses,
  isSubmission = false,
  recordName = "this record",
}: OperationalLifecycleControlsProps<T>) {
  return (
    <ControlGroup label="Operational workflow" recordKind={isSubmission ? "submission" : "operational-record"}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">Operational workflow</span>
        <span className="text-sm text-muted-foreground">
          Private workflow status stays separate from archive state.
        </span>
      </div>
      <Select value={value} onValueChange={(next) => onChange(next as T)} disabled={disabled}>
        <SelectTrigger aria-label="Workflow status" className="w-full sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {formatWorkflow(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {archiveState === "archived" ? (
          <Button type="button" variant="outline" onClick={onRestore} disabled={disabled}>
            Restore
          </Button>
        ) : (
          <AdminArchiveDialog recordName={recordName} onArchive={onArchive} disabled={disabled} />
        )}
      </div>
    </ControlGroup>
  );
}

export { PublicLifecycleControls, TaxonomyLifecycleControls, OperationalLifecycleControls };
