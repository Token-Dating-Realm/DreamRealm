/**
 * Profile API Helpers
 *
 * Reusable profile CRUD functions for web and mobile.
 * Accept a typed Supabase client so callers bring their own
 * browser / server / middleware instance.
 */

import type { TypedSupabaseClient } from "./index";
import type { Profile, CreateProfileInput, UpdateProfileInput } from "@dreamrealm/types";
import { updateProfileInputSchema } from "@dreamrealm/types";

export async function getMyProfile(
  client: TypedSupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Profile may not exist yet (new user)
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Profile;
}

export async function createMyProfile(
  client: TypedSupabaseClient,
  input: CreateProfileInput
): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await client
    .from("profiles")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateMyProfile(
  client: TypedSupabaseClient,
  input: UpdateProfileInput
): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const parsed = updateProfileInputSchema.parse(input);

  const { data, error } = await client
    .from("profiles")
    .update(parsed)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
