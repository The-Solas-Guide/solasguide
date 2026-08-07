"use client";

import Image from "next/image";
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
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 md:gap-6 md:px-7">
        <Link
          href="/"
          className="min-w-0 font-display text-xl leading-none tracking-tight sm:text-2xl"
        >
          <span className="flex items-center gap-2">
            <Image
              src="/brand/solas-mark-pebble.png"
              alt=""
              width={32}
              height={30}
              className="h-7 w-8 shrink-0 object-contain"
            />
            <span>The Solas Guide</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <TrackedPractitionerLink
            source="header"
            href="/become-a-practitioner"
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-foreground"
          >
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
          className="grid size-11 shrink-0 place-items-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="grid border-t border-border p-3 lg:hidden"
        >
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
          <Button asChild className="mt-3 w-full">
            <Link href="/find-a-match" onClick={() => setOpen(false)}>
              Tell us about your trip
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
