import Link from "next/link";
import { AdminBackLink, AdminPanel, AdminStatus } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import { formatAdminDate, type TaxonomyRow } from "@/lib/admin/practitioner-cms";
import { portraitObjectPosition } from "@/lib/practitioners";
import type { AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";

function imageUrl(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path ? `${base}/storage/v1/object/public/profile-images/${path}` : null;
}

export function PractitionerPreview({ record }: { record: AdminPractitionerRecord }) {
  const termsByType = new Map<string, TaxonomyRow[]>();
  for (const term of record.terms) termsByType.set(term.type, [...(termsByType.get(term.type) ?? []), term]);
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <AdminBackLink href={`/admin/practitioners/${record.id}`}>Back to editor</AdminBackLink>
        <div className="flex items-center gap-3">
          <AdminStatus value={record.status} label={`Private preview · ${record.status}`} />
          <Button asChild variant="outline" size="sm"><Link href={`/admin/practitioners/${record.id}`}>Return to editor</Link></Button>
        </div>
      </div>
      <AdminPanel title="Practitioner preview" description="Review the stored public profile content before publishing.">
      <article className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-8">
        {record.image_path ? (
          // Preview must show the stored crop, including unoptimised local files.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl(record.image_path) ?? ""}
            alt={record.image_alt ?? ""}
            className="aspect-[4/5] h-full w-full object-cover"
            style={{ objectPosition: portraitObjectPosition(record.image_focal_x, record.image_focal_y) }}
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-muted/60 p-5 text-center text-sm text-muted-foreground">
            No approved portrait yet
          </div>
        )}
        <div className="grid content-start gap-6">
          <div>
            <h1 className="admin-title break-words tracking-tight">{record.name}</h1>
            {record.descriptor ? (
              <p className="mt-2 text-base text-muted-foreground">{record.descriptor}</p>
            ) : null}
          </div>
          {record.summary ? <p className="text-base leading-relaxed">{record.summary}</p> : null}
          {record.about ? (
            <section>
              <h2 className="text-sm font-medium">About</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{record.about}</p>
            </section>
          ) : null}
          {[...termsByType.entries()].map(([type, terms]) => (
            <section key={type}>
              <h2 className="text-sm font-medium">
                {type.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{terms.map((term) => term.name).join(" · ")}</p>
            </section>
          ))}
          <p className="text-sm text-muted-foreground">
            Updated {formatAdminDate(record.updated_at)}. This preview is private.
          </p>
        </div>
      </article>
      </AdminPanel>
    </div>
  );
}
