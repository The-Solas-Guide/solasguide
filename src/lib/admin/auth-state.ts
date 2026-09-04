export type AdminAuthActionState = {
  status: "idle" | "code-sent" | "error";
  message?: string;
  email?: string;
};

export const initialAdminAuthState: AdminAuthActionState = {
  status: "idle",
};

export function normalizeAdminEmail(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function normalizeAdminCode(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const code = value.trim();
  return /^\d{6}$/.test(code) ? code : null;
}
