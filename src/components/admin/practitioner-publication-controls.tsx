"use client";

import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { AdminArchiveDialog } from "@/components/admin/record-deletion";
import { AdminPanel } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import type { PublicLifecycle } from "@/lib/admin/types";

export type PractitionerPublicationRequirement = {
  id: string;
  label: string;
  complete: boolean;
};

type Props = {
  status: PublicLifecycle;
  requirements: readonly PractitionerPublicationRequirement[];
  dirty: boolean;
  pending: boolean;
  recordName: string;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
};

function statusLabel(status: PublicLifecycle) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function PractitionerPublicationControls({
  status,
  requirements,
  dirty,
  pending,
  recordName,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
}: Props) {
  const missing = requirements.filter((requirement) => !requirement.complete);
  const ready = missing.length === 0;

  return (
    <AdminPanel
      title="Public lifecycle"
      description="Control when this practitioner appears in the public directory."
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div>
            <p className="text-sm font-medium">Current status</p>
            <p className="text-sm text-muted-foreground">{statusLabel(status)}</p>
          </div>
          {status === "archived" ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRestore}
              disabled={pending}
            >
              Restore to draft
            </Button>
          ) : status === "published" ? (
            <Button
              type="button"
              variant="outline"
              onClick={onUnpublish}
              disabled={pending || dirty}
            >
              Unpublish
            </Button>
          ) : null}
        </div>

        {status === "draft" && (
          <div className="grid gap-3">
            <div>
              <p className="text-sm font-medium">Before publishing</p>
              <p className="text-sm text-muted-foreground">
                Save a complete draft before making it public.
              </p>
            </div>
            <ul className="grid gap-2 text-sm" aria-label="Publication requirements">
              {requirements.map((requirement) => (
                <li key={requirement.id} className="flex items-start gap-2">
                  {requirement.complete ? (
                    <CheckIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-700"
                    />
                  ) : (
                    <CircleAlertIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-amber-700"
                    />
                  )}
                  <span className={requirement.complete ? "" : "text-muted-foreground"}>
                    {requirement.label}
                  </span>
                </li>
              ))}
            </ul>
            {dirty && (
              <p className="text-sm text-muted-foreground" role="status">
                Save changes before publishing.
              </p>
            )}
            {!ready && !dirty && (
              <p className="text-sm text-muted-foreground" role="status">
                Complete the missing requirements before publishing.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={onPublish}
                disabled={pending || dirty || !ready}
              >
                Publish
              </Button>
              <AdminArchiveDialog
                recordName={recordName}
                onArchive={onArchive}
                disabled={pending}
              />
            </div>
          </div>
        )}

        {status === "published" && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Saving changes updates the public profile.
            </p>
            <AdminArchiveDialog
              recordName={recordName}
              onArchive={onArchive}
              disabled={pending}
            />
          </div>
        )}

        {status === "archived" && (
          <p className="text-sm text-muted-foreground">
            Restore this record to draft before publishing it again.
          </p>
        )}
      </div>
    </AdminPanel>
  );
}
