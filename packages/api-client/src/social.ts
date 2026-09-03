/**
 * Gamification API Helpers
 *
 * Reusable fetch functions for the achievements / skills / guilds /
 * inventory / stats systems introduced in migrations 015-021.
 * Accept a typed Supabase client so callers bring their own instance.
 */

import type { TypedSupabaseClient } from "./index";
import type {
  Achievement,
  UserAchievement,
  SkillTree,
  UserSkill,
  UserStats,
  Guild,
  GuildMembership,
  InventoryItem,
  UserInventory,
} from "./database";

export interface UserAchievementWithDetails extends UserAchievement {
  achievement: Achievement;
}

export interface UserSkillWithDetails extends UserSkill {
  skill: SkillTree;
}

export interface GuildMembershipWithGuild extends GuildMembership {
  guild: Guild;
}

export interface UserInventoryWithItem extends UserInventory {
  item: InventoryItem;
}

export async function getUserStats(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserStats | null> {
  const { data, error } = await client
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserStats | null) ?? null;
}

export async function getUserAchievements(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserAchievementWithDetails[]> {
  const { data, error } = await client
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as UserAchievementWithDetails[];
}

export async function getUserSkills(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserSkillWithDetails[]> {
  const { data, error } = await client
    .from("user_skills")
    .select("*, skill:skill_trees(*)")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as unknown as UserSkillWithDetails[];
}

export async function getUserGuilds(
  client: TypedSupabaseClient,
  userId: string
): Promise<GuildMembershipWithGuild[]> {
  const { data, error } = await client
    .from("guild_memberships")
    .select("*, guild:guilds(*)")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) throw error;
  return (data ?? []) as unknown as GuildMembershipWithGuild[];
}

export async function getUserInventory(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserInventoryWithItem[]> {
  const { data, error } = await client
    .from("user_inventory")
    .select("*, item:inventory_items(*)")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as unknown as UserInventoryWithItem[];
}
