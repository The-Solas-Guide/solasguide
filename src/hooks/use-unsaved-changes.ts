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

function isSameOriginNavigation(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);
  return url.origin === window.location.origin
    && (url.pathname !== window.location.pathname || url.search !== window.location.search);
}

let unsavedGuardCounter = 0;

export function useUnsavedChanges(isDirty: boolean) {
  const guardNavigation = useCallback(
    () => confirmUnsavedNavigation(isDirty),
    [isDirty],
  );

  useEffect(() => {
    if (!isDirty) return;

    const guardId = `solas-unsaved-${++unsavedGuardCounter}`;
    const originalState = window.history.state;
    const originalUrl = window.location.href;
    const guardState = originalState && typeof originalState === "object"
      ? { ...originalState, __solasUnsavedGuard: guardId }
      : { __solasUnsavedGuard: guardId };
    window.history.pushState(guardState, "", originalUrl);
    let restoringHistory = false;
    let navigationApproved = false;

    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const guardSameOriginLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (target instanceof HTMLAnchorElement && isSameOriginNavigation(target) && !guardNavigation()) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const guardHistoryNavigation = () => {
      if (restoringHistory) {
        restoringHistory = false;
        return;
      }
      if (guardNavigation()) {
        navigationApproved = true;
        window.removeEventListener("popstate", guardHistoryNavigation);
        window.history.back();
        return;
      }
      restoringHistory = true;
      window.history.go(1);
    };

    window.addEventListener("beforeunload", warnBeforeLeave);
    document.addEventListener("click", guardSameOriginLink, true);
    window.addEventListener("popstate", guardHistoryNavigation);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
      document.removeEventListener("click", guardSameOriginLink, true);
      window.removeEventListener("popstate", guardHistoryNavigation);
      if (!navigationApproved && window.history.state?.__solasUnsavedGuard === guardId) {
        window.history.back();
      }
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
