import Link from "next/link";
import { PractitionerProfile } from "@/components/practitioners/practitioner-profile";
import { AdminStatus } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import { mapPractitionerRow, type PractitionerTerm } from "@/lib/practitioners";
import type { AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";

export function PractitionerPreview({
  record,
}: {
  record: AdminPractitionerRecord;
}) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const image =
    record.image_path && base
      ? `${base}/storage/v1/object/public/profile-images/${record.image_path}`
      : undefined;
  const terms = record.terms
    .filter((term) => term.is_active && !term.archived_at)
    .map((term) => ({
      id: term.id,
      type: term.type as PractitionerTerm["type"],
      name: term.name,
      slug: term.slug,
      sortOrder: term.sort_order,
      displayOrder: term.displayOrder ?? 0,
    }));
  const profile = mapPractitionerRow(record, terms, image);
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-3 py-3 md:px-5 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-5 py-3">
          <span className="text-sm font-medium">Practitioner preview</span>
          <div className="flex flex-wrap items-center gap-3">
            <AdminStatus
              value={record.status}
              label={`Private preview · ${record.status}`}
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/practitioners/${record.id}`}>
                Return to editor
              </Link>
            </Button>
          </div>
        </div>
        <p className="px-1 text-sm text-muted-foreground">
          Preview of saved changes. This page is private.
        </p>
      </div>
      <PractitionerProfile practitioner={profile} includeJsonLd={false} />
    </div>
  );
}
