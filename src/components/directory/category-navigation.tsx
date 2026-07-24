import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BaseCategoryProps = {
  index: string;
  title: string;
  href: string;
  className?: string;
};

export function CategoryImageTile({ index, title, href, imageSrc, imageAlt, className }: BaseCategoryProps & { imageSrc: string; imageAlt: string }) {
  return (
    <a href={href} className={cn("group relative flex aspect-[4/5] min-h-80 items-end overflow-hidden bg-muted p-6 text-white", className)}>
      <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5" />
      <span className="absolute top-5 right-5 text-[10px] tracking-[0.18em]">{index}</span>
      <div className="relative flex w-full items-end justify-between gap-5">
        <h3 className="font-display text-3xl leading-tight">{title}</h3>
        <ArrowRight className="mb-1 size-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
}

export function CategoryCompactCard({ index, title, href, description, className }: BaseCategoryProps & { description: string }) {
  return (
    <a href={href} className={cn("group flex min-h-56 flex-col justify-between border border-border bg-card p-6 transition-colors hover:bg-muted md:p-7", className)}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><span>Practice</span><span>{index}</span></div>
      <div className="mt-12">
        <h3 className="font-display text-2xl leading-tight">{title}</h3>
        <div className="mt-4 flex items-end justify-between gap-5">
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
}

export function CategoryLinkRow({ index, title, href, description, className }: BaseCategoryProps & { description: string }) {
  return (
    <a href={href} className={cn("group grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-t border-border py-5 md:grid-cols-[3rem_minmax(12rem,0.7fr)_minmax(16rem,1fr)_auto] md:gap-7 md:py-6", className)}>
      <span className="text-[10px] text-muted-foreground">{index}</span>
      <h3 className="font-display text-xl md:text-2xl">{title}</h3>
      <p className="hidden text-sm leading-relaxed text-muted-foreground md:block">{description}</p>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
