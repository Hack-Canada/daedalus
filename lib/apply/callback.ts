const BLOCKED = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/email-verification",
];

const APPLY = "/apply";

/** Same-origin path only. A missing, blocked, or dashboard-home callback opens apply. */
export function safeCallbackUrl(value: string | null | undefined) {
  if (
    !value ||
    value === "/" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://")
  ) {
    return APPLY;
  }

  const path = value.split("?")[0];
  if (
    path === "/" ||
    BLOCKED.some((page) => path === page || path.startsWith(`${page}/`))
  ) {
    return APPLY;
  }

  return value;
}
