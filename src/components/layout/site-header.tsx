"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-marks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteHeaderProps = { className?: string };

const links = [
  { label: "Find a Practitioner", href: "/find-a-practitioner" },
  { label: "Find a Venue", href: "/find-a-venue" },
  { label: "Workshops & Events", href: "/events-workshops" },
  { label: "Become a Practitioner", href: "/become-a-practitioner" },
];

export function SiteHeader({ className }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  return <header className={cn("relative border border-border bg-background", className)}><div className="flex min-h-20 items-center justify-between gap-6 px-5 md:px-7"><Link href="/" aria-label="The Solas Guide home" className="shrink-0"><BrandWordmark className="min-h-0 justify-start p-0 [&_p:first-child]:text-2xl" /></Link><nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">{links.slice(0, 3).map((link) => <a key={link.label} href={link.href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">{link.label}</a>)}</nav><div className="hidden items-center gap-3 lg:flex"><Button variant="ghost" asChild><a href={links[3].href}>{links[3].label}</a></Button><Button asChild><a href="/find-a-practitioner">Get Started</a></Button></div><button type="button" className="grid size-11 place-items-center lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>{open && <nav aria-label="Mobile navigation" className="grid border-t border-border p-3 lg:hidden">{links.map((link) => <a key={link.label} href={link.href} className="flex min-h-12 items-center border-b border-border px-3 text-sm last:border-0">{link.label}</a>)}<Button className="mt-3" asChild><a href="/find-a-practitioner">Get Started</a></Button></nav>}</header>;
}
