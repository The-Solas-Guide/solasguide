"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  adminTableQueryKey,
  defaultAdminTableQuery,
  mergeAdminTableQueryParams,
  parseAdminTableQuery,
  type AdminTableQueryState,
} from "@/lib/admin/types";

export type AdminTableQueryAction =
  | { type: "search"; value: string }
  | { type: "filter"; id: string; values: string[] }
  | { type: "status"; value: string }
  | { type: "page"; value: number }
  | { type: "page-size"; value: number }
  | { type: "sort"; id: string }
  | { type: "reset"; defaults?: Partial<AdminTableQueryState> }
  | { type: "hydrate"; state: AdminTableQueryState };

export const defaultAdminTableQueryState = defaultAdminTableQuery;
export { defaultAdminTableQuery };

export function adminTableQueryReducer(
  state: AdminTableQueryState,
  action: AdminTableQueryAction,
): AdminTableQueryState {
  switch (action.type) {
    case "search":
      return { ...state, search: action.value, page: 1 };
    case "filter":
      return {
        ...state,
        filters: { ...state.filters, [action.id]: action.values },
        page: 1,
      };
    case "status":
      return { ...state, status: action.value, page: 1 };
    case "page":
      return { ...state, page: Math.max(1, action.value) };
    case "page-size":
      return { ...state, pageSize: [10, 25, 50, 100].includes(action.value) ? action.value : 50, page: 1 };
    case "sort": {
      if (state.sort?.id !== action.id) {
        return { ...state, sort: { id: action.id, direction: "asc" }, page: 1 };
      }
      if (state.sort.direction === "asc") {
        return { ...state, sort: { id: action.id, direction: "desc" }, page: 1 };
      }
      return { ...state, sort: undefined, page: 1 };
    }
    case "reset":
      return {
        ...defaultAdminTableQuery,
        ...action.defaults,
        filters: { ...defaultAdminTableQuery.filters, ...action.defaults?.filters },
      };
    case "hydrate":
      return action.state;
  }
}

export function useAdminTableQuery(
  defaults: Partial<AdminTableQueryState> = {},
) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callerDefaults = useMemo(
    () => ({ ...defaultAdminTableQuery, ...defaults, filters: { ...defaultAdminTableQuery.filters, ...defaults.filters } }),
    [defaults],
  );
  const initial = useMemo(
    () =>
      parseAdminTableQuery(
        new URLSearchParams(searchParams.toString()),
        callerDefaults,
      ),
    [callerDefaults, searchParams],
  );
  const [state, dispatch] = useReducer(adminTableQueryReducer, initial);
  const lastUrlKey = useRef(adminTableQueryKey(initial));
  const pendingUrlKey = useRef<string | null>(null);
  const urlState = useMemo(
    () => parseAdminTableQuery(new URLSearchParams(searchParams.toString()), callerDefaults),
    [callerDefaults, searchParams],
  );

  useEffect(() => {
    const incomingKey = adminTableQueryKey(urlState);
    const stateKey = adminTableQueryKey(state);
    if (incomingKey !== lastUrlKey.current) {
      lastUrlKey.current = incomingKey;
      if (pendingUrlKey.current !== incomingKey && incomingKey !== stateKey) {
        dispatch({ type: "hydrate", state: urlState });
      }
      pendingUrlKey.current = null;
      return;
    }
    if (stateKey !== incomingKey && pendingUrlKey.current !== stateKey) {
      const query = mergeAdminTableQueryParams(
        new URLSearchParams(searchParams.toString()),
        state,
      ).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      pendingUrlKey.current = stateKey;
    }
  }, [pathname, router, searchParams, state, urlState]);

  const update = useCallback((action: AdminTableQueryAction) => dispatch(action), []);
  const reset = useCallback(() => dispatch({ type: "reset", defaults }), [defaults]);

  return { state, dispatch: update, reset };
}
