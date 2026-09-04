import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { isSafeAdminReturnPath } from "@/lib/admin/return-path";

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export function isSupabaseSessionCookie(name: string, value: string) {
  return Boolean(value) && /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabasePublicConfig();
  const hadSessionCookie = request.cookies
    .getAll()
    .some(({ name, value }) => isSupabaseSessionCookie(name, value));

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const pathname = request.nextUrl.pathname;
  const isPublicAdminRoute = pathname === "/admin/sign-in";

  if (!data?.claims || error) {
    if (isPublicAdminRoute) return response;

    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/admin/sign-in";
    signInUrl.search = "";

    const requestedPath = `${pathname}${request.nextUrl.search}`;
    if (isSafeAdminReturnPath(requestedPath)) {
      signInUrl.searchParams.set("next", requestedPath);
    }
    if (hadSessionCookie) signInUrl.searchParams.set("reason", "expired");

    return copyResponseCookies(response, NextResponse.redirect(signInUrl));
  }

  return response;
}
