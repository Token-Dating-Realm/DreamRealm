/**
 * Matching API Helpers
 *
 * Reusable swipe engine and geo discovery functions for web and mobile.
 * Accept a typed Supabase client so callers bring their own instance.
 *
 * Ranking is a lightweight heuristic (trust score + mutual interest overlap
 * + verification), not a learned model — a real AI recommendation engine
 * belongs in a later phase with its own training/eval pipeline.
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

async function getSwipedProfileIds(client: TypedSupabaseClient, myProfileId: string): Promise<Set<string>> {
  const { data, error } = await client.from("matches").select("target_id").eq("actor_id", myProfileId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.target_id as string));
}

/** Lightweight heuristic score: trust, verification, and mutual interest overlap. */
function scoreProfile(
  candidate: Profile,
  myProfile: { mode: ProfileMode; looking_for: ProfileMode[] | null }
): number {
  let score = candidate.trust_score ?? 0;
  if (candidate.is_verified) score += 15;
  if (myProfile.looking_for?.includes(candidate.mode)) score += 20;
  if (candidate.looking_for?.includes(myProfile.mode)) score += 20;
  return score;
}

function rankAndFilter(
  candidates: Profile[],
  swipedIds: Set<string>,
  myProfile: { id: string; mode: ProfileMode; looking_for: ProfileMode[] | null },
  limit: number
): Profile[] {
  return candidates
    .filter((p) => p.id !== myProfile.id && !swipedIds.has(p.id))
    .sort((a, b) => scoreProfile(b, myProfile) - scoreProfile(a, myProfile))
    .slice(0, limit);
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
  const swipedIds = await getSwipedProfileIds(client, myProfile.id);

  // Use PostGIS ST_DWithin for geo-filtering.
  // Exclude self and inactive/flagged profiles.
  const { data, error } = await client.rpc("nearby_profiles", {
    p_latitude: filter.latitude,
    p_longitude: filter.longitude,
    p_radius_meters: radius * 1000,
    p_exclude_profile_id: myProfile.id,
    // Overfetch since already-swiped profiles are filtered out client-side below.
    p_limit: limit + swipedIds.size,
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
      .limit(limit + swipedIds.size);

    if (fallbackError) throw fallbackError;
    return rankAndFilter((fallback ?? []) as Profile[], swipedIds, myProfile, limit);
  }

  return rankAndFilter((data ?? []) as Profile[], swipedIds, myProfile, limit);
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

  // Insert swipe record; RLS ensures actor_id === my profile id.
  // The `handle_mutual_match` DB trigger (see migration 014) atomically
  // promotes this row and any reverse pending swipe to 'matched' before
  // insert, so the returned row already reflects the final status — no
  // separate client-side read-then-update is needed (and doing one would
  // race the trigger).
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

  return { match: matchRow as Match, isMutual: matchRow.status === "matched" };
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
