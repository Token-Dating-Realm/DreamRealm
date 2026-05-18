/**
 * Matching API Helpers
 *
 * Reusable swipe engine and geo discovery functions for web and mobile.
 * Accept a typed Supabase client so callers bring their own instance.
 *
 * TODO: Add AI recommendation scoring and trust-based filtering.
 * TODO: Exclude already-swiped profiles from nearby feed.
 */

import type { TypedSupabaseClient } from "./index";
import type { Profile, Match, MatchDirection, ProfileMode } from "@dreamrealm/types";

export interface NearbyFilter {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  lookingFor?: ProfileMode[];
  limit?: number;
}

export interface MatchWithProfile extends Match {
  target_profile?: Profile | null;
}

export async function getNearbyProfiles(
  client: TypedSupabaseClient,
  filter: NearbyFilter
): Promise<Profile[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: myProfile } = await client
    .from("profiles")
    .select("id, latitude, longitude, looking_for, mode")
    .eq("user_id", userData.user.id)
    .single();

  if (!myProfile) return [];

  const radius = filter.radiusKm ?? 50;
  const limit = filter.limit ?? 20;

  // Use PostGIS ST_DWithin for geo-filtering.
  // Exclude self and inactive/flagged profiles.
  const { data, error } = await client.rpc("nearby_profiles", {
    p_latitude: filter.latitude,
    p_longitude: filter.longitude,
    p_radius_meters: radius * 1000,
    p_exclude_profile_id: myProfile.id,
    p_limit: limit,
  });

  if (error) {
    // Fallback: if RPC not available, do basic bounding-box query
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((filter.latitude * Math.PI) / 180));

    const { data: fallback, error: fallbackError } = await client
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .neq("id", myProfile.id)
      .gte("latitude", filter.latitude - latDelta)
      .lte("latitude", filter.latitude + latDelta)
      .gte("longitude", filter.longitude - lngDelta)
      .lte("longitude", filter.longitude + lngDelta)
      .limit(limit);

    if (fallbackError) throw fallbackError;
    return (fallback ?? []) as Profile[];
  }

  return (data ?? []) as Profile[];
}

export async function recordSwipe(
  client: TypedSupabaseClient,
  targetProfileId: string,
  direction: MatchDirection
): Promise<{ match: Match | null; isMutual: boolean }> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: myProfile } = await client
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (!myProfile) throw new Error("No profile found");

  const actorId = myProfile.id as string;

  // Insert swipe record; RLS ensures actor_id === my profile id
  const { data: matchRow, error } = await client
    .from("matches")
    .insert({
      actor_id: actorId,
      target_id: targetProfileId,
      direction,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  // Check if the target already swiped right/super on me
  const { data: mutual } = await client
    .from("matches")
    .select("*")
    .eq("actor_id", targetProfileId)
    .eq("target_id", actorId)
    .in("direction", ["right", "super"])
    .eq("status", "pending")
    .maybeSingle();

  if (mutual && (direction === "right" || direction === "super")) {
    // Update both rows to matched
    await client
      .from("matches")
      .update({ status: "matched" })
      .eq("id", matchRow.id);

    await client
      .from("matches")
      .update({ status: "matched" })
      .eq("id", mutual.id);

    return { match: { ...matchRow, status: "matched" } as Match, isMutual: true };
  }

  return { match: matchRow as Match, isMutual: false };
}

export async function getMyMatches(
  client: TypedSupabaseClient,
  limit = 50
): Promise<MatchWithProfile[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: myProfile } = await client
    .from("profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (!myProfile) return [];

  const profileId = myProfile.id as string;

  // Fetch matches where I am actor or target and status is 'matched'
  const { data, error } = await client
    .from("matches")
    .select(
      `*, target_profile:profiles!matches_target_id_fkey(*), actor_profile:profiles!matches_actor_id_fkey(*)`
    )
    .eq("status", "matched")
    .or(`actor_id.eq.${profileId},target_id.eq.${profileId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const isActor = row.actor_id === profileId;
    return {
      ...row,
      target_profile: isActor
        ? (row.target_profile as Profile | null)
        : (row.actor_profile as Profile | null),
    } as MatchWithProfile;
  });
}

/**
 * Create a direct conversation between two matched profiles.
 * Called automatically on mutual match or on-demand.
 */
export async function createMatchConversation(
  client: TypedSupabaseClient,
  profileA: string,
  profileB: string
): Promise<{ conversationId: string }> {
  const { data: convo, error } = await client
    .from("conversations")
    .insert({
      type: "direct",
      title: null,
      created_by: profileA,
      is_encrypted: false,
    })
    .select()
    .single();

  if (error || !convo) throw error ?? new Error("Failed to create conversation");

  const { error: membersError } = await client
    .from("conversation_members")
    .insert([
      { conversation_id: convo.id, profile_id: profileA, role: "owner" },
      { conversation_id: convo.id, profile_id: profileB, role: "member" },
    ]);

  if (membersError) throw membersError;

  return { conversationId: convo.id };
}
