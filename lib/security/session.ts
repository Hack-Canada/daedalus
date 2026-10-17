import type { JWT } from "next-auth/jwt";

import type { User } from "@/lib/db/schema";

export function refreshSessionToken(
  token: JWT,
  user: User | null | undefined,
  authenticatedVersion?: number,
): JWT | null {
  if (!token.sub || !user) return null;
  const version = authenticatedVersion ?? token.sessionVersion;
  // Missing versions are old sessions, never silently upgrade their authority.
  if (!Number.isSafeInteger(version) || version !== user.sessionVersion)
    return null;
  return {
    ...token,
    sessionVersion: version,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.applicationStatus,
  };
}
