"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "About", href: "/web#about" },
  { label: "How it works", href: "/web#how-it-works" },
  { label: "For practitioners", href: "/web#practitioners" },
];

export function SiteHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={cn("relative border border-border bg-background", className)}>
      <div className="flex min-h-20 items-center justify-between gap-6 px-5 md:px-7">
        <Link href="/web" className="font-display text-2xl leading-none">
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
        </nav>
        <div className="hidden lg:block">
          <Button asChild>
            <a href="/web#start">Start an enquiry</a>
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
          <Button asChild className="mt-3">
            <a href="/web#start" onClick={() => setOpen(false)}>
              Start an enquiry
            </a>
          </Button>
        </nav>
      )}
    </header>
  );
}
