import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAdminDate, type TaxonomyRow } from "@/lib/admin/practitioner-cms";
import type { AdminPractitionerRecord } from "@/lib/admin/practitioner-actions";

function imageUrl(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base && path ? `${base}/storage/v1/object/public/profile-images/${path}` : null;
}

export function PractitionerPreview({ record }: { record: AdminPractitionerRecord }) {
  const termsByType = new Map<string, TaxonomyRow[]>();
  for (const term of record.terms) termsByType.set(term.type, [...(termsByType.get(term.type) ?? []), term]);
  return <main className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6 p-4 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost"><Link href={`/admin/practitioners/${record.id}`}><ArrowLeftIcon />Back to editor</Link></Button><Badge variant="outline">Private preview · {record.status}</Badge></div><article className="overflow-hidden rounded-lg border bg-card"><div className="grid md:grid-cols-[minmax(0,18rem)_1fr]">{record.image_path ? <img src={imageUrl(record.image_path) ?? ""} alt={record.image_alt ?? ""} className="aspect-[4/5] h-full w-full object-cover" /> : <div className="flex aspect-[4/5] items-center justify-center bg-muted p-5 text-center text-sm text-muted-foreground">No approved portrait yet</div>}<div className="grid content-start gap-5 p-6 md:p-8"><div><p className="text-sm text-muted-foreground">The Solas Guide practitioner</p><h1 className="mt-2 break-words font-display text-4xl leading-tight">{record.name}</h1>{record.descriptor && <p className="mt-2 text-lg text-muted-foreground">{record.descriptor}</p>}</div>{record.summary && <p className="text-base leading-relaxed">{record.summary}</p>}{record.about && <section><h2 className="font-semibold">About</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{record.about}</p></section>}{[...termsByType.entries()].map(([type, terms]) => <section key={type}><h2 className="font-semibold">{type.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())}</h2><p className="mt-2 text-sm text-muted-foreground">{terms.map((term) => term.name).join(" · ")}</p></section>)}<p className="text-xs text-muted-foreground">Updated {formatAdminDate(record.updated_at)}. This preview is private.</p></div></div></article></main>;
}
