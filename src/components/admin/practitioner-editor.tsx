"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AdminFormField,
  AdminFormLayout,
  AdminFormSection,
} from "@/components/admin/admin-form";
import { AdminPermanentDeleteDialog } from "@/components/admin/record-deletion";
import { PublicLifecycleControls } from "@/components/admin/lifecycle-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatAdminDate,
  getPractitionerLifecycle,
  validatePortraitFile,
  type TaxonomyRow,
} from "@/lib/admin/practitioner-cms";
import { portraitObjectPosition } from "@/lib/practitioners";
import {
  archivePractitioner,
  deletePractitioner,
  savePractitioner,
  setPractitionerFeaturedPosition,
  type AdminPractitionerRecord,
} from "@/lib/admin/practitioner-actions";

function imageUrl(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path
    ? `${base}/storage/v1/object/public/profile-images/${path}`
    : null;
}

type Props = {
  record: AdminPractitionerRecord | null;
  terms: TaxonomyRow[];
  isNew?: boolean;
};

export function PractitionerEditor({ record, terms, isNew = false }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(
    record ? getPractitionerLifecycle(record) : "draft",
  );
  const [selectedTerms, setSelectedTerms] = useState(
    () => new Set(record?.terms.map((term) => term.id) ?? []),
  );
  const [file, setFile] = useState<File | null>(null);
  const portraitInput = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focalX, setFocalX] = useState(record?.image_focal_x ?? 50);
  const [focalY, setFocalY] = useState(record?.image_focal_y ?? 50);
  const [featuredPosition, setFeaturedPosition] = useState(
    record?.featured_position ?? 1,
  );
  const [isFeatured, setIsFeatured] = useState(
    record?.featured_position != null,
  );
  const [pending, startTransition] = useTransition();

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };
  const selectPortrait = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.files?.[0] ?? null;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = next ? URL.createObjectURL(next) : null;
    setSelectedImage(previewUrl.current);
    setFile(next);
    setApproved(false);
    markDirty();
    setFieldErrors((current) => ({
      ...current,
      image: next ? (validatePortraitFile(next) ?? "") : "",
    }));
  };
  const guardLifecycleAction = () => {
    if (!dirty) return true;
    toast.warning(
      "Save or cancel your changes before archiving or restoring this practitioner.",
    );
    return false;
  };
  const updateSelection = (id: string, checked: boolean) => {
    setSelectedTerms((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    markDirty();
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("termIds", JSON.stringify([...selectedTerms]));
    form.set("status", status);
    form.delete("portrait");
    if (file) form.set("portrait", file);
    if (approved) form.set("imageApproved", "on");
    startTransition(async () => {
      setError(undefined);
      setFieldErrors({});
      setSaved(false);
      const result = await savePractitioner(form);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        if (result.error) toast.error(result.error);
        return;
      }
      setDirty(false);
      setSaved(true);
      setFile(null);
      if (portraitInput.current) portraitInput.current.value = "";
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
      setSelectedImage(null);
      setApproved(false);
      if (result.warning) toast.warning(result.warning);
      if (isNew && result.data?.id)
        router.replace(`/admin/practitioners/${result.data.id}`);
      else router.refresh();
    });
  };
  const changeStatus = (next: typeof status) => {
    if (next !== "draft" && next !== "published" && next !== "archived") return;
    setStatus(next);
    markDirty();
  };
  const archive = (restore = false) =>
    startTransition(async () => {
      if (!record) return;
      if (!guardLifecycleAction()) return;
      const result = await archivePractitioner(record.id, restore);
      if (!result.ok)
        toast.error(
          result.error ?? "The practitioner lifecycle could not be saved.",
        );
      else {
        setStatus(restore ? "draft" : "archived");
        setDirty(false);
        setSaved(true);
      }
    });
  const remove = () =>
    startTransition(async () => {
      if (!record) return;
      if (!guardLifecycleAction()) return;
      const result = await deletePractitioner(record.id);
      if (!result.ok)
        toast.error(result.error ?? "The practitioner could not be deleted.");
      else router.replace("/admin/practitioners");
    });
  const updateFeatured = (next: number | null) =>
    startTransition(async () => {
      if (!record) return;
      const result = await setPractitionerFeaturedPosition(record.id, next);
      if (!result.ok)
        toast.error(result.error ?? "Featured status could not be saved.");
      else {
        setIsFeatured(next !== null);
        if (next !== null) setFeaturedPosition(next);
        toast.success(
          next === null ? "Removed from featured." : "Featured position saved.",
        );
      }
    });
  const activeTerms = terms.filter(
    (term) => term.is_active || selectedTerms.has(term.id),
  );
  const grouped = new Map<string, TaxonomyRow[]>();
  for (const term of activeTerms) {
    const group = grouped.get(term.type) ?? [];
    group.push(term);
    grouped.set(term.type, group);
  }
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );
  const currentImage = file
    ? selectedImage
    : imageUrl(record?.image_path ?? null);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/admin/practitioners">
            <ArrowLeftIcon />
            Practitioners
          </Link>
        </Button>
        {record && (
          <Button asChild variant="outline">
            <Link href={`/admin/practitioners/${record.id}/preview`}>
              Preview
            </Link>
          </Button>
        )}
      </div>
      <AdminFormLayout
        title={
          isNew ? "New practitioner" : `Edit ${record?.name ?? "practitioner"}`
        }
        status={status ? status[0].toUpperCase() + status.slice(1) : "Draft"}
        statusKind={status || "draft"}
        pending={pending}
        saved={saved}
        isDirty={dirty}
        error={error}
        validationErrors={fieldErrors}
        onSubmit={submit}
        onCancel={() => router.replace("/admin/practitioners")}
        saveLabel={isNew ? "Create practitioner" : "Save changes"}
      >
        <input type="hidden" name="id" value={record?.id ?? ""} />
        <AdminFormSection title="Public profile">
          <div className="grid gap-5">
            <AdminFormField name="name" label="Name" error={fieldErrors.name}>
              <Input
                defaultValue={record?.name ?? ""}
                required
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField
              name="slug"
              label="Slug"
              description="Use lowercase words separated by hyphens."
              error={fieldErrors.slug}
            >
              <Input
                defaultValue={record?.slug ?? ""}
                required
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField name="descriptor" label="Descriptor">
              <Input
                defaultValue={record?.descriptor ?? ""}
                onChange={markDirty}
              />
            </AdminFormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField name="yearsActive" label="Years active">
                <Input
                  type="number"
                  min="1"
                  defaultValue={record?.years_active ?? ""}
                  onChange={markDirty}
                />
              </AdminFormField>
              <div className="grid gap-2">
                <span className="text-sm font-medium">Delivery</span>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="offersInPerson"
                    defaultChecked={record?.offers_in_person ?? true}
                    onChange={markDirty}
                  />{" "}
                  In-person
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="offersOnline"
                    defaultChecked={record?.offers_online ?? true}
                    onChange={markDirty}
                  />{" "}
                  Online
                </label>
              </div>
            </div>
            <AdminFormField
              name="summary"
              label="Summary"
              description="Required before publishing."
              error={fieldErrors.summary}
            >
              <Textarea
                defaultValue={record?.summary ?? ""}
                required={status === "published"}
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField
              name="about"
              label="About"
              description="Required before publishing."
              error={fieldErrors.about}
            >
              <Textarea
                defaultValue={record?.about ?? ""}
                required={status === "published"}
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField
              name="credentials"
              label="Credentials"
              description="One item per line or comma separated."
            >
              <Textarea
                defaultValue={record?.credentials?.join("\n") ?? ""}
                onChange={markDirty}
              />
            </AdminFormField>
            <AdminFormField
              name="significantTraining"
              label="Significant training"
              description="One item per line or comma separated."
            >
              <Textarea
                defaultValue={record?.significant_training?.join("\n") ?? ""}
                onChange={markDirty}
              />
            </AdminFormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField name="websiteUrl" label="Website">
                <Input
                  type="url"
                  defaultValue={record?.website_url ?? ""}
                  onChange={markDirty}
                />
              </AdminFormField>
              <AdminFormField name="instagramUrl" label="Instagram">
                <Input
                  type="url"
                  defaultValue={record?.instagram_url ?? ""}
                  onChange={markDirty}
                />
              </AdminFormField>
            </div>
          </div>
        </AdminFormSection>
        <AdminFormSection
          title="Portrait"
          description="Use one approved JPEG, PNG, or WebP portrait up to 5 MB. The image becomes public after upload."
        >
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={record?.image_alt ?? "Current portrait"}
                  className="h-full max-h-48 w-full object-cover"
                  style={{
                    objectPosition: portraitObjectPosition(focalX, focalY),
                  }}
                />
              ) : (
                <span className="p-4 text-center text-sm text-muted-foreground">
                  No portrait uploaded
                </span>
              )}
            </div>
            <div className="grid content-start gap-4">
              <AdminFormField
                name="portrait"
                label="Portrait file"
                error={fieldErrors.image}
              >
                <Input
                  ref={portraitInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectPortrait}
                />
              </AdminFormField>
              {file && (
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(event) => {
                      setApproved(event.currentTarget.checked);
                      markDirty();
                    }}
                  />{" "}
                  I confirm this portrait is approved for public use.
                </label>
              )}
              <AdminFormField name="imageAlt" label="Portrait alt text">
                <Input
                  defaultValue={record?.image_alt ?? ""}
                  onChange={markDirty}
                />
              </AdminFormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField name="imageFocalX" label="Focal X (0–100)">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={focalX}
                    onChange={(event) => {
                      setFocalX(
                        Math.min(
                          100,
                          Math.max(0, Number(event.currentTarget.value) || 0),
                        ),
                      );
                      markDirty();
                    }}
                  />
                </AdminFormField>
                <AdminFormField name="imageFocalY" label="Focal Y (0–100)">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={focalY}
                    onChange={(event) => {
                      setFocalY(
                        Math.min(
                          100,
                          Math.max(0, Number(event.currentTarget.value) || 0),
                        ),
                      );
                      markDirty();
                    }}
                  />
                </AdminFormField>
              </div>
              {record?.image_path && (
                <a
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline"
                  href={imageUrl(record.image_path) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open current portrait <ExternalLinkIcon className="size-4" />
                </a>
              )}
            </div>
          </div>
        </AdminFormSection>
        <AdminFormSection
          title="Taxonomy"
          description="Select active terms for this practitioner. Linked archived terms stay visible until you remove them. A published record needs at least one active location."
        >
          <div className="grid gap-5">
            {[...grouped.entries()].map(([type, items]) => (
              <fieldset key={type} className="grid gap-2">
                <legend className="text-sm font-semibold">
                  {type
                    .replaceAll("_", " ")
                    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((term) => (
                    <label
                      key={term.id}
                      className="flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTerms.has(term.id)}
                        onChange={(event) =>
                          updateSelection(term.id, event.currentTarget.checked)
                        }
                      />
                      <span>
                        {term.name}
                        {term.archived_at && (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Archived
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            {fieldErrors.location && (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.location}
              </p>
            )}
          </div>
        </AdminFormSection>
        <div className="grid gap-4">
          <section className="rounded-md border bg-card p-4">
            <PublicLifecycleControls
              value={status}
              onChange={changeStatus}
              onArchive={() => archive(false)}
              disabled={pending}
              recordName={record?.name ?? "this practitioner"}
            />
          </section>
          {record && status === "published" && (
            <section className="grid gap-3 rounded-md border bg-card p-4">
              <div>
                <h2 className="font-semibold">Featured placement</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a position from 1 to 8, or remove this practitioner
                  from Featured.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="grid gap-2 text-sm font-medium">
                  Position
                  <select
                    aria-label="Featured position"
                    className="h-11 rounded-md border bg-background px-3"
                    value={featuredPosition}
                    onChange={(event) => {
                      setFeaturedPosition(Number(event.currentTarget.value));
                      markDirty();
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </label>
                {isFeatured ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => updateFeatured(featuredPosition)}
                      disabled={pending}
                    >
                      Save featured position
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFeatured(null)}
                      disabled={pending}
                    >
                      Unfeature
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => updateFeatured(featuredPosition)}
                    disabled={pending}
                  >
                    Feature
                  </Button>
                )}
              </div>
            </section>
          )}
          {record && (
            <section className="rounded-md border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Record actions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Created {formatAdminDate(record.created_at)}. Archive before
                    permanent deletion.
                  </p>
                </div>
                {status === "archived" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => archive(true)}
                      disabled={pending}
                    >
                      Restore to draft
                    </Button>
                    <AdminPermanentDeleteDialog
                      recordName={record.name}
                      onDelete={remove}
                      disabled={pending}
                    />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </AdminFormLayout>
    </div>
  );
}
