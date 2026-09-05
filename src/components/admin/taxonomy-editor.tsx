"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminBackLink, AdminPanel } from "@/components/admin/admin-page";
import {
  AdminFormField,
  AdminFormLayout,
  AdminFormSection,
} from "@/components/admin/admin-form";
import { AdminPermanentDeleteDialog } from "@/components/admin/record-deletion";
import { TaxonomyLifecycleControls } from "@/components/admin/lifecycle-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatAdminDate,
  getTaxonomyLifecycle,
} from "@/lib/admin/practitioner-cms";
import {
  taxonomyTypes,
  taxonomyTypeLabel,
  taxonomyDeleteBlocker,
  type TaxonomyWithUsage,
} from "@/lib/admin/taxonomy-cms";
import {
  archiveTaxonomy,
  deleteTaxonomy,
  saveTaxonomy,
} from "@/lib/admin/taxonomy-actions";

export function TaxonomyEditor({
  record,
  isNew = false,
}: {
  record: TaxonomyWithUsage | null;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState(record?.type ?? "support_area");
  const [state, setState] = useState(
    getTaxonomyLifecycle(record ?? { is_active: true, archived_at: null }),
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };
  const guardLifecycleAction = () => {
    if (!dirty) return true;
    toast.warning(
      "Save or cancel your changes before archiving or restoring this taxonomy term.",
    );
    return false;
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("state", state);
    form.set("type", type);
    startTransition(async () => {
      setError(undefined);
      setFieldErrors({});
      setSaved(false);
      const result = await saveTaxonomy(form);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setDirty(false);
      setSaved(true);
      if (isNew && result.data?.id)
        router.replace(`/admin/taxonomy/${result.data.id}`);
      else router.refresh();
    });
  };
  const updateState = (next: typeof state) => {
    if (next !== "active" && next !== "inactive" && next !== "archived") return;
    setState(next);
    markDirty();
  };
  const lifecycle = (restore = false) =>
    startTransition(async () => {
      if (!record || !guardLifecycleAction()) return;
      const result = await archiveTaxonomy(record.id, restore);
      if (!result.ok) {
        setError(result.error);
        toast.error(
          result.error ?? "The taxonomy lifecycle could not be saved.",
        );
      } else {
        setState(restore ? "inactive" : "archived");
        setDirty(false);
        setSaved(true);
      }
    });
  const remove = () =>
    startTransition(async () => {
      if (!record || !guardLifecycleAction()) return;
      const result = await deleteTaxonomy(record.id);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error ?? "The taxonomy term could not be deleted.");
      } else router.replace("/admin/taxonomy");
    });
  const blocker = record ? taxonomyDeleteBlocker(record) : null;
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6">
      <AdminBackLink href="/admin/taxonomy">Taxonomy</AdminBackLink>
      <AdminFormLayout
        title={
          isNew
            ? "New taxonomy term"
            : `Edit ${record?.name ?? "taxonomy term"}`
        }
        description={
          isNew
            ? "Create a shared term for practitioner records."
            : "Keep this shared term clear and consistent wherever it appears."
        }
        status={taxonomyTypeLabel(state)}
        statusKind={state}
        pending={pending}
        saved={saved}
        isDirty={dirty}
        error={error}
        validationErrors={fieldErrors}
        onSubmit={submit}
        onCancel={() => router.replace("/admin/taxonomy")}
        saveLabel={isNew ? "Create term" : "Save changes"}
      >
        <input type="hidden" name="id" value={record?.id ?? ""} />
        <AdminFormSection
          title="Term identity"
          description="The name and slug appear wherever practitioners use this term."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField name="name" label="Name" error={fieldErrors.name}>
              <Input
                name="name"
                defaultValue={record?.name ?? ""}
                required
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField
              name="slug"
              label="Slug"
              description="Leave blank to generate a slug from the name."
              error={fieldErrors.slug}
            >
              <Input
                name="slug"
                defaultValue={record?.slug ?? ""}
                onChange={markDirty}
              />
            </AdminFormField>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="type">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value);
                  markDirty();
                }}
              >
                <SelectTrigger id="type" aria-label="Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taxonomyTypes.map((taxonomyType) => (
                    <SelectItem key={taxonomyType} value={taxonomyType}>
                      {taxonomyTypeLabel(taxonomyType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </div>
            <AdminFormField name="sortOrder" label="Sort order">
              <Input
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={record?.sort_order ?? 0}
                onChange={markDirty}
              />
            </AdminFormField>
          </div>
        </AdminFormSection>
        <AdminPanel
          title="Availability"
          description="Choose whether this term can be selected on practitioner records."
        >
          <TaxonomyLifecycleControls
            value={state}
            onChange={updateState}
            onArchive={() => lifecycle(false)}
            disabled={pending}
            recordName={record?.name ?? "this term"}
          />
        </AdminPanel>
        {record && (
          <AdminPanel
            title="Record actions"
            description={`Used by ${record.usageCount} practitioner${record.usageCount === 1 ? "" : "s"}. Last updated ${formatAdminDate(record.updated_at)}.`}
          >
            {state === "archived" ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => lifecycle(true)}
                  disabled={pending}
                >
                  Restore to inactive
                </Button>
                <AdminPermanentDeleteDialog
                  recordName={record.name}
                  relationships={blocker ? [blocker] : []}
                  onDelete={remove}
                  disabled={pending}
                />
              </div>
            ) : null}
            {record.practitioners.length > 0 ? (
              <div className="border-t border-border/70 pt-5">
                <h3 className="text-sm font-medium">Linked practitioners</h3>
                <p className="mt-1 text-sm text-muted-foreground">Remove these links before permanently deleting the term.</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {record.practitioners.map((practitioner) => (
                    <li key={practitioner.id}>
                      <Link
                        className="underline underline-offset-4"
                        href={`/admin/practitioners/${practitioner.id}`}
                      >
                        {practitioner.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AdminPanel>
        )}
      </AdminFormLayout>
    </div>
  );
}
