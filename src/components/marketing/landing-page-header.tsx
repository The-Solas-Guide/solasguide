import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LandingPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  variant?: "split" | "image" | "centered" | "application";
  className?: string;
};

export function LandingPageHeader({ eyebrow, title, description, actionLabel, imageSrc, imageAlt = "", variant = "split", className }: LandingPageHeaderProps) {
  if (variant === "image" && imageSrc) {
    return <section className={cn("relative flex min-h-[32rem] items-end overflow-hidden bg-foreground p-7 text-white md:min-h-[38rem] md:p-12", className)}><Image src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" /><div className="relative max-w-2xl"><p className="text-[10px] uppercase tracking-[0.22em] text-white/70">{eyebrow}</p><h2 className="mt-5 font-display text-5xl leading-[0.98] md:text-7xl">{title}</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">{description}</p><Button className="mt-8 bg-white text-black hover:bg-white/85">{actionLabel}<ArrowRight /></Button></div></section>;
  }

  if (variant === "centered") {
    return <section className={cn("relative flex min-h-[30rem] flex-col items-center justify-center overflow-hidden border border-border bg-foreground px-7 py-16 text-center text-background md:min-h-[36rem] md:px-16", className)}><span aria-hidden className="absolute -top-8 font-display text-[13rem] leading-none text-background/[0.035] md:text-[22rem]">○</span><div className="relative flex max-w-3xl flex-col items-center"><p className="border-y border-background/20 py-3 text-[10px] uppercase tracking-[0.28em] text-background/65">{eyebrow}</p><h2 className="mt-10 font-display text-5xl leading-[0.98] md:text-7xl">{title}</h2><p className="mt-7 max-w-xl text-sm leading-relaxed text-background/65 md:text-base">{description}</p><Button variant="outline" className="mt-9 border-background/45 bg-transparent text-background hover:bg-background hover:text-foreground">{actionLabel}<ArrowRight /></Button></div></section>;
  }

  if (variant === "application") {
    return <section className={cn("border border-border bg-card px-7 py-12 md:px-12 md:py-16", className)}><div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:gap-16"><div><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p><p className="mt-5 max-w-48 text-xs leading-relaxed text-muted-foreground">Practitioner applications are reviewed individually.</p></div><div><h2 className="max-w-3xl font-display text-5xl leading-[0.98] md:text-7xl">{title}</h2><div className="mt-8 border-t border-border pt-7"><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p><Button className="mt-8">{actionLabel}<ArrowRight /></Button></div></div></div></section>;
  }

  return <section className={cn("grid min-h-[28rem] border border-border bg-card md:grid-cols-[1.25fr_0.75fr]", className)}><div className="flex flex-col justify-end p-7 md:p-12"><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p><h2 className="mt-5 max-w-2xl font-display text-5xl leading-[0.98] md:text-7xl">{title}</h2></div><div className="flex flex-col justify-end border-t border-border p-7 md:border-l md:border-t-0 md:p-10"><p className="text-sm leading-relaxed text-muted-foreground">{description}</p><Button className="mt-8 self-start">{actionLabel}<ArrowRight /></Button></div></section>;
}
