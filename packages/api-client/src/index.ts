/**
 * DreamRealm API Client
 *
 * Provides a pre-configured Supabase client with types from @dreamrealm/types.
 * Use `createClient()` for browser / mobile.
 * Use `createServiceClient()` ONLY in server contexts or Edge Functions.
 */

import { createClient as createSupabaseClient, createServerClient } from "@supabase/supabase-js";
import type { Database } from "./database";

// TODO: Replace with actual project credentials via @dreamrealm/config
const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
const SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

/** Browser/mobile Supabase client with RLS context from the current JWT. */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and Anon Key must be configured.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/** Server-side / Edge Function Supabase client with service role (bypasses RLS). */
export function createServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL and Service Role Key must be configured.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Next.js middleware-compatible server client (requires cookie storage). */
export function createMiddlewareClient(request: Request, response: Response) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and Anon Key must be configured.");
  }
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        // @ts-expect-error — cookie parsing handled by caller
        return request.headers.get("cookie")?.split("; ").map((c) => {
          const [name, value] = c.split("=");
          return { name: name ?? "", value: value ?? "" };
        }) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.headers.append("Set-Cookie", `${name}=${value}; ${Object.entries(options ?? {}).map(([k, v]) => `${k}=${v}`).join("; ")}`);
        });
      },
    },
  });
}

export * from "./database";
export * from "./fingerprint";
export * from "./profile";
export * from "./messaging";
export * from "./matching";
export type { Database } from "./database";
export type TypedSupabaseClient = ReturnType<typeof createClient>;
