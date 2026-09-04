"use server";

import { redirect } from "next/navigation";
import {
  normalizeAdminCode,
  normalizeAdminEmail,
  type AdminAuthActionState,
} from "@/lib/admin/auth-state";
import { getSafeAdminReturnPath } from "@/lib/admin/return-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const genericCodeSentMessage =
  "If this email is approved, a six-digit code has been sent.";

export async function requestAdminCode(
  _previousState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const email = normalizeAdminEmail(formData.get("email"));
  if (!email) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    console.error("Admin OTP request failed.", error.code ?? "unknown_error");
  }

  return {
    status: "code-sent",
    message: genericCodeSentMessage,
    email,
  };
}

export async function verifyAdminCode(
  _previousState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const email = normalizeAdminEmail(formData.get("email"));
  const token = normalizeAdminCode(formData.get("code"));

  if (!email || !token) {
    return {
      status: "error",
      message: "Enter the six-digit code from your email.",
      email: email ?? undefined,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "That code is invalid or expired. Request a new code and try again.",
      email,
    };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    redirect("/admin/unauthorized");
  }

  redirect(getSafeAdminReturnPath(formData.get("nextPath")));
}

export async function signOutAdmin() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/sign-in");
}
