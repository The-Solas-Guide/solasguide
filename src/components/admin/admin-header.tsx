"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/80 px-5 md:px-8">
      <SidebarTrigger className="-ml-1" />
      <p className="text-sm text-muted-foreground md:hidden">The Solas Guide</p>
    </header>
  );
}
