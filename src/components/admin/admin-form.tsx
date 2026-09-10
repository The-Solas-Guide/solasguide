"use client";

import * as React from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminStatus } from "@/components/admin/admin-page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ArchiveState,
  OperationalWorkflow,
  PublicLifecycle,
  TaxonomyLifecycle,
} from "@/lib/admin/types";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export type AdminFormStatus =
  PublicLifecycle | TaxonomyLifecycle | OperationalWorkflow | ArchiveState;

export type AdminFormValidationErrors = Record<
  string,
  string | readonly string[]
>;

const validationFieldAliases: Record<string, readonly string[]> = {
  image: ["portrait", "image"],
  portrait: ["portrait", "image"],
  questionnaire_answers: ["submission_context", "questionnaire_answers"],
  location: [
    "location",
    "taxonomy-location",
    "practice-areas-location",
    "taxonomy-location-group",
  ],
};

const validationFieldLabels: Record<string, string> = {
  image: "Portrait",
  portrait: "Portrait",
  questionnaire_answers: "Submitted context",
  location: "Location",
  imageAlt: "Portrait alt text",
  imageFocalX: "Horizontal position",
  imageFocalY: "Vertical position",
  sortOrder: "Sort order",
};

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
  notifyOnError?: boolean;
  pending?: boolean;
  saved?: boolean;
  successMessage?: string;
  savedLabel?: string;
  isDirty?: boolean;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
  saveLabel?: string;
  /** Optional wider canvas for editors with a primary column and sidebar. */
  width?: "default" | "wide";
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

function AdminFormSection({
  title,
  description,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`grid gap-5 rounded-lg border border-border bg-card p-5 ${className ?? ""}`}
    >
      <div className="max-w-2xl">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <FieldGroup>{children}</FieldGroup>
    </section>
  );
}

function ProtectedFields({
  fields,
}: {
  fields: readonly AdminProtectedField[];
}) {
  if (!fields.length) return null;
  return (
    <details className="rounded-lg border bg-card px-5 py-4">
      <summary className="cursor-pointer text-sm font-medium">Protected fields</summary>
      <p className="mt-2 text-xs text-muted-foreground">These system values cannot be edited.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <Field key={field.label}>
            <FieldTitle>{field.label}</FieldTitle>
            <Input
              aria-label={field.label}
              value={field.value}
              readOnly
              aria-readonly="true"
              className="bg-muted/40"
            />
            {field.description ? (
              <FieldDescription>{field.description}</FieldDescription>
            ) : null}
          </Field>
        ))}
      </div>
    </details>
  );
}

function validationMessage(value: string | readonly string[]): string {
  return Array.isArray(value) ? value.map(String).join(" ") : String(value);
}

function validationFieldCandidates(name: string) {
  return validationFieldAliases[name] ?? [name];
}

function validationFieldTargetId(name: string) {
  return validationFieldCandidates(name)[0] ?? name;
}

