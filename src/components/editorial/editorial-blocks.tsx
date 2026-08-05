import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EditorialIntro({ eyebrow, title, children, className }: { eyebrow: string; title: string; children: ReactNode; className?: string }) {
  return <section className={cn("grid gap-7 border-y border-border py-10 md:grid-cols-[0.8fr_1.2fr] md:py-14", className)}><div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p><h3 className="mt-5 font-display text-3xl md:text-4xl">{title}</h3></div><div className="max-w-2xl text-base leading-8 text-muted-foreground">{children}</div></section>;
}

export function CuratorsNote({ children, author = "The Solas Guide editorial team", className }: { children: ReactNode; author?: string; className?: string }) {
  return <aside className={cn("border-l-2 border-accent bg-muted/40 p-7 md:p-9", className)}><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Curator&apos;s note</p><div className="mt-5 font-display text-2xl leading-snug">{children}</div><p className="mt-6 text-xs text-muted-foreground">{author}</p></aside>;
}

export function FactPanel({ title, facts, className }: { title: string; facts: readonly { label: string; value: string }[]; className?: string }) {
  return <aside className={cn("border border-border", className)}><p className="border-b border-border p-5 text-xs font-medium uppercase tracking-[0.16em]">{title}</p><dl>{facts.map((fact) => <div key={fact.label} className="grid grid-cols-[0.8fr_1.2fr] gap-5 border-b border-border p-5 last:border-0"><dt className="text-xs text-muted-foreground">{fact.label}</dt><dd className="text-sm">{fact.value}</dd></div>)}</dl></aside>;
}

export function FaqList({ items, className }: { items: readonly { question: string; answer: string }[]; className?: string }) {
  return <div className={cn("border-t border-border", className)}>{items.map((item) => <details key={item.question} className="group border-b border-border"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-sm font-medium marker:hidden">{item.question}<span className="text-lg font-light transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted-foreground">{item.answer}</p></details>)}</div>;
}

export function DisclosurePanel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return <aside className={cn("border border-border bg-muted/35 p-6", className)}><p className="text-xs font-medium uppercase tracking-[0.16em]">{title}</p><div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div></aside>;
}
