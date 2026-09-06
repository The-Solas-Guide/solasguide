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
import {
  PractitionerPublicationControls,
  type PractitionerPublicationRequirement,
} from "@/components/admin/practitioner-publication-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Scrollspy } from "@/components/reui/scrollspy";
import {
  formatAdminDate,
  getPractitionerLifecycle,
  slugifyTerm,
  validatePortraitFile,
  type TaxonomyRow,
} from "@/lib/admin/practitioner-cms";
import { portraitObjectPosition } from "@/lib/practitioners";
import {
  archivePractitioner,
  deletePractitioner,
  publishPractitioner,
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

function slugifyName(value: string) {
  return slugifyTerm(value);
}

type Props = {
  record: AdminPractitionerRecord | null;
  terms: TaxonomyRow[];
  isNew?: boolean;
};

const editorSections = [
  ["section-profile", "Profile"],
  ["section-about", "About"],
  ["section-experience", "Experience"],
  ["section-links", "Links"],
  ["section-practice-details", "Practice details"],
  ["section-practice-areas", "Practice areas"],
  ["section-portrait", "Portrait"],
  ["section-settings", "Settings"],
  ["section-publication", "Publication"],
  ["section-featured", "Featured"],
] as const;

export function PractitionerEditor({ record, terms, isNew = false }: Props) {
  const router = useRouter();
  const editorRoot = useRef<HTMLDivElement>(null);
  const documentRef = useRef<Document | null>(
    typeof document === "undefined" ? null : document,
  );
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
  const [summaryValue, setSummaryValue] = useState(record?.summary ?? "");
  const [aboutValue, setAboutValue] = useState(record?.about ?? "");
  const [slug, setSlug] = useState(record?.slug ?? "");
  const slugManuallyEdited = useRef(Boolean(record?.slug));
  const [persistedPortraitApproved, setPersistedPortraitApproved] = useState(
    Boolean(
      record &&
        (record.portrait_approval_required === false ||
          record.portrait_approved_at),
    ),
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string>();
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
  const [savedFeaturedPosition, setSavedFeaturedPosition] = useState(
    record?.featured_position ?? null,
  );
  const [taxonomyQuery, setTaxonomyQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.currentTarget.value;
    if (isNew && !slugManuallyEdited.current) {
      setSlug(slugifyName(nextName));
    }
    markDirty();
  };
  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    setSlug(event.currentTarget.value);
    markDirty();
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
      setSavedMessage(
        isNew
          ? "Draft created"
          : status === "published"
            ? "Live profile updated"
            : "Draft saved",
      );
      setSaved(true);
      setFile(null);
      if (approved) setPersistedPortraitApproved(true);
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
  const publish = () =>
    startTransition(async () => {
      if (!record || status !== "draft") return;
      setSaved(false);
      if (dirty) {
        toast.warning("Save your changes before publishing this practitioner.");
        return;
      }
      setError(undefined);
      setFieldErrors({});
      const result = await publishPractitioner(record.id);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error ?? "The practitioner could not be published.");
        return;
      }
      setStatus("published");
      setSavedMessage("Profile published");
      setSaved(true);
      router.refresh();
    });
  const unpublish = () =>
    startTransition(async () => {
      if (!record || status !== "published") return;
      setSaved(false);
      if (!guardLifecycleAction()) return;
      const formElement = editorRoot.current?.querySelector<HTMLFormElement>("form");
      if (!formElement) {
        toast.error("The practitioner form could not be found.");
        return;
      }
      const form = new FormData(formElement);
      form.set("id", record.id);
      form.set("termIds", JSON.stringify([...selectedTerms]));
      form.set("status", "draft");
      form.delete("portrait");
      form.delete("imageApproved");
      setError(undefined);
      setFieldErrors({});
      const result = await savePractitioner(form);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        toast.error(result.error ?? "The practitioner could not be unpublished.");
        return;
      }
      setStatus("draft");
      setDirty(false);
      setSavedMessage("Profile returned to draft");
      setSaved(true);
      router.refresh();
    });
  const archive = (restore = false) =>
    startTransition(async () => {
      if (!record) return;
      setSaved(false);
      if (!guardLifecycleAction()) return;
      const result = await archivePractitioner(record.id, restore);
      if (!result.ok)
        toast.error(
          result.error ?? "The practitioner lifecycle could not be saved.",
        );
      else {
        setStatus(restore ? "draft" : "archived");
        setDirty(false);
        setSavedMessage(
          restore ? "Profile restored to draft" : "Profile archived",
        );
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
        setSavedFeaturedPosition(next);
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
  const normalizedTaxonomyQuery = taxonomyQuery.trim().toLocaleLowerCase();
  const visibleGroups = [...grouped.entries()]
    .map(([type, items]) => [
      type,
      [...items]
        .filter(
          (term) =>
            selectedTerms.has(term.id) ||
            !normalizedTaxonomyQuery ||
            term.name.toLocaleLowerCase().includes(normalizedTaxonomyQuery),
        )
        .sort(
          (a, b) =>
            Number(selectedTerms.has(b.id)) - Number(selectedTerms.has(a.id)) ||
            a.name.localeCompare(b.name),
        ),
    ] as const)
    .filter(([, items]) => items.length > 0);
  const hasFeaturedPositionChange =
    isFeatured && featuredPosition !== savedFeaturedPosition;
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
  const hasPortrait = Boolean(file || record?.image_path);
  const portraitApprovalComplete = file ? approved : persistedPortraitApproved;
  const hasActiveLocation = [...selectedTerms].some((termId) =>
    terms.some(
      (term) =>
        term.id === termId &&
        term.type === "location" &&
        term.is_active &&
        !term.archived_at,
    ),
  );
  const publicationRequirements: PractitionerPublicationRequirement[] = [
    { id: "summary", label: "Add a summary", complete: Boolean(summaryValue.trim()) },
    { id: "about", label: "Add about text", complete: Boolean(aboutValue.trim()) },
    {
      id: "portrait",
      label: "Upload an approved portrait",
      complete: hasPortrait && portraitApprovalComplete,
    },
    {
      id: "location",
      label: "Select an active location",
      complete: hasActiveLocation,
    },
  ];

  return (
    <div ref={editorRoot} className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <AdminBackLink href="/admin/practitioners">Practitioners</AdminBackLink>
        {record && (
          <Button asChild variant="outline" className={dirty ? "opacity-60" : undefined}>
            <Link
              href={`/admin/practitioners/${record.id}/preview`}
              aria-disabled={dirty}
              tabIndex={dirty ? -1 : undefined}
              onClick={(event) => {
                if (dirty) event.preventDefault();
              }}
            >
              Preview saved version
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
        notifyOnError={false}
        validationErrors={fieldErrors}
        onSubmit={submit}
        onCancel={() => router.replace("/admin/practitioners")}
        saveLabel={
          isNew
            ? "Create draft"
            : status === "published"
              ? "Update live profile"
              : "Save draft"
        }
        successMessage={savedMessage ?? "Saved"}
        savedLabel={savedMessage ?? "Saved"}
        width="wide"
      >
        <input type="hidden" name="id" value={record?.id ?? ""} />
        {record && (
          <p className="text-sm text-muted-foreground" role="status">
            {dirty
              ? "Preview shows the last saved version. Save changes to update it."
              : "Preview shows the latest saved version."}
          </p>
        )}
        <div className="grid items-start gap-6 lg:grid-cols-[10rem_minmax(0,1fr)_19rem] lg:gap-x-6">
          <Scrollspy
            key={status}
            targetRef={documentRef}
            offset={112}
            smooth={false}
            history={false}
            className="sticky top-0 z-20 -mx-1 overflow-x-auto bg-background/95 px-1 py-2 backdrop-blur lg:top-4 lg:mx-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0"
          >
            <nav aria-label="Practitioner editor sections" className="flex min-w-max gap-1 lg:grid lg:min-w-0 lg:gap-1">
              {editorSections
                .filter(
                  ([id]) =>
                    (record || id !== "section-publication") &&
                    (status === "published" || id !== "section-featured"),
                )
                .map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    data-scrollspy-anchor={id}
                    onClick={() => {
                      requestAnimationFrame(() => {
                        document.getElementById(id)?.focus({ preventScroll: true });
                      });
                    }}
                    className="min-h-11 rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-foreground lg:flex lg:items-center"
                  >
                    {label}
                  </a>
                ))}
            </nav>
          </Scrollspy>
          <div className="grid min-w-0 gap-6">
            <div id="section-profile" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection title="Public profile">
              <div className="grid gap-4">
                <AdminFormField
                  name="name"
                  label="Name"
                  error={fieldErrors.name}
                >
                  <Input
                    defaultValue={record?.name ?? ""}
                    required
                    onChange={handleNameChange}
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
                    onChange={(event) => {
                      setSummaryValue(event.currentTarget.value);
                      markDirty();
                    }}
                  />
                </AdminFormField>
              </div>
            </AdminFormSection>
            </div>
            <div id="section-about" className="scroll-mt-32" tabIndex={-1}>
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
                  onChange={(event) => {
                    setAboutValue(event.currentTarget.value);
                    markDirty();
                  }}
                />
              </AdminFormField>
            </AdminFormSection>
            </div>
            <div id="section-experience" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection title="Experience">
              <div className="grid gap-4">
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
                  description="Add one credential per line. Commas stay within an item."
                >
                  <Textarea
                    defaultValue={record?.credentials?.join("\n") ?? ""}
                    onChange={markDirty}
                  />
                </AdminFormField>
                <AdminFormField
                  name="significantTraining"
                  label="Significant training"
                  description="Add one training item per line. Commas stay within an item."
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
            </div>
            <div id="section-links" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection title="Links">
              <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div id="section-practice-details" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection title="Practice details">
              <div className="grid gap-1">
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
            </div>
            <div id="section-practice-areas" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection
              title="Practice areas"
              description="Select active terms for this practitioner. Linked archived terms stay visible until you remove them. A published record needs at least one active location."
            >
              <div className="grid gap-4">
                <Input
                  type="search"
                  value={taxonomyQuery}
                  onChange={(event) => setTaxonomyQuery(event.currentTarget.value)}
                  placeholder="Search practice areas"
                  aria-label="Search practice areas"
                />
                {visibleGroups.map(([type, items]) => (
                  <details
                    key={type}
                    className="group rounded-md border border-border/70 px-3"
                    open={normalizedTaxonomyQuery ? true : undefined}
                    data-field-target={
                      type === "location" ? "taxonomy-location" : undefined
                    }
                  >
                    <summary
                      className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden"
                      aria-describedby={
                        type === "location" && fieldErrors.location
                          ? "location-error"
                          : undefined
                      }
                    >
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
                {visibleGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground" role="status">
                    No practice areas match your search.
                  </p>
                )}
                {fieldErrors.location && (
                  <p id="location-error" className="text-sm text-destructive" role="alert">
                    {fieldErrors.location}
                  </p>
                )}
              </div>
            </AdminFormSection>
            </div>
          </div>
          <aside className="grid min-w-0 gap-6">
            <div id="section-portrait" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection
              title="Portrait"
              description="Use one approved JPEG, PNG, or WebP portrait up to 5 MB. The image becomes public after upload."
            >
              <div className="grid gap-3">
                <div className="flex aspect-[4/5] min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-muted/30">
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
                <div className="grid content-start gap-3">
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
                  {(file ||
                    (record?.image_path &&
                      record.portrait_approval_required &&
                      !persistedPortraitApproved)) && (
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={approved}
                        onChange={(event) => {
                          setApproved(event.currentTarget.checked);
                          markDirty();
                        }}
                      />{" "}
                      {file
                        ? "I confirm this portrait is approved for public use."
                        : "I confirm this saved portrait is approved for public use."}
                    </label>
                  )}
                  <AdminFormField name="imageAlt" label="Portrait alt text">
                    <Input
                      defaultValue={record?.image_alt ?? ""}
                      onChange={markDirty}
                    />
                  </AdminFormField>
                  <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            <div id="section-settings" className="scroll-mt-32" tabIndex={-1}>
            <AdminFormSection title="URL and settings">
              <AdminFormField
                name="slug"
                label="Profile URL"
                description={
                  record
                    ? "Changing this value changes the public profile link. Existing links will not redirect."
                    : "Generated from the name. You can edit it before creating the draft."
                }
                error={fieldErrors.slug}
              >
                <Input
                  value={slug}
                  required
                  onChange={handleSlugChange}
                />
              </AdminFormField>
            </AdminFormSection>
            </div>
            <div className="grid gap-6">
              {record && (
                <div id="section-publication" className="scroll-mt-32" tabIndex={-1}>
                <PractitionerPublicationControls
                  status={status}
                  requirements={publicationRequirements}
                  dirty={dirty}
                  pending={pending}
                  recordName={record.name}
                  onPublish={publish}
                  onUnpublish={unpublish}
                  onArchive={() => archive(false)}
                  onRestore={() => archive(true)}
                />
                </div>
              )}
              {record && status === "published" && (
                <div id="section-featured" className="scroll-mt-32" tabIndex={-1}>
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
                        {hasFeaturedPositionChange && (
                          <p className="basis-full text-sm text-muted-foreground" role="status">
                            Position changed. Save featured position to apply it.
                          </p>
                        )}
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
                </div>
              )}
              {record && (
                <AdminPanel
                  title="Record actions"
                  description={`Created ${formatAdminDate(record.created_at)}. Archive before permanent deletion.`}
                >
                  {status === "archived" ? (
                    <div className="flex flex-wrap gap-2">
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
