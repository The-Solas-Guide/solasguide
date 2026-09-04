"use client";

import * as React from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldTitle } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ArchiveState, OperationalWorkflow, PublicLifecycle, TaxonomyLifecycle } from "@/lib/admin/types";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export type AdminFormStatus = PublicLifecycle | TaxonomyLifecycle | OperationalWorkflow | ArchiveState;

export type AdminFormValidationErrors = Record<string, string | readonly string[]>;

export type AdminProtectedField = {
  label: string;
  value: string;
  description?: string;
};

type AdminFormLayoutProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  status?: React.ReactNode;
  statusKind?: AdminFormStatus;
  protectedFields?: readonly AdminProtectedField[];
  validationErrors?: AdminFormValidationErrors;
  error?: React.ReactNode;
  pending?: boolean;
  saved?: boolean;
  isDirty?: boolean;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
  saveLabel?: string;
  children?: React.ReactNode;
};

export type AdminFormFieldProps = {
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string | readonly string[];
  children?: React.ReactElement<AdminFormControlProps>;
};

type AdminFormControlProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

function AdminFormSection({ title, description, children }: { title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return <section className="rounded-md border bg-card p-4 md:p-6"><div className="mb-5 border-b pb-4"><h2 className="text-base font-semibold">{title}</h2>{description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}</div><FieldGroup>{children}</FieldGroup></section>;
}

function ProtectedFields({ fields }: { fields: readonly AdminProtectedField[] }) {
  if (!fields.length) return null;
  return <AdminFormSection title="Protected fields" description="These system values cannot be edited."><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <Field key={field.label}><FieldTitle>{field.label}</FieldTitle><Input aria-label={field.label} value={field.value} readOnly aria-readonly="true" className="bg-muted/40" />{field.description && <FieldDescription>{field.description}</FieldDescription>}</Field>)}</div></AdminFormSection>;
}

function validationMessage(value: string | readonly string[]) {
  return Array.isArray(value) ? value.map(String).join(" ") : value;
}

const AdminFormValidationContext = React.createContext<AdminFormValidationErrors>({});

function AdminFormField({ name, label, description, error, children }: AdminFormFieldProps) {
  const validationErrors = React.useContext(AdminFormValidationContext);
  const fieldError = error ?? validationErrors[name];
  const message = fieldError === undefined ? undefined : validationMessage(fieldError);
  if (!children) return null;
  const inputId = children.props.id ?? name;
  const describedBy = message
    ? [children.props["aria-describedby"], `${name}-error`].filter(Boolean).join(" ")
    : children.props["aria-describedby"];
  const control = React.cloneElement(children, {
    id: inputId,
    name: children.props.name ?? name,
    "aria-invalid": message ? true : children.props["aria-invalid"],
    "aria-describedby": describedBy || undefined,
  });

  return <Field data-invalid={message ? "true" : undefined}><FieldTitle><Label htmlFor={inputId}>{label}</Label></FieldTitle>{control}{description && <FieldDescription>{description}</FieldDescription>}{message && <FieldError id={`${name}-error`} data-field-error={name}>{message}</FieldError>}</Field>;
}

function AdminFormLayout({
  title,
  description,
  status,
  statusKind,
  protectedFields = [],
  validationErrors = {},
  error,
  pending = false,
  saved = false,
  isDirty = false,
  onSubmit,
  onCancel,
  saveLabel = "Save",
  children,
}: AdminFormLayoutProps) {
  const { guardNavigation } = useUnsavedChanges(isDirty);

  React.useEffect(() => {
    if (saved) toast.success("Saved");
  }, [saved]);

  React.useEffect(() => {
    if (error) toast.error("The record could not be saved.");
  }, [error]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    onSubmit?.(event);
  };

  return <Form data-state={pending ? "saving" : saved ? "saved" : error ? "server-error" : "idle"} data-dirty={isDirty ? "true" : "false"} onSubmit={handleSubmit} className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6">
    <header className="flex min-w-0 flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h1 className="break-words font-display text-4xl leading-tight">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>{status && <div className="shrink-0 rounded-full border px-3 py-1 text-sm" data-lifecycle={statusKind}>{status}</div>}</header>
    {statusKind === "published" && <Alert><AlertTitle>Published record</AlertTitle><AlertDescription>Saving changes to a published record updates the public site.</AlertDescription></Alert>}
    {error && <Alert variant="destructive"><AlertTitle>Could not save changes</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
    {Object.keys(validationErrors).length > 0 && <div className="sr-only" role="status" aria-live="polite">There are validation errors. Correct the highlighted fields.</div>}
    <AdminFormValidationContext.Provider value={validationErrors}>{children}</AdminFormValidationContext.Provider>
    <ProtectedFields fields={protectedFields} />
    {Object.entries(validationErrors).map(([name, message]) => <FieldError key={name} id={`${name}-summary-error`} data-field-error={name}>{validationMessage(message)}</FieldError>)}
    <footer className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"><Button type="submit" disabled={pending}>{pending ? "Saving…" : saved ? "Saved" : saveLabel}</Button>{onCancel && <Button type="button" variant="outline" onClick={() => { if (guardNavigation()) onCancel(); }} disabled={pending}>Cancel</Button>}</footer>
  </Form>;
}

export { AdminFormField, AdminFormLayout, AdminFormSection, ProtectedFields };
