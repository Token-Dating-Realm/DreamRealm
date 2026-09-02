/**
 * Typed Supabase Database schema.
 *
 * This file maps our Zod/TS entities to PostgREST table shapes so that
 * `supabase.from('profiles').select('*')` returns fully typed rows.
 *
 * TODO: Keep in sync with apps/supabase/migrations.
 */

import type { User, Profile, Media, Match, Conversation, ConversationMember, Message, Stream, Event, Wallet, Transaction, Subscription, Report, TrustScore, Notification, AIAgentLog } from "@dreamrealm/types";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at"> & Partial<Pick<User, "created_at" | "updated_at">>;
        Update: Partial<Omit<User, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at"> & Partial<Pick<Profile, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Profile, "id">>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, "id" | "created_at"> & Partial<Pick<Media, "id" | "created_at">>;
        Update: Partial<Omit<Media, "id">>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at"> & Partial<Pick<Match, "id" | "created_at">>;
        Update: Partial<Omit<Match, "id">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at"> & Partial<Pick<Conversation, "id" | "created_at">>;
        Update: Partial<Omit<Conversation, "id">>;
      };
      conversation_members: {
        Row: ConversationMember;
        Insert: Omit<ConversationMember, "id" | "joined_at"> & Partial<Pick<ConversationMember, "id" | "joined_at">>;
        Update: Partial<Omit<ConversationMember, "id">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & Partial<Pick<Message, "id" | "created_at">>;
        Update: Partial<Omit<Message, "id">>;
      };
      streams: {
        Row: Stream;
        Insert: Omit<Stream, "id" | "created_at"> & Partial<Pick<Stream, "id" | "created_at">>;
        Update: Partial<Omit<Stream, "id">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at"> & Partial<Pick<Event, "id" | "created_at">>;
        Update: Partial<Omit<Event, "id">>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, "id" | "created_at" | "updated_at"> & Partial<Pick<Wallet, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Wallet, "id">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at"> & Partial<Pick<Transaction, "id" | "created_at">>;
        Update: Partial<Omit<Transaction, "id">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> & Partial<Pick<Subscription, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Subscription, "id">>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "resolved_at"> & Partial<Pick<Report, "id" | "created_at" | "resolved_at">>;
        Update: Partial<Omit<Report, "id">>;
      };
      trust_scores: {
        Row: TrustScore;
        Insert: Omit<TrustScore, "id" | "updated_at"> & Partial<Pick<TrustScore, "id" | "updated_at">>;
        Update: Partial<Omit<TrustScore, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "sent_at"> & Partial<Pick<Notification, "id" | "created_at" | "sent_at">>;
        Update: Partial<Omit<Notification, "id">>;
      };
      ai_agent_logs: {
        Row: AIAgentLog;
        Insert: Omit<AIAgentLog, "id" | "created_at"> & Partial<Pick<AIAgentLog, "id" | "created_at">>;
        Update: Partial<Omit<AIAgentLog, "id">>;
      };

      // -----------------------------------------------------------------
      // Gamification / social (migrations 015-021)
      // -----------------------------------------------------------------

      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, "id" | "created_at"> & Partial<Pick<Achievement, "id" | "created_at">>;
        Update: Partial<Omit<Achievement, "id">>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, "id" | "unlocked_at"> & Partial<Pick<UserAchievement, "id" | "unlocked_at">>;
        Update: Partial<Omit<UserAchievement, "id">>;
      };
      skill_trees: {
        Row: SkillTree;
        Insert: Omit<SkillTree, "id" | "created_at"> & Partial<Pick<SkillTree, "id" | "created_at">>;
        Update: Partial<Omit<SkillTree, "id">>;
      };
      user_skills: {
        Row: UserSkill;
        Insert: Omit<UserSkill, "id" | "unlocked_at"> & Partial<Pick<UserSkill, "id" | "unlocked_at">>;
        Update: Partial<Omit<UserSkill, "id">>;
      };
      user_stats: {
        Row: UserStats;
        Insert: Omit<UserStats, "id" | "created_at" | "updated_at"> & Partial<Pick<UserStats, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<UserStats, "id">>;
      };
      friendships: {
        Row: Friendship;
        Insert: Omit<Friendship, "id" | "created_at" | "requested_at"> & Partial<Pick<Friendship, "id" | "created_at" | "requested_at">>;
        Update: Partial<Omit<Friendship, "id">>;
      };
      guilds: {
        Row: Guild;
        Insert: Omit<Guild, "id" | "created_at" | "updated_at" | "member_count" | "total_guild_xp" | "guild_level"> &
          Partial<Pick<Guild, "id" | "created_at" | "updated_at" | "member_count" | "total_guild_xp" | "guild_level">>;
        Update: Partial<Omit<Guild, "id">>;
      };
      guild_memberships: {
        Row: GuildMembership;
        Insert: Omit<GuildMembership, "id" | "joined_at"> & Partial<Pick<GuildMembership, "id" | "joined_at">>;
        Update: Partial<Omit<GuildMembership, "id">>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, "id" | "created_at"> & Partial<Pick<InventoryItem, "id" | "created_at">>;
        Update: Partial<Omit<InventoryItem, "id">>;
      };
      user_inventory: {
        Row: UserInventory;
        Insert: Omit<UserInventory, "id" | "acquired_at"> & Partial<Pick<UserInventory, "id" | "acquired_at">>;
        Update: Partial<Omit<UserInventory, "id">>;
      };
      user_presence: {
        Row: UserPresence;
        Insert: Omit<UserPresence, "id" | "last_seen_at" | "updated_at"> & Partial<Pick<UserPresence, "id" | "last_seen_at" | "updated_at">>;
        Update: Partial<Omit<UserPresence, "id">>;
      };
      realms: {
        Row: Realm;
        Insert: Omit<Realm, "id" | "created_at" | "member_count"> & Partial<Pick<Realm, "id" | "created_at" | "member_count">>;
        Update: Partial<Omit<Realm, "id">>;
      };
      realm_members: {
        Row: RealmMember;
        Insert: Omit<RealmMember, "id" | "joined_at"> & Partial<Pick<RealmMember, "id" | "joined_at">>;
        Update: Partial<Omit<RealmMember, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      nearby_profiles: {
        Args: {
          p_latitude: number;
          p_longitude: number;
          p_radius_meters?: number;
          p_exclude_profile_id?: string | null;
          p_limit?: number;
        };
        Returns: Profile[];
      };
      upsert_user_presence: {
        Args: {
          p_user_id: string;
          p_status?: string;
          p_mood?: string | null;
          p_status_message?: string | null;
          p_current_realm_id?: string | null;
          p_current_activity?: string | null;
        };
        Returns: void;
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Gamification / social row shapes (migrations 015-021, 023)
// ---------------------------------------------------------------------------

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  rarity: string;
  icon_url: string | null;
  xp_reward: number;
  coin_reward: number;
  unlock_condition: string | null;
  sort_order: number;
  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  viewed_at: string | null;
}

export interface SkillTree {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  max_level: number;
  icon_url: string | null;
  parent_skill_id: string | null;
  xp_per_level: number;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  current_level: number;
  current_xp: number;
  unlocked_at: string;
  last_leveled_at: string | null;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  reputation_score: number;
  total_achievements: number;
  total_skills_maxed: number;
  quests_completed: number;
  realms_created: number;
  streams_hosted: number;
  messages_sent: number;
  matches_made: number;
  total_coins_earned: number;
  total_coins_spent: number;
  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
}

export interface Guild {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emblem_url: string | null;
  banner_url: string | null;
  is_recruiting: boolean;
  min_level_required: number;
  member_count: number;
  total_guild_xp: number;
  guild_level: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GuildMembership {
  id: string;
  guild_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  guild_xp_contributed: number;
  is_active: boolean;
}

export interface InventoryItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  icon_url: string | null;
  is_tradable: boolean;
  is_consumable: boolean;
  max_stack: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UserInventory {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  acquired_at: string;
  metadata: Record<string, unknown> | null;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: string;
  mood: string | null;
  status_message: string | null;
  current_realm_id: string | null;
  current_activity: string | null;
  last_seen_at: string;
  updated_at: string;
}

export interface Realm {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  member_count: number;
  created_by: string | null;
  created_at: string;
}

export interface RealmMember {
  id: string;
  realm_id: string;
  user_id: string;
  joined_at: string;
}
