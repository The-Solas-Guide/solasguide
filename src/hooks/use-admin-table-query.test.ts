// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  adminTableQueryReducer,
  defaultAdminTableQuery,
  useAdminTableQuery,
  type AdminTableQueryAction,
} from "@/hooks/use-admin-table-query";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams("q=old&keep=1"),
  router: { replace: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/practitioners",
  useRouter: () => navigation.router,
  useSearchParams: () => navigation.params,
}));

describe("admin table query state", () => {
  it("resets pagination when a search, filter, or status changes", () => {
    const state = { ...defaultAdminTableQuery, page: 4 };
    const actions: AdminTableQueryAction[] = [
      { type: "search", value: "maya" },
      { type: "filter", id: "type", values: ["area"] },
      { type: "status", value: "archived" },
    ];

    for (const action of actions) {
      expect(adminTableQueryReducer(state, action).page).toBe(1);
    }
  });

  it("toggles sort direction and resets to the first page", () => {
    const state = { ...defaultAdminTableQuery, page: 3 };
    const first = adminTableQueryReducer(state, { type: "sort", id: "name" });
    const second = adminTableQueryReducer(first, { type: "sort", id: "name" });
    const third = adminTableQueryReducer(second, { type: "sort", id: "name" });

    expect(first.sort).toEqual({ id: "name", direction: "asc" });
    expect(second.sort).toEqual({ id: "name", direction: "desc" });
    expect(third.sort).toBeUndefined();
    expect(third.page).toBe(1);
  });

  it("resets every URL-backed control", () => {
    expect(
      adminTableQueryReducer(
        {
          search: "maya",
          filters: { type: ["area"] },
          status: "published",
          page: 3,
          pageSize: 25,
          sort: { id: "name", direction: "desc" },
        },
        { type: "reset" },
      ),
    ).toEqual(defaultAdminTableQuery);
  });

  it("uses caller defaults when reset is requested", () => {
    const callerDefaults = { status: "active", pageSize: 25 };
    expect(adminTableQueryReducer({ ...defaultAdminTableQuery, page: 4 }, { type: "reset", defaults: callerDefaults })).toEqual({
      ...defaultAdminTableQuery,
      ...callerDefaults,
    });
  });

  it("hydrates URL changes and preserves unrelated query parameters", () => {
    navigation.params = new URLSearchParams("q=old&keep=1");
    navigation.router.replace.mockClear();
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result, rerender } = renderHook(() =>
      useAdminTableQuery({ status: "active", pageSize: 25 }),
    );

    expect(result.current.state.search).toBe("old");
    act(() => result.current.dispatch({ type: "search", value: "new" }));
    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/admin/practitioners?keep=1&q=new&status=active&pageSize=25",
    );
    expect(navigation.router.replace).not.toHaveBeenCalled();

    navigation.params = new URLSearchParams("q=later&keep=1&status=closed");
    rerender();
    expect(result.current.state.search).toBe("later");
    expect(result.current.state.status).toBe("closed");
    replaceState.mockRestore();
  });
});
