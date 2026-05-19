/**
 * Supabase SSR Middleware
 *
 * Uses @supabase/ssr for cookie-based session management.
 * Refreshes sessions automatically and injects the refreshed
 * session cookie into the response so the client stays authenticated.
 *
 * Public paths are allowed without a session.
 * All other paths require a valid Supabase Auth session.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/realms", "/hub", "/feed", "/"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow static assets and public pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return response;
  }

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/realms/");
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but on an auth page, redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|api).*)"],
};
