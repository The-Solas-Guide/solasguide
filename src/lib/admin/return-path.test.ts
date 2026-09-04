import { describe, expect, it } from "vitest";
import {
  getSafeAdminReturnPath,
  isSafeAdminReturnPath,
} from "@/lib/admin/return-path";

describe("admin return paths", () => {
  it.each([
    "/admin",
    "/admin/practitioners",
    "/admin/customer-enquiries?status=new",
  ])("accepts an internal admin path: %s", (path) => {
    expect(isSafeAdminReturnPath(path)).toBe(true);
    expect(getSafeAdminReturnPath(path)).toBe(path);
  });

  it.each([
    "https://example.com/admin",
    "//example.com/admin",
    "/admin\\example.com",
    "/admin/sign-in",
    "/admin/unauthorized",
    "/administrator",
    "/practitioners",
    null,
  ])("rejects an unsafe return path: %s", (path) => {
    expect(isSafeAdminReturnPath(path)).toBe(false);
    expect(getSafeAdminReturnPath(path)).toBe("/admin");
  });
});
