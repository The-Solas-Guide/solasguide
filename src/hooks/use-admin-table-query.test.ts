import { describe, expect, it } from "vitest";
import {
  adminTableQueryReducer,
  defaultAdminTableQuery,
  type AdminTableQueryAction,
} from "@/hooks/use-admin-table-query";

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
});
