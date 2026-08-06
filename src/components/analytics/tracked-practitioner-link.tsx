"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type TrackedPractitionerLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  children: ReactNode;
  source: "header" | "mobile-header" | "footer" | "homepage" | "landing";
};

export function TrackedPractitionerLink({ children, source, ...props }: TrackedPractitionerLinkProps) {
  return (
    <Link
      onClick={() => window.gtag?.("event", "practitioner_interest_cta_clicked", { source })}
      {...props}
    >
      {children}
    </Link>
  );
}
