import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestAdminCode,
  signOutAdmin,
  verifyAdminCode,
} from "@/lib/admin/auth-actions";
import { initialAdminAuthState } from "@/lib/admin/auth-state";

const mocks = vi.hoisted(() => {
  const signInWithOtp = vi.fn();
  const verifyOtp = vi.fn();
  const signOut = vi.fn();
  const maybeSingle = vi.fn();
  const redirect = vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  });

  return {
    signInWithOtp,
    verifyOtp,
    signOut,
    maybeSingle,
    redirect,
    client: {
      auth: { signInWithOtp, verifyOtp, signOut },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle })),
        })),
      })),
    },
  };
});

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => mocks.client),
}));

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("admin auth actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.signInWithOtp.mockResolvedValue({ error: null });
    mocks.verifyOtp.mockResolvedValue({
      data: { user: { id: "admin-user" } },
      error: null,
    });
    mocks.maybeSingle.mockResolvedValue({
      data: { user_id: "admin-user" },
      error: null,
    });
  });

  it("requests an OTP without allowing account creation", async () => {
    const result = await requestAdminCode(
      initialAdminAuthState,
      formData({ email: "Admin@Example.com" }),
    );

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: "admin@example.com",
      options: { shouldCreateUser: false },
    });
    expect(result.status).toBe("code-sent");
  });

  it("uses the same response when the account does not exist", async () => {
    mocks.signInWithOtp.mockResolvedValue({
      error: { code: "user_not_found" },
    });

    const result = await requestAdminCode(
      initialAdminAuthState,
      formData({ email: "unknown@example.com" }),
    );

    expect(result.status).toBe("code-sent");
    expect(result.message).not.toContain("unknown");
  });

  it("uses the same response for rate limits", async () => {
    mocks.signInWithOtp.mockResolvedValue({
      error: { code: "over_email_send_rate_limit" },
    });

    const result = await requestAdminCode(
      initialAdminAuthState,
      formData({ email: "admin@example.com" }),
    );

    expect(result.status).toBe("code-sent");
    expect(result.message).toBe(
      "If this email is approved, a six-digit code has been sent.",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Admin OTP request failed.",
      "over_email_send_rate_limit",
    );
  });

  it("rejects an expired OTP", async () => {
    mocks.verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { code: "otp_expired" },
    });

    const result = await verifyAdminCode(
      initialAdminAuthState,
      formData({ email: "admin@example.com", code: "123456" }),
    );

    expect(result).toMatchObject({
      status: "error",
      message: "That code is invalid or expired. Request a new code and try again.",
    });
  });

  it("sends approved administrators to a safe requested route", async () => {
    await expect(
      verifyAdminCode(
        initialAdminAuthState,
        formData({
          email: "admin@example.com",
          code: "123456",
          nextPath: "/admin/practitioners",
        }),
      ),
    ).rejects.toThrow("redirect:/admin/practitioners");
  });

  it("sends non-administrators to the unauthorized page", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(
      verifyAdminCode(
        initialAdminAuthState,
        formData({
          email: "user@example.com",
          code: "123456",
          nextPath: "/admin",
        }),
      ),
    ).rejects.toThrow("redirect:/admin/unauthorized");
  });

  it("signs out before returning to sign-in", async () => {
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(signOutAdmin()).rejects.toThrow("redirect:/admin/sign-in");
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
});
