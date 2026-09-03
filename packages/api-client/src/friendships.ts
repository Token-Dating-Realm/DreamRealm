/**
 * Friendship API Helpers
 *
 * Reusable friend-request CRUD functions for web and mobile, backed by
 * the `friendships` table (018_friendships.sql). Rows are keyed by
 * `public.users.id` (the auth user id), not `profiles.id`.
 * Accept a typed Supabase client so callers bring their own instance.
 */

import type { TypedSupabaseClient } from "./index";
import type { Friendship, FriendshipStatus } from "./database";

export type FriendshipButtonStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends"
  | "blocked";

/** Every friendship row (any status) involving the current user. */
export async function getMyFriendships(
  client: TypedSupabaseClient
): Promise<Friendship[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await client
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userData.user.id},addressee_id.eq.${userData.user.id}`);

  if (error) throw error;
  return (data ?? []) as Friendship[];
}

/** Accepted friendships involving the current user. */
export async function getMyFriends(client: TypedSupabaseClient): Promise<Friendship[]> {
  const all = await getMyFriendships(client);
  return all.filter((f) => f.status === "accepted");
}

/** Determine the friendship-button state between the current user and another user (by auth user id). */
export async function getFriendshipStatus(
  client: TypedSupabaseClient,
  otherUserId: string
): Promise<{ status: FriendshipButtonStatus; friendshipId: string | null }> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user || userData.user.id === otherUserId) {
    return { status: "none", friendshipId: null };
  }

  const { data, error } = await client
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${userData.user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${userData.user.id})`
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) return { status: "none", friendshipId: null };

  const row = data as Friendship;
  if (row.status === "accepted") return { status: "friends", friendshipId: row.id };
  if (row.status === "blocked") return { status: "blocked", friendshipId: row.id };
  if (row.status === "pending") {
    return {
      status: row.requester_id === userData.user.id ? "pending_sent" : "pending_received",
      friendshipId: row.id,
    };
  }
  return { status: "none", friendshipId: row.id };
}

export async function sendFriendRequest(
  client: TypedSupabaseClient,
  addresseeId: string
): Promise<Friendship> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await client
    .from("friendships")
    .insert({ requester_id: userData.user.id, addressee_id: addresseeId, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return data as Friendship;
}

export async function respondToFriendRequest(
  client: TypedSupabaseClient,
  friendshipId: string,
  status: Extract<FriendshipStatus, "accepted" | "declined" | "blocked">
): Promise<Friendship> {
  const { data, error } = await (client.from("friendships") as any)
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data as Friendship;
}

export async function removeFriendship(
  client: TypedSupabaseClient,
  friendshipId: string
): Promise<void> {
  const { error } = await client.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}
