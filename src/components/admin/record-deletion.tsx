"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { RelationshipBlocker } from "@/lib/admin/types";

function AdminRelationshipSummary({ relationships }: { relationships: readonly RelationshipBlocker[] }) {
  if (!relationships.length) return null;
  return <section aria-label="Blocking relationships" className="rounded-md border border-destructive/30 bg-destructive/5 p-4"><h3 className="font-semibold">Blocking relationships</h3><ul className="mt-3 grid gap-3">{relationships.map((relationship) => <li key={`${relationship.type}-${relationship.href}-${relationship.name}`} className="grid gap-1 text-sm"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{relationship.type}</span><a className="font-medium underline underline-offset-4" href={relationship.href}>{relationship.name}</a><span className="text-muted-foreground">{relationship.reason}</span></li>)}</ul></section>;
}

function AdminArchiveDialog({ recordName, onArchive, disabled = false }: { recordName: string; onArchive: () => void; disabled?: boolean }) {
  const triggerId = useId();
  const [open, setOpen] = useState(false);
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) document.getElementById(triggerId)?.focus();
  };

  return <AlertDialog open={open} onOpenChange={handleOpenChange}><AlertDialogTrigger asChild><Button id={triggerId} type="button" variant="outline" disabled={disabled} onKeyDown={handleTriggerKeyDown}>Archive</Button></AlertDialogTrigger><AlertDialogContent onCloseAutoFocus={(event) => { event.preventDefault(); document.getElementById(triggerId)?.focus(); }}><AlertDialogHeader><AlertDialogTitle>Archive {recordName}?</AlertDialogTitle><AlertDialogDescription>Archiving keeps this record and removes it from active views. You can restore it later.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onArchive}>Confirm archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

type AdminPermanentDeleteDialogProps = {
  recordName: string;
  relationships?: readonly RelationshipBlocker[];
  isSubmission?: boolean;
  onDelete: () => void;
  disabled?: boolean;
};

function AdminPermanentDeleteDialog({ recordName, relationships = [], isSubmission = false, onDelete, disabled = false }: AdminPermanentDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  const confirmationId = useId();
  if (isSubmission) return null;
  const blocked = relationships.length > 0;
  const canDelete = !blocked && confirmation === recordName;
  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmation("");
      document.getElementById(triggerId)?.focus();
    }
  };

  return <AlertDialog open={open} onOpenChange={handleOpenChange}><AlertDialogTrigger asChild><Button id={triggerId} type="button" variant="outline" disabled={disabled} onKeyDown={handleTriggerKeyDown}>Permanent Delete</Button></AlertDialogTrigger><AlertDialogContent onCloseAutoFocus={(event) => { event.preventDefault(); document.getElementById(triggerId)?.focus(); }}><AlertDialogHeader><AlertDialogTitle>Permanent Delete {recordName}?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Archive the record when you only need to remove it from active views.</AlertDialogDescription></AlertDialogHeader>{blocked ? <><p className="text-sm font-semibold text-destructive">Permanent delete is blocked.</p><AdminRelationshipSummary relationships={relationships} /></> : <label className="grid gap-2 text-sm font-medium" htmlFor={confirmationId}>Type {recordName} to confirm<input id={confirmationId} aria-label={`Type ${recordName} to confirm`} value={confirmation} onChange={(event) => setConfirmation(event.currentTarget.value)} className="h-11 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40" autoComplete="off" /></label>}<AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>{!blocked && <AlertDialogAction disabled={!canDelete} onClick={onDelete}>Confirm permanent delete</AlertDialogAction>}</AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export { AdminRelationshipSummary, AdminArchiveDialog, AdminPermanentDeleteDialog };
