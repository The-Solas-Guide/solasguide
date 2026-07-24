import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnquiryCta({ eyebrow, title, description, actionLabel, secondaryLabel, actionHref = "/find-a-practitioner", secondaryHref = "#journeys", className }: { eyebrow: string; title: string; description: string; actionLabel: string; secondaryLabel?: string; actionHref?: string; secondaryHref?: string; className?: string }) {
  return <section className={cn("grid border border-border bg-card md:grid-cols-[1.15fr_0.85fr]", className)}><div className="p-7 md:p-10"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p><h3 className="mt-6 max-w-xl font-display text-4xl leading-tight">{title}</h3></div><div className="flex flex-col justify-between border-t border-border p-7 md:border-t-0 md:border-l md:p-10"><p className="text-sm leading-relaxed text-muted-foreground">{description}</p><div className="mt-8 flex flex-wrap gap-3"><a href={actionHref} className={buttonVariants()}> {actionLabel}<ArrowRight /></a>{secondaryLabel && <a href={secondaryHref} className={buttonVariants({ variant: "outline" })}>{secondaryLabel}</a>}</div></div></section>;
}

export function JourneyEntryCards({ items, className }: { items: readonly { index?: string; title: string; description: string; href?: string; image?: string; imageClassName?: string }[]; className?: string }) {
  return <div className={cn("grid gap-px border border-border bg-border md:grid-cols-3", className)}>{items.map((item) => <a key={item.title} href={item.href ?? "#"} className="group relative flex min-h-80 flex-col justify-end overflow-hidden bg-background p-7 text-background transition-colors"><div className="absolute inset-0 bg-foreground"><Image src={item.image ?? "/images/solas-imagery/solas-guide-hero.png"} alt="" fill className={cn("object-cover opacity-70 transition-transform duration-500 group-hover:scale-105", item.imageClassName)} sizes="(max-width: 768px) 100vw, 33vw" /></div><div className="absolute inset-0 bg-foreground/45" /><div className="relative"><h3 className="font-display text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-background/80">{item.description}</p><ArrowRight className="mt-6 size-4 transition-transform group-hover:translate-x-1" /></div></a>)}</div>;
}
