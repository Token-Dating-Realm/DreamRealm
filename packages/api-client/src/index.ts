/**
 * DreamRealm API Client
 *
 * Provides a pre-configured Supabase client with types from @dreamrealm/types.
 * Use `createClient()` for browser / mobile.
 * Use `createServiceClient()` ONLY in server contexts or Edge Functions.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";

// TODO: Replace with actual project credentials via @dreamrealm/config
const SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
const SUPABASE_ANON_KEY = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

/** Browser/mobile Supabase client with RLS context from the current JWT. */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn("Supabase URL and Anon Key are not configured. Auth will be unavailable until environment variables are set.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL || "http://localhost", SUPABASE_ANON_KEY || "anon-key", {
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
    // eslint-disable-next-line no-console
    console.warn("Supabase URL or Service Role Key are not configured. Service client will be unavailable until environment variables are set.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL || "http://localhost", SUPABASE_SERVICE_ROLE_KEY || "service-key", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
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
