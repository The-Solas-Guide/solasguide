"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { cn } from "@/lib/utils";

const links = [
  { label: "Explore", href: "/#explore" },
  { label: "How it works", href: "/#how-it-works" },
];

export function SiteHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={cn("relative border border-border bg-background", className)}>
      <div className="flex min-h-20 items-center justify-between gap-6 px-5 md:px-7">
        <Link href="/" className="font-display text-2xl leading-none">
          The Solas Guide
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <TrackedPractitionerLink source="header" href="/become-a-practitioner" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            For practitioners
          </TrackedPractitionerLink>
        </nav>
        <div className="hidden lg:block">
          <Button asChild>
            <Link href="/find-a-match">Tell us about your trip</Link>
          </Button>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile navigation" className="grid border-t border-border p-3 lg:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center border-b border-border px-3 text-sm last:border-0"
            >
              {link.label}
            </a>
          ))}
          <TrackedPractitionerLink
            source="mobile-header"
            href="/become-a-practitioner"
            onClickCapture={() => setOpen(false)}
            className="flex min-h-12 items-center border-b border-border px-3 text-sm"
          >
            For practitioners
          </TrackedPractitionerLink>
          <Button asChild className="mt-3">
            <Link href="/find-a-match" onClick={() => setOpen(false)}>
              Tell us about your trip
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
