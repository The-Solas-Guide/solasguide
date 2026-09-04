const DEFAULT_ADMIN_PATH = "/admin";
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/sign-in",
  "/admin/unauthorized",
]);

export function isSafeAdminReturnPath(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    (value !== "/admin" && !value.startsWith("/admin/"))
  ) {
    return false;
  }
  if (value.startsWith("//") || value.includes("\\")) return false;

  try {
    const parsed = new URL(value, "https://solas.invalid");
    return (
      parsed.origin === "https://solas.invalid" &&
      (parsed.pathname === "/admin" || parsed.pathname.startsWith("/admin/")) &&
      !PUBLIC_ADMIN_PATHS.has(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function getSafeAdminReturnPath(value: unknown) {
  return isSafeAdminReturnPath(value) ? value : DEFAULT_ADMIN_PATH;
}
