import { describe, expect, it } from "vitest";
import {
  normalizeAdminCode,
  normalizeAdminEmail,
} from "@/lib/admin/auth-state";

describe("admin auth input", () => {
  it("normalizes a valid email", () => {
    expect(normalizeAdminEmail(" Admin@Example.com ")).toBe(
      "admin@example.com",
    );
  });

  it("rejects invalid email and code values", () => {
    expect(normalizeAdminEmail("invalid")).toBeNull();
    expect(normalizeAdminCode("12345")).toBeNull();
    expect(normalizeAdminCode("12345a")).toBeNull();
  });

  it("accepts a six-digit code", () => {
    expect(normalizeAdminCode(" 123456 ")).toBe("123456");
  });
});
