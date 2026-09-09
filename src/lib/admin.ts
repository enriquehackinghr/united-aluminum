export const ADMIN_EMAILS = ["enrique@hackinghr.io", "lisa@unitedalum.com"] as const;

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function isAdminEmail(email: string | null | undefined) {
  return ADMIN_EMAILS.includes(normalizeEmail(email) as (typeof ADMIN_EMAILS)[number]);
}

export function safeAuthRedirect(email: string | null | undefined, nextPath?: string | null) {
  if (nextPath === "/admin" && isAdminEmail(email)) {
    return "/admin";
  }

  if (isAdminEmail(email)) {
    return "/admin";
  }

  return "/account";
}
