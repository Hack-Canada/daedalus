import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

import { safeCallbackUrl } from "@/lib/apply/callback";

const authPages = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/email-verification",
  "/reset-password",
  "/email-verification/new-code",
];

function nextWithPath(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();

  // If the user is authenticated and trying to access an auth page, redirect to dashboard
  if (session?.user?.id && authPages.includes(pathname)) {
    const nextPath = safeCallbackUrl(
      req.nextUrl.searchParams.get("callbackUrl"),
    );
    return NextResponse.redirect(new URL(nextPath, req.url));
  }

  // Allow access to profile pages without authentication
  if (pathname.startsWith("/profile/") && pathname !== "/profile/edit") {
    return nextWithPath(req);
  }

  // Schedule and team invite links are public. The invite page shows only
  // what the share card shows until the visitor signs in.
  if (pathname === "/schedule" || pathname.startsWith("/apply/teams/join/")) {
    return nextWithPath(req);
  }

  // If the user is not authenticated and trying to access a protected route, redirect to login
  if (
    !session?.user?.id &&
    !authPages.includes(pathname) &&
    !pathname.startsWith("/reset-password/")
  ) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Otherwise, allow the request to continue
  return nextWithPath(req);
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!static|favicon.ico|_next|.*\\..*|api|trpc|opengraph-image).*)",
    "/",
  ],
};
