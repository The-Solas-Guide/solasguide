import Image from "next/image";
import { cn } from "@/lib/utils";

export type PractitionerTeaserCardProps = {
  name: string;
  modality: string;
  location: string;
  descriptor: string;
  experience: string;
  imageSrc?: string;
  imageAlt?: string;
  imageLabel?: string;
  className?: string;
};

export function PractitionerTeaserCard({
  name,
  modality,
  location,
  descriptor,
  experience,
  imageSrc,
  imageAlt = "Practitioner portrait",
  imageLabel = "Portrait pending",
  className,
}: PractitionerTeaserCardProps) {
  return (
    <article className={cn("group flex h-full min-w-[17rem] snap-start flex-col border border-border bg-card", className)}>
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_35%,color-mix(in_oklch,var(--accent),transparent_88%))]" />
            <span className="relative text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{imageLabel}</span>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{location}</p>
            <h3 className="mt-2 font-display text-2xl leading-tight">{name}</h3>
          </div>
          <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-medium">{modality}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{descriptor}</p>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{experience}</p>
      </div>
    </article>
  );
}
