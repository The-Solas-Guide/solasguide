import { describe, expect, it } from "vitest";
import {
  parseAdminTableQuery,
  serializeAdminTableQuery,
  type AdminTableQueryState,
} from "@/lib/admin/types";

describe("admin shared types and query helpers", () => {
  it("keeps table state distinct and round-trips it through URL parameters", () => {
    const state: AdminTableQueryState = {
      search: "maya",
      filters: { type: ["area", "location"] },
      status: "published",
      page: 2,
      pageSize: 25,
      sort: { id: "updated_at", direction: "desc" },
    };

    expect(parseAdminTableQuery(new URLSearchParams(serializeAdminTableQuery(state)))).toEqual(state);
  });

  it("normalizes malformed URL state to safe defaults", () => {
    expect(parseAdminTableQuery(new URLSearchParams("page=-2&pageSize=999&sort=bad"))).toEqual({
      search: "",
      filters: {},
      status: "all",
      page: 1,
      pageSize: 50,
      sort: undefined,
    });
  });
});
