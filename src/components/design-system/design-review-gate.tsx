"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ThemeReviewControl } from "@/components/design-system/theme-review-control";

/**
 * Temporary client-review gate. Add `?design` to any public URL to surface the
 * floating theme controls without needing the internal /design-system route.
 */
export function DesignReviewGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const designMode = searchParams.has("design");

  // /design-system already mounts its own full control surface.
  if (pathname === "/design-system" || !designMode) {
    return null;
  }

  return <ThemeReviewControl full defaultOpen />;
}
