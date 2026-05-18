/**
 * DreamRealm shared environment configuration.
 *
 * This module centralizes env variable access so every app/package
 * validates required keys at startup and never falls back to silent defaults.
 *
 * TODO: Replace placeholders with actual Supabase project values.
 */

export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export function getEnv(key: RequiredEnvKey): string {
  const value =
    typeof process !== "undefined" && process.env
      ? process.env[key]
      : undefined;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Supabase public URL used by web and mobile clients. */
export const SUPABASE_URL = (): string => getEnv("NEXT_PUBLIC_SUPABASE_URL");

/** Supabase anon key used by web and mobile clients. */
export const SUPABASE_ANON_KEY = (): string =>
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

/** Supabase service role key — ONLY safe in server/Edge Functions. */
export const SUPABASE_SERVICE_ROLE_KEY = (): string =>
  getEnv("SUPABASE_SERVICE_ROLE_KEY");

/** Feature flags for gradual rollouts. */
export const FEATURE_FLAGS = {
  enableDeviceFingerprinting: true,
  enableGeoAnomalyDetection: true,
  enableAIFraudDetection: false,
  enableDreamCoin: false,
  enableStreaming: false,
  enableE2EEncryption: false,
} as const;
