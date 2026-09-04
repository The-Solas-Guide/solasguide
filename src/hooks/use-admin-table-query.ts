"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  adminTableQueryKey,
  defaultAdminTableQuery,
  parseAdminTableQuery,
  serializeAdminTableQuery,
  type AdminTableQueryState,
} from "@/lib/admin/types";

export type AdminTableQueryAction =
  | { type: "search"; value: string }
  | { type: "filter"; id: string; values: string[] }
  | { type: "status"; value: string }
  | { type: "page"; value: number }
  | { type: "page-size"; value: number }
  | { type: "sort"; id: string }
  | { type: "reset" };

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
      return { ...defaultAdminTableQuery };
  }
}

export function useAdminTableQuery(
  defaults: Partial<AdminTableQueryState> = {},
) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(
    () =>
      parseAdminTableQuery(
        new URLSearchParams(searchParams.toString()),
        { ...defaultAdminTableQuery, ...defaults },
      ),
    [defaults, searchParams],
  );
  const [state, dispatch] = useReducer(adminTableQueryReducer, initial);

  useEffect(() => {
    const query = serializeAdminTableQuery(state);
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    if (adminTableQueryKey(state) !== searchParams.toString()) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams, state]);

  const update = useCallback((action: AdminTableQueryAction) => dispatch(action), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return { state, dispatch: update, reset };
}
