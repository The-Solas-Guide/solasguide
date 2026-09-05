"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import { adminNavigation } from "@/components/admin/admin-navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  const pathname = usePathname();
  const section = adminNavigation.find((item) => item.href !== "/admin" && pathname.startsWith(item.href));
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-5 md:px-8">
      <SidebarTrigger className="-ml-1" />
      <span className="h-4 border-l" aria-hidden="true" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">Workspace</Link>
        <ChevronRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-medium">{section?.title ?? "Overview"}</span>
      </nav>
      <Link href="/" target="_blank" rel="noreferrer" className="ml-auto flex min-h-11 shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <span className="hidden sm:inline">View website</span>
        <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        <span className="sr-only sm:hidden">View website</span>
      </Link>
    </header>
  );
}
