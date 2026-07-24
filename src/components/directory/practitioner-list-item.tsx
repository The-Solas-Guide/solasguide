import Image from "next/image";
import { cn } from "@/lib/utils";

export type PractitionerListItemProps = {
  index: string;
  name: string;
  modality: string;
  location: string;
  descriptor: string;
  experience: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
};

export function PractitionerListItem({
  index,
  name,
  modality,
  location,
  descriptor,
  experience,
  imageSrc,
  imageAlt,
  className,
}: PractitionerListItemProps) {
  return (
    <article className={cn("group grid grid-cols-[5.5rem_1fr] gap-5 border-t border-border py-5 md:grid-cols-[2rem_8rem_minmax(12rem,0.8fr)_minmax(16rem,1.2fr)_9rem] md:items-center md:gap-6 md:py-6", className)}>
      <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:block">{index}</span>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 768px) 8rem, 5.5rem" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="min-w-0 self-start md:self-auto">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:hidden">{index} · {location}</p>
        <h3 className="mt-2 font-display text-2xl leading-tight md:mt-0 md:text-3xl">{name}</h3>
        <p className="mt-2 text-sm font-medium">{modality}</p>
      </div>
      <p className="col-span-2 text-sm leading-relaxed text-muted-foreground md:col-span-1">{descriptor}</p>
      <div className="col-span-2 flex items-center justify-between gap-4 text-xs text-muted-foreground md:col-span-1 md:block md:text-right">
        <p className="hidden uppercase tracking-[0.14em] md:block">{location}</p>
        <p className="md:mt-3">{experience}</p>
      </div>
    </article>
  );
}
