import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, actionLabel, className }: { title: string; description: string; actionLabel: string; className?: string }) {
  return <div className={cn("flex min-h-72 flex-col items-center justify-center border border-border p-8 text-center", className)}><span className="grid size-12 place-items-center rounded-full bg-muted"><Search className="size-5" /></span><h3 className="mt-6 font-display text-3xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p><Button variant="outline" className="mt-7">{actionLabel}</Button></div>;
}

export function LoadingCardGrid({ count = 3, className }: { count?: number; className?: string }) {
  return <div aria-label="Loading results" className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>{Array.from({ length: count }).map((_, index) => <div key={index} className="border border-border"><div className="aspect-[4/3] animate-pulse bg-muted" /><div className="space-y-3 p-5"><div className="h-3 w-1/3 animate-pulse bg-muted" /><div className="h-7 w-2/3 animate-pulse bg-muted" /><div className="h-3 w-full animate-pulse bg-muted" /><div className="h-3 w-4/5 animate-pulse bg-muted" /></div></div>)}</div>;
}
