"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminBackLink, AdminPanel } from "@/components/admin/admin-page";
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
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminBackLink href="/admin/practitioners">Practitioners</AdminBackLink>
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
        width="wide"
      >
        <input type="hidden" name="id" value={record?.id ?? ""} />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-x-10">
          <div className="grid min-w-0 gap-8">
            <AdminFormSection title="Public profile">
              <div className="grid gap-5">
                <AdminFormField
                  name="name"
                  label="Name"
                  error={fieldErrors.name}
                >
                  <Input
                    defaultValue={record?.name ?? ""}
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
              </div>
            </AdminFormSection>
            <AdminFormSection title="About">
              <AdminFormField
                name="about"
                label="About"
                description="Required before publishing."
                error={fieldErrors.about}
              >
                <Textarea
                  className="min-h-40"
                  defaultValue={record?.about ?? ""}
                  required={status === "published"}
                  onChange={markDirty}
                />
              </AdminFormField>
            </AdminFormSection>
            <AdminFormSection title="Experience">
              <div className="grid gap-5">
                <AdminFormField name="yearsActive" label="Years active">
                  <Input
                    type="number"
                    min="1"
                    defaultValue={record?.years_active ?? ""}
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
                    defaultValue={
                      record?.significant_training?.join("\n") ?? ""
                    }
                    onChange={markDirty}
                  />
                </AdminFormField>
              </div>
            </AdminFormSection>
            <AdminFormSection title="Links">
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
            </AdminFormSection>
            <AdminFormSection title="Practice details">
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
            </AdminFormSection>
            <AdminFormSection
              title="Practice areas"
              description="Select active terms for this practitioner. Linked archived terms stay visible until you remove them. A published record needs at least one active location."
            >
              <div className="grid gap-5">
                {[...grouped.entries()].map(([type, items]) => (
                  <details
                    key={type}
                    className="group rounded-md border border-border/70 px-3"
                  >
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 py-2">
                        <span className="block">{type
                          .replaceAll("_", " ")
                          .replace(/(^|\s)\S/g, (letter) =>
                            letter.toUpperCase(),
                          )}</span>
                        <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                          {items.filter((term) => selectedTerms.has(term.id)).map((term) => term.name).join(", ") || "Select terms"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-normal text-muted-foreground">
                        {
                          items.filter((term) => selectedTerms.has(term.id))
                            .length
                        }{" "}
                        selected
                      </span>
                      <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <fieldset className="grid gap-2 border-t border-border/60 py-3">
                      <legend className="sr-only">{type}</legend>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {items.map((term) => (
                          <label
                            key={term.id}
                            className="flex min-h-11 items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTerms.has(term.id)}
                              onChange={(event) =>
                                updateSelection(
                                  term.id,
                                  event.currentTarget.checked,
                                )
                              }
                            />
                            <span>
                              {term.name}
                              {term.archived_at && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  Archived
                                </span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </details>
                ))}
                {fieldErrors.location && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.location}
                  </p>
                )}
              </div>
            </AdminFormSection>
          </div>
          <aside className="grid min-w-0 gap-8">
            <AdminFormSection
              title="Portrait"
              description="Use one approved JPEG, PNG, or WebP portrait up to 5 MB. The image becomes public after upload."
            >
              <div className="grid gap-4">
                <div className="flex aspect-[4/5] min-h-40 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={record?.image_alt ?? "Current portrait"}
                      className="h-full w-full object-cover"
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
                    <AdminFormField
                      name="imageFocalX"
                      label="Horizontal position"
                      description={<output>Current position: {focalX}%</output>}
                    >
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={focalX}
                        className="h-11 w-full accent-primary"
                        onChange={(event) => {
                          setFocalX(
                            Math.min(
                              100,
                              Math.max(
                                0,
                                Number(event.currentTarget.value) || 0,
                              ),
                            ),
                          );
                          markDirty();
                        }}
                      />
                    </AdminFormField>
                    <AdminFormField
                      name="imageFocalY"
                      label="Vertical position"
                      description={<output>Current position: {focalY}%</output>}
                    >
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={focalY}
                        className="h-11 w-full accent-primary"
                        onChange={(event) => {
                          setFocalY(
                            Math.min(
                              100,
                              Math.max(
                                0,
                                Number(event.currentTarget.value) || 0,
                              ),
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
                      Open current portrait{" "}
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </AdminFormSection>
            <AdminFormSection title="URL and settings">
              <AdminFormField
                name="slug"
                label="Profile URL"
                description="Use lowercase words separated by hyphens."
                error={fieldErrors.slug}
              >
                <Input
                  defaultValue={record?.slug ?? ""}
                  required
                  onChange={markDirty}
                />
              </AdminFormField>
            </AdminFormSection>
            <div className="grid gap-5">
              <AdminPanel title="Public lifecycle">
                <PublicLifecycleControls
                  value={status}
                  onChange={changeStatus}
                  onArchive={() => archive(false)}
                  disabled={pending}
                  recordName={record?.name ?? "this practitioner"}
                />
              </AdminPanel>
              {record && status === "published" && (
                <AdminPanel
                  title="Featured placement"
                  description="Choose a position from 1 to 8, or remove this practitioner from Featured."
                >
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="grid gap-2 text-sm font-medium">
                      Position
                      <select
                        aria-label="Featured position"
                        className="h-11 rounded-md border bg-background px-3"
                        value={featuredPosition}
                        onChange={(event) => {
                          setFeaturedPosition(
                            Number(event.currentTarget.value),
                          );
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
                </AdminPanel>
              )}
              {record && (
                <AdminPanel
                  title="Record actions"
                  description={`Created ${formatAdminDate(record.created_at)}. Archive before permanent deletion.`}
                >
                  {status === "archived" ? (
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
                  ) : null}
                </AdminPanel>
              )}
            </div>
          </aside>
        </div>
      </AdminFormLayout>
    </div>
  );
}
