/**
 * Supabase OAuth / Email-link Callback Route
 *
 * Handles the redirect back from Supabase Auth (OAuth providers and
 * magic-link / signup email confirmations). Exchanges the `code` query
 * param for a session, then routes the user to onboarding if they have
 * no profile yet, or to the feed otherwise.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const destination = profile ? "/feed" : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Auth failed or no code — send back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
