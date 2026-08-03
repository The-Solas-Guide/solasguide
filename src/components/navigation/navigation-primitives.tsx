import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: readonly BreadcrumbItem[]; className?: string }) {
  return <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground", className)}>{items.map((item, index) => <span key={item.label} className="flex items-center gap-2">{index > 0 && <span aria-hidden>/</span>}{item.href ? <a href={item.href} className="hover:text-foreground hover:underline">{item.label}</a> : <span aria-current="page" className="text-foreground">{item.label}</span>}</span>)}</nav>;
}

export function Pagination({ current = 1, total = 5, className }: { current?: number; total?: number; className?: string }) {
  return <nav aria-label="Pagination" className={cn("flex items-center justify-between border-y border-border py-4", className)}><a href="#" className="flex min-h-11 items-center gap-2 text-xs"><ChevronLeft className="size-4" />Previous</a><div className="hidden items-center gap-1 sm:flex">{Array.from({ length: total }).map((_, index) => { const page = index + 1; return <a key={page} href="#" aria-current={page === current ? "page" : undefined} className={cn("grid size-10 place-items-center text-xs", page === current ? "bg-foreground text-background" : "hover:bg-muted")}>{page}</a>; })}</div><a href="#" className="flex min-h-11 items-center gap-2 text-xs">Next<ChevronRight className="size-4" /></a></nav>;
}


