"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes. Leave without saving?";

export function confirmUnsavedNavigation(
  isDirty: boolean,
  confirmFn: (message: string) => boolean = (message) => window.confirm(message),
) {
  return !isDirty || confirmFn(UNSAVED_CHANGES_MESSAGE);
}

function isAdminAnchor(anchor: HTMLAnchorElement) {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  return url.origin === window.location.origin
    && (url.pathname === "/admin" || url.pathname.startsWith("/admin/"))
    && (url.pathname !== window.location.pathname || url.search !== window.location.search);
}

export function useUnsavedChanges(isDirty: boolean) {
  const guardNavigation = useCallback(
    () => confirmUnsavedNavigation(isDirty),
    [isDirty],
  );

  useEffect(() => {
    if (!isDirty) return;

    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const guardAdminLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (target instanceof HTMLAnchorElement && isAdminAnchor(target) && !guardNavigation()) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", warnBeforeLeave);
    document.addEventListener("click", guardAdminLink, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
      document.removeEventListener("click", guardAdminLink, true);
    };
  }, [guardNavigation, isDirty]);

  return { guardNavigation };
}

export function useGuardedAdminNavigation(isDirty: boolean) {
  const router = useRouter();
  const { guardNavigation } = useUnsavedChanges(isDirty);
  const navigate = useCallback(
    (href: string) => {
      if (guardNavigation()) router.push(href);
    },
    [guardNavigation, router],
  );
  return { navigate };
}
