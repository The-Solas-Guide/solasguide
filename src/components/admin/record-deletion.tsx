"use client";

import { useId, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { RelationshipBlocker } from "@/lib/admin/types";

function AdminRelationshipSummary({ relationships }: { relationships: readonly RelationshipBlocker[] }) {
  if (!relationships.length) return null;
  return <section aria-label="Blocking relationships" className="rounded-md border border-destructive/30 bg-destructive/5 p-4"><h3 className="font-semibold">Blocking relationships</h3><ul className="mt-3 grid gap-3">{relationships.map((relationship) => <li key={`${relationship.href}-${relationship.name}`} className="grid gap-1 text-sm"><a className="font-medium underline underline-offset-4" href={relationship.href}>{relationship.name}</a><span className="text-muted-foreground">{relationship.reason}</span></li>)}</ul></section>;
}

function AdminArchiveDialog({ recordName, onArchive, disabled = false }: { recordName: string; onArchive: () => void; disabled?: boolean }) {
  const triggerId = useId();
  return <AlertDialog onOpenChange={(open) => { if (!open) document.getElementById(triggerId)?.focus(); }}><AlertDialogTrigger asChild><Button id={triggerId} type="button" variant="outline" disabled={disabled}>Archive</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive {recordName}?</AlertDialogTitle><AlertDialogDescription>Archiving keeps this record and removes it from active views. You can restore it later.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onArchive}>Confirm archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
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
  if (isSubmission) return null;
  const blocked = relationships.length > 0;
  const canDelete = !blocked && confirmation === recordName;

  return <AlertDialog onOpenChange={(open) => { if (!open) setConfirmation(""); }}><AlertDialogTrigger asChild><Button type="button" variant="outline" disabled={disabled}>Permanent Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Permanent Delete {recordName}?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Archive the record when you only need to remove it from active views.</AlertDialogDescription></AlertDialogHeader>{blocked ? <><p className="text-sm font-semibold text-destructive">Permanent delete is blocked.</p><AdminRelationshipSummary relationships={relationships} /></> : <label className="grid gap-2 text-sm font-medium" htmlFor="permanent-delete-confirmation">Type {recordName} to confirm<input id="permanent-delete-confirmation" aria-label={`Type ${recordName} to confirm`} value={confirmation} onChange={(event) => setConfirmation(event.currentTarget.value)} className="h-11 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40" autoComplete="off" /></label>}<AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>{!blocked && <AlertDialogAction disabled={!canDelete} onClick={onDelete}>Confirm permanent delete</AlertDialogAction>}</AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export { AdminRelationshipSummary, AdminArchiveDialog, AdminPermanentDeleteDialog };
