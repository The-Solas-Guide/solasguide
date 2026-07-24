"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DiscoveryControlsProps = {
  modalities: readonly string[];
  locations: readonly string[];
  resultCount: number;
  className?: string;
};

export function DiscoveryControls({ modalities, locations, resultCount, className }: DiscoveryControlsProps) {
  const [selected, setSelected] = useState<string[]>(modalities.slice(0, 2));
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle(item: string) {
    setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  const filters = <div className="flex flex-wrap gap-2">{modalities.map((item) => {
    const active = selected.includes(item);
    return <button key={item} type="button" aria-pressed={active} onClick={() => toggle(item)} className={cn("min-h-9 rounded-full border px-4 text-xs transition-colors", active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/50")}>{item}</button>;
  })}</div>;

  return <div className={cn("border border-border bg-card", className)}>
    <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(14rem,1fr)_minmax(9rem,0.45fr)_minmax(9rem,0.45fr)_auto] md:p-5">
      <label className="relative"><span className="sr-only">Search the guide</span><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-10" placeholder="Search practitioners or practices" /></label>
      <label><span className="sr-only">Location</span><select className="h-11 w-full border border-input bg-background px-3 text-sm"><option>All locations</option>{locations.map((location) => <option key={location}>{location}</option>)}</select></label>
      <label><span className="sr-only">Sort results</span><select className="h-11 w-full border border-input bg-background px-3 text-sm"><option>Curated order</option><option>Most experienced</option><option>Alphabetical</option></select></label>
      <Button type="button" variant="outline" className="h-11 md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}><SlidersHorizontal data-icon="inline-start" />Filters</Button>
    </div>
    <div className="hidden p-5 md:block">{filters}</div>
    {mobileOpen && <div className="border-b border-border p-4 md:hidden">{filters}</div>}
    <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 md:px-5">
      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{resultCount}</span> results</p>
      <div className="flex flex-wrap items-center justify-end gap-2">{selected.map((item) => <button key={item} type="button" onClick={() => toggle(item)} className="flex min-h-8 items-center gap-1.5 rounded-full bg-muted px-3 text-[11px]">{item}<X className="size-3" /></button>)}{selected.length > 0 && <button type="button" onClick={() => setSelected([])} className="min-h-8 px-2 text-[11px] text-muted-foreground underline-offset-4 hover:underline">Clear all</button>}</div>
    </div>
  </div>;
}