function validationFieldLabel(name: string) {
  if (validationFieldLabels[name]) return validationFieldLabels[name];
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeAttributeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isHTMLElement(value: Element | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

function isHiddenControl(value: HTMLElement) {
  return value.matches('input[type="hidden"], [hidden], [aria-hidden="true"]');
}

function findValidationTarget(name: string) {
  for (const candidate of validationFieldCandidates(name)) {
    const byId = document.getElementById(candidate);
    if (isHTMLElement(byId) && !isHiddenControl(byId)) return byId;

    const escapedCandidate = escapeAttributeValue(candidate);
    const byDataTarget = document.querySelector(
      `[data-field-target="${escapedCandidate}"]`,
    );
    if (isHTMLElement(byDataTarget) && !isHiddenControl(byDataTarget)) {
      return byDataTarget;
    }

    const byFieldName = document.querySelector(
      `[data-admin-form-field="${escapedCandidate}"]`,
    );
    if (isHTMLElement(byFieldName) && !isHiddenControl(byFieldName)) {
      return byFieldName;
    }

    const byName = document.querySelector(`[name="${escapedCandidate}"]`);
    if (isHTMLElement(byName) && !isHiddenControl(byName)) return byName;
  }

  return null;
}

function firstFocusableDescendant(element: HTMLElement) {
  return element.querySelector<HTMLElement>(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
  );
}

function focusValidationField(name: string) {
  const target = findValidationTarget(name);
  if (!target) return false;

  const details = target.matches("details")
    ? (target as HTMLDetailsElement)
    : (target.closest("details") as HTMLDetailsElement | null);
  if (details) details.open = true;

  const focusTarget = target.matches("details")
    ? details?.querySelector<HTMLElement>("summary") ??
      firstFocusableDescendant(target) ??
      target
    : target.matches("input, select, textarea, button, a, summary, [tabindex]")
      ? target
      : firstFocusableDescendant(target) ?? target;

  focusTarget.classList.add("scroll-mt-24");
  focusTarget.focus({ preventScroll: true });
  focusTarget.scrollIntoView?.({ behavior: "auto", block: "start" });
  return true;
}

function validationErrorForField(
  name: string,
  validationErrors: AdminFormValidationErrors,
) {
  if (validationErrors[name] !== undefined) return validationErrors[name];
  return Object.entries(validationErrors).find(([key]) =>
    validationFieldCandidates(key).includes(name),
  )?.[1];
}

const AdminFormValidationContext =
  React.createContext<AdminFormValidationErrors>({});

function AdminFormField({
  name,
  label,
  description,
  error,
  children,
}: AdminFormFieldProps) {
  const validationErrors = React.useContext(AdminFormValidationContext);
  const fieldError = error ?? validationErrorForField(name, validationErrors);
  const message =
    fieldError === undefined ? undefined : validationMessage(fieldError);
  if (!children) return null;
  const inputId = children.props.id ?? name;
  const describedBy = message
    ? [children.props["aria-describedby"], `${name}-error`]
        .filter(Boolean)
        .join(" ")
    : children.props["aria-describedby"];
  const control = React.cloneElement(children, {
    id: inputId,
    name: children.props.name ?? name,
    "aria-invalid": message ? true : children.props["aria-invalid"],
    "aria-describedby": describedBy || undefined,
    className: [children.props.className, "scroll-mt-24"]
      .filter(Boolean)
      .join(" "),
  });

  return (
    <Field
      data-admin-form-field={name}
      data-invalid={message ? "true" : undefined}
    >
      <FieldTitle>
        <Label htmlFor={inputId}>{label}</Label>
      </FieldTitle>
      {control}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? (
        <FieldError id={`${name}-error`} data-field-error={name}>
          {message}
        </FieldError>
      ) : null}
    </Field>
  );
}

function AdminFormLayout({
  title,
  description,
  status,
  statusKind,
  protectedFields = [],
  validationErrors = {},
  error,
  notifyOnError = true,
  pending = false,
  saved = false,
  successMessage = "Saved",
  savedLabel = "Saved",
  isDirty = false,
  onSubmit,
  onCancel,
  saveLabel = "Save",
  width = "default",
  children,
}: AdminFormLayoutProps) {
  const { guardNavigation } = useUnsavedChanges(isDirty);
  const savedStatusMessage =
    successMessage === "Saved" ? "Changes saved" : successMessage;
  const validationEntries = Object.entries(validationErrors).filter(
    ([, value]) => validationMessage(value).trim().length > 0,
  );
  const validationSignature = validationEntries
    .map(([name, message]) => `${name}:${validationMessage(message)}`)
    .join("\u0000");
  const validationEntriesRef = React.useRef(validationEntries);

  React.useEffect(() => {
    validationEntriesRef.current = validationEntries;
  }, [validationEntries]);

  React.useEffect(() => {
    if (saved) toast.success(successMessage);
  }, [saved, successMessage]);

  React.useEffect(() => {
    if (
      error &&
      notifyOnError &&
      validationSignature.length === 0
    ) {
      toast.error("The record could not be saved.");
    }
  }, [error, notifyOnError, validationSignature]);

  React.useEffect(() => {
    const names = validationEntriesRef.current.map(([name]) => name);
    if (!names.length) return;

    focusValidationField(names[0]);
  }, [validationSignature]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    onSubmit?.(event);
  };

  return (
    <Form
      data-state={
        pending ? "saving" : saved ? "saved" : error ? "server-error" : "idle"
      }
      data-dirty={isDirty ? "true" : "false"}
      onSubmit={handleSubmit}
      className={`mx-auto flex w-full min-w-0 flex-col gap-5 pb-4 ${width === "wide" ? "max-w-6xl" : "max-w-4xl"}`}
    >
      <AdminPageHeader
        title={title}
        description={description}
        aside={
          status ? (
            <AdminStatus
              value={statusKind ?? "draft"}
              label={status}
            />
          ) : null
        }
      />
      {statusKind === "published" ? (
        <Alert>
          <AlertTitle>Published record</AlertTitle>
          <AlertDescription>
            Saving changes to a published record updates the public site.
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save changes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {validationEntries.length > 0 ? (
        <>
          <div className="sr-only" role="status" aria-live="polite">
            There are validation errors. Correct the highlighted fields.
          </div>
          <div
            id="admin-form-validation-summary"
            className="grid gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
            role="region"
            aria-labelledby="admin-form-validation-summary-title"
          >
            <p
              id="admin-form-validation-summary-title"
              className="font-medium text-destructive"
            >
              Review these fields before saving
            </p>
            <ul className="grid gap-1 text-destructive">
              {validationEntries.map(([name, message]) => (
                <li key={name}>
                  <a
                    href={`#${validationFieldTargetId(name)}`}
                    className="underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(event) => {
                      event.preventDefault();
                      focusValidationField(name);
                    }}
                  >
                    {validationFieldLabel(name)}: {" "}
                    <span>{validationMessage(message)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <AdminFormValidationContext.Provider value={validationErrors}>
        {children}
      </AdminFormValidationContext.Provider>
      <ProtectedFields fields={protectedFields} />
      <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 rounded-lg border bg-card/95 px-4 py-3 shadow-sm backdrop-blur">
        <span className="mr-auto text-xs text-muted-foreground" aria-live="polite">
          {pending
            ? "Saving changes…"
            : isDirty
              ? "Unsaved changes"
              : saved
                ? savedStatusMessage
                : "No unsaved changes"}
        </span>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (guardNavigation()) onCancel();
            }}
            disabled={pending}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : saved ? savedLabel : saveLabel}
        </Button>
      </footer>
    </Form>
  );
}

export { AdminFormField, AdminFormLayout, AdminFormSection, ProtectedFields };
