import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

export async function isAdminUser(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function requireAdmin(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/admin/sign-in");

  if (!(await isAdminUser(user.id))) redirect("/admin/unauthorized");
  return user;
}
