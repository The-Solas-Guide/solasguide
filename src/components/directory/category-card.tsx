import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CategoryCardProps = {
  index: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  enquiryHref: string;
  className?: string;
};

export function CategoryCard({ index, title, description, imageSrc, imageAlt, enquiryHref, className }: CategoryCardProps) {
  return (
    <article className={cn("group flex h-full flex-col overflow-hidden border border-border bg-background transition-colors hover:bg-card", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className="absolute right-5 bottom-4 font-display text-sm text-white">{index}</span>
      </div>
      <div className="flex flex-1 flex-col p-7 md:p-9">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Practice area</span>
        <h3 className="mt-8 max-w-sm font-display text-3xl leading-tight md:text-4xl">{title}</h3>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Button asChild variant="link" className="mt-8 h-auto justify-start p-0 md:mt-10">
          <a href={enquiryHref}>Explore this practice<ArrowRight /></a>
        </Button>
      </div>
    </article>
  );
}
