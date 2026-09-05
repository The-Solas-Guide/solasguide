"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminBackLink } from "@/components/admin/admin-page";
import { AdminFormField, AdminFormLayout, AdminFormSection } from "@/components/admin/admin-form";
import { OperationalLifecycleControls } from "@/components/admin/lifecycle-controls";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { operationalConfig, type OperationalKind, type OperationalRecord } from "@/lib/admin/operational-cms";
import { saveOperationalRecord, setOperationalArchive } from "@/lib/admin/operational-actions";
import type { OperationalWorkflow } from "@/lib/admin/types";
import { customerQuestionnaireQuestions, customerQuestionnaireLabel, type CustomerQuestionKey } from "@/lib/enquiries/customer-questionnaire";
import type { Json } from "@/types/database";

function fieldLabel(key: string) { return key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, (value) => value.toUpperCase()); }

function AnswerValue({ value, customer = false }: { value: Json | undefined; customer?: boolean }) {
  if (value === null || value === undefined || value === "") return <span>—</span>;
  if (Array.isArray(value)) return <ul className="grid gap-2 border-l pl-4">{value.map((item, index) => <li key={index}><AnswerValue value={item} /></li>)}</ul>;
  if (typeof value === "object") return <dl className="grid gap-4">{Object.entries(value).map(([key, item]) => <div key={key}><dt className="text-sm font-medium">{customer ? customerQuestionnaireQuestions.find((question) => question.key === key)?.title ?? fieldLabel(key) : fieldLabel(key)}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground"><AnswerValue value={customer && ["q1", "q2", "q3", "q4"].includes(key) ? Array.isArray(item) ? item.map((answer) => typeof answer === "string" ? customerQuestionnaireLabel(key as CustomerQuestionKey, answer) : answer) : typeof item === "string" ? customerQuestionnaireLabel(key as CustomerQuestionKey, item) : item : item} /></dd></div>)}</dl>;
  return <span>{typeof value === "boolean" ? value ? "Yes" : "No" : String(value)}</span>;
}

export function OperationalEditor({ kind, record }: { kind: OperationalKind; record: OperationalRecord | null }) {
  const config = operationalConfig(kind);
  const router = useRouter();
  const [status, setStatus] = useState<OperationalWorkflow>((record?.status ?? "new") as OperationalWorkflow);
  const [archivedAt, setArchivedAt] = useState(record?.archived_at ?? null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const markDirty = () => { setDirty(true); setSaved(false); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("status", status);
    if (!record) {
      const context = String(data.get("submission_context") ?? "").trim();
      data.set("questionnaire_answers", JSON.stringify(context ? { manual_context: context } : {}));
      const consentDate = String(data.get("consent_given_at") ?? "");
      if (consentDate && Number.isFinite(new Date(consentDate).getTime())) data.set("consent_given_at", new Date(consentDate).toISOString());
    }
    startTransition(async () => {
      setError(undefined); setFieldErrors({}); setSaved(false);
      try {
        const result = await saveOperationalRecord(kind, data);
        if (!result.ok) { setError(result.error); setFieldErrors(result.fieldErrors ?? {}); return; }
        setSaved(true);
        if (!record && result.data?.id) {
          // Let navigation unmount the dirty form. Clearing it first makes the
          // shared history guard go back while replace is still in flight.
          router.replace(`/admin/${kind}/${result.data.id}`);
        } else {
          setDirty(false);
          router.refresh();
        }
      } catch { setError("The record could not be saved. Try again."); }
    });
  };
  const archive = (value: boolean) => {
    if (dirty) { toast.warning("Save or cancel your changes before archiving or restoring this record."); return; }
    if (!record) return;
    startTransition(async () => {
      try {
        const result = await setOperationalArchive(kind, record.id, value);
        if (!result.ok) { toast.error(result.error ?? "The archive state could not be saved."); return; }
        setArchivedAt(value ? new Date().toISOString() : null);
        toast.success(value ? "Record archived" : "Record restored");
        router.refresh();
      } catch { toast.error("The archive state could not be saved. Try again."); }
    });
  };
  const protectedKeys = ["id", "submission_token", "consent_confirmed", "consent_given_at", "source", "created_at", "updated_at", "customer_confirmation_sent_at", "internal_notification_sent_at", "customer_confirmation_status", "internal_notification_status"];
  const protectedFields = record ? protectedKeys.filter((key) => key in record).map((key) => ({ label: fieldLabel(key), value: String(record[key as keyof OperationalRecord] ?? "—"), description: record.source === "admin" && (key.startsWith("customer_confirmation") || key.startsWith("internal_notification")) ? "Messages are disabled for manually created records." : undefined })) : [];
  const contactFields = ["full_name", "email", "phone", "contact_preference", ...(kind === "practitioner-interest" ? ["practice_name", "location", "website_url"] : [])];
  return <div className="min-w-0"><div className="mx-auto mb-5 max-w-4xl"><AdminBackLink href={`/admin/${kind}`}>Back to {config.title.toLowerCase()}</AdminBackLink></div><AdminFormLayout title={record ? record.full_name : `New ${config.singular}`} description="Private operational record. Contact details and submitted answers become read-only after creation." status={archivedAt ? "Archived · Private" : "Private"} statusKind={archivedAt ? "archived" : "active"} protectedFields={protectedFields} pending={pending} saved={saved} error={error} validationErrors={fieldErrors} isDirty={dirty} onSubmit={submit} onCancel={() => router.push(`/admin/${kind}`)} saveLabel={record ? "Save changes" : "Create record"}>
    {record && <input type="hidden" name="id" value={record.id} />}
    <fieldset disabled={pending} className="contents"><AdminFormSection title="Contact details">{record ? <dl className="grid min-w-0 gap-4 sm:grid-cols-2">{contactFields.map((key) => <div key={key} className="min-w-0"><dt className="text-sm font-medium">{fieldLabel(key)}</dt><dd className="mt-1 break-words text-sm text-muted-foreground">{String((record as unknown as Record<string, unknown>)[key] ?? "—")}</dd></div>)}</dl> : <div className="grid gap-4 sm:grid-cols-2" onChange={markDirty}><AdminFormField name="full_name" label="Full name"><Input required maxLength={200} autoComplete="name" /></AdminFormField><AdminFormField name="email" label="Email"><Input type="email" required maxLength={320} autoComplete="email" /></AdminFormField><AdminFormField name="phone" label="Phone"><Input type="tel" maxLength={50} autoComplete="tel" /></AdminFormField><AdminFormField name="contact_preference" label="Contact preference" description="Phone and WhatsApp require a phone number."><select defaultValue="email" className="h-11 rounded-md border border-input bg-background px-3 text-sm"><option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option></select></AdminFormField>{kind === "practitioner-interest" && <><AdminFormField name="practice_name" label="Practice name"><Input maxLength={200} /></AdminFormField><AdminFormField name="location" label="Location"><Input maxLength={200} /></AdminFormField><AdminFormField name="website_url" label="Website"><Input type="url" maxLength={2048} /></AdminFormField></>}</div>}</AdminFormSection>
    <AdminFormSection title="Submitted answers" description={record ? "Original submission details are read-only." : "Record the context provided by the person."}>{record ? <div className="min-w-0 break-words">{Object.keys(record.questionnaire_answers ?? {}).length ? <AnswerValue value={record.questionnaire_answers} customer={kind === "customer-enquiries"} /> : <p className="text-sm text-muted-foreground">No answers recorded.</p>}</div> : <AdminFormField name="submission_context" label="Submitted context"><Textarea rows={5} maxLength={12000} onChange={markDirty} /></AdminFormField>}</AdminFormSection>
    {!record && <AdminFormSection title="Consent" description="Record consent already given by this person. Creating a record does not send messages."><AdminFormField name="consent_given_at" label="Consent given at" description="Use the date and time when consent was received, in your local time."><Input type="datetime-local" required onChange={markDirty} /></AdminFormField><AdminFormField name="consent_confirmed" label="Consent confirmed"><input type="checkbox" value="on" required className="size-5 accent-primary" onChange={markDirty} /></AdminFormField><p className="text-sm text-muted-foreground">Confirm that this person agreed to storage and contact about their enquiry or application.</p></AdminFormSection>}
    <AdminFormSection title="Internal workflow">{record ? <OperationalLifecycleControls value={status} onChange={(next) => { setStatus(next); markDirty(); }} statuses={config.statuses as readonly OperationalWorkflow[]} archiveState={archivedAt ? "archived" : "active"} onArchive={() => archive(true)} onRestore={() => archive(false)} isSubmission recordName={record.full_name} disabled={pending} /> : <AdminFormField name="status" label="Workflow status"><select value={status} onChange={(event) => { setStatus(event.target.value as OperationalWorkflow); markDirty(); }} className="h-11 rounded-md border border-input bg-background px-3 text-sm">{config.statuses.map((value) => <option key={value} value={value}>{fieldLabel(value)}</option>)}</select></AdminFormField>}<AdminFormField name="internal_notes" label="Internal notes" description="Only authorised administrators can read these notes."><Textarea defaultValue={record?.internal_notes ?? ""} rows={6} maxLength={20000} onChange={markDirty} /></AdminFormField></AdminFormSection></fieldset>
  </AdminFormLayout></div>;
}
