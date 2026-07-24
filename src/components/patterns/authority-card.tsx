import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AuthorityCardProps = { eyebrow: ReactNode; title: ReactNode; description?: string; variant?: "standard" | "quote"; className?: string };

export function AuthorityCard({ eyebrow, title, description, variant = "standard", className }: AuthorityCardProps) {
  return <article className={cn("border border-border p-7", className)}><div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</div>{variant === "quote" ? <blockquote className="mt-12 border-l-2 border-accent pl-5 font-display text-2xl italic">{title}</blockquote> : <p className="mt-12 font-display text-2xl">{title}</p>}{description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}</article>;
}
