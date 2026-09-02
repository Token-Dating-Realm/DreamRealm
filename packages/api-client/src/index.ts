/**
 * DreamRealm API Client
 *
 * Provides a pre-configured Supabase client with types from @dreamrealm/types.
 * Use `createClient()` for browser / mobile.
 * Use `createServiceClient()` ONLY in server contexts or Edge Functions.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnv, type RequiredEnvKey } from "@dreamrealm/config";
import type { Database } from "./database";

/** Reads a required env key via @dreamrealm/config, softening to "" so callers can warn instead of crash. */
function optionalEnv(key: RequiredEnvKey): string {
  try {
    return getEnv(key);
  } catch {
    return "";
  }
}

const SUPABASE_URL = optionalEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = optionalEnv("SUPABASE_SERVICE_ROLE_KEY");

/** Minimal storage contract Supabase's auth client persists sessions through. */
export interface AuthStorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

export interface CreateClientOptions {
  /** Custom session storage (e.g. an expo-secure-store adapter on native, where `localStorage` doesn't exist). */
  storage?: AuthStorageAdapter;
}

/** Browser/mobile Supabase client with RLS context from the current JWT. */
export function createClient(options?: CreateClientOptions) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn("Supabase URL and Anon Key are not configured. Auth will be unavailable until environment variables are set.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL || "http://localhost", SUPABASE_ANON_KEY || "anon-key", {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: !options?.storage,
      ...(options?.storage ? { storage: options.storage } : {}),
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
export * from "./crypto";
export type { Database } from "./database";
export type TypedSupabaseClient = ReturnType<typeof createClient>;
