/**
 * Realms API Helpers
 *
 * Reusable fetch/join/leave functions for the `realms` and
 * `realm_members` tables (023_realms.sql).
 * Accept a typed Supabase client so callers bring their own instance.
 */

import type { TypedSupabaseClient } from "./index";
import type { Realm, RealmMember } from "./database";

export async function getRealms(client: TypedSupabaseClient): Promise<Realm[]> {
  const { data, error } = await client
    .from("realms")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("member_count", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Realm[];
}

export async function getRealmBySlug(
  client: TypedSupabaseClient,
  slug: string
): Promise<Realm | null> {
  const { data, error } = await client
    .from("realms")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as Realm | null) ?? null;
}

/** Realm ids the current user has joined. */
export async function getMyRealmMemberships(
  client: TypedSupabaseClient
): Promise<RealmMember[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await client
    .from("realm_members")
    .select("*")
    .eq("user_id", userData.user.id);

  if (error) throw error;
  return (data ?? []) as RealmMember[];
}

export async function joinRealm(
  client: TypedSupabaseClient,
  realmId: string
): Promise<void> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { error } = await client
    .from("realm_members")
    .insert({ realm_id: realmId, user_id: userData.user.id });

  if (error) throw error;
}

export async function leaveRealm(
  client: TypedSupabaseClient,
  realmId: string
): Promise<void> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { error } = await client
    .from("realm_members")
    .delete()
    .eq("realm_id", realmId)
    .eq("user_id", userData.user.id);

  if (error) throw error;
}
