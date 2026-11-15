import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MembershipDisclosure({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("group border-t border-border", className)}>
      <summary
        role="button"
        className="cursor-pointer list-none marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden"
      >
        <span className="flex min-h-12 items-start justify-between gap-4 py-4">
          <span className="text-base leading-7 text-foreground">{title}</span>
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg leading-none text-muted-foreground">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </span>
      </summary>
      <div className="space-y-4 pb-6 text-sm leading-7 text-muted-foreground">{children}</div>
    </details>
  );
}
