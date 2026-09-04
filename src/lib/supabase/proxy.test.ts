import { describe, expect, it } from "vitest";
import { isSupabaseSessionCookie } from "@/lib/supabase/proxy";

describe("Supabase session cookie detection", () => {
  it("accepts session tokens and their chunks", () => {
    expect(isSupabaseSessionCookie("sb-project-auth-token", "value")).toBe(true);
    expect(isSupabaseSessionCookie("sb-project-auth-token.1", "value")).toBe(true);
  });

  it("rejects PKCE verifier and empty cookies", () => {
    expect(
      isSupabaseSessionCookie("sb-project-auth-token-code-verifier", "value"),
    ).toBe(false);
    expect(isSupabaseSessionCookie("sb-project-auth-token", "")).toBe(false);
  });
});
