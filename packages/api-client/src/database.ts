/**
 * Typed Supabase Database schema.
 *
 * This file maps our Zod/TS entities to PostgREST table shapes so that
 * `supabase.from('profiles').select('*')` returns fully typed rows.
 *
 * Every table needs `Relationships` (even if empty) and the schema needs
 * `Views`/`Functions`/`Enums`/`CompositeTypes` — @supabase/supabase-js's
 * `GenericSchema` constraint silently collapses every `.from()`/`.rpc()`
 * call to `never` without them, which is why this previously type-checked
 * as broken everywhere it was actually used. Keep this in sync with
 * apps/supabase/migrations when tables, columns, or foreign keys change.
 */

import type { User, Profile, Media, Match, Conversation, ConversationMember, Message, Stream, Event, Wallet, Transaction, Subscription, Report, TrustScore, Notification, AIAgentLog } from "@dreamrealm/types";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at"> & Partial<Pick<User, "created_at" | "updated_at">>;
        Update: Partial<Omit<User, "id">>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<
          Profile,
          | "id"
          | "created_at"
          | "updated_at"
          | "bio"
          | "birth_date"
          | "city"
          | "country"
          | "latitude"
          | "longitude"
          | "looking_for"
          | "visibility"
          | "is_verified"
          | "is_active"
          | "trust_score"
          | "public_key"
        > &
          Partial<
            Pick<
              Profile,
              | "id"
              | "created_at"
              | "updated_at"
              | "bio"
              | "birth_date"
              | "city"
              | "country"
              | "latitude"
              | "longitude"
              | "looking_for"
              | "visibility"
              | "is_verified"
              | "is_active"
              | "trust_score"
              | "public_key"
            >
          >;
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: Media;
        Insert: Omit<Media, "id" | "created_at"> & Partial<Pick<Media, "id" | "created_at">>;
        Update: Partial<Omit<Media, "id">>;
        Relationships: [
          {
            foreignKeyName: "media_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at"> & Partial<Pick<Match, "id" | "created_at">>;
        Update: Partial<Omit<Match, "id">>;
        Relationships: [
          {
            foreignKeyName: "matches_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_target_id_fkey";
            columns: ["target_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "encryption_key_fingerprint" | "last_message_at"> &
          Partial<Pick<Conversation, "id" | "created_at" | "encryption_key_fingerprint" | "last_message_at">>;
        Update: Partial<Omit<Conversation, "id">>;
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_members: {
        Row: ConversationMember;
        Insert: Omit<ConversationMember, "id" | "joined_at" | "wrapped_key" | "last_read_at"> &
          Partial<Pick<ConversationMember, "id" | "joined_at" | "wrapped_key" | "last_read_at">>;
        Update: Partial<Omit<ConversationMember, "id">>;
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: Message;
        Insert: Omit<
          Message,
          "id" | "created_at" | "is_deleted" | "encrypted_payload" | "media_id" | "reply_to_id"
        > &
          Partial<Pick<Message, "id" | "created_at" | "is_deleted" | "encrypted_payload" | "media_id" | "reply_to_id">>;
        Update: Partial<Omit<Message, "id">>;
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey";
            columns: ["sender_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      streams: {
        Row: Stream;
        Insert: Omit<Stream, "id" | "created_at"> & Partial<Pick<Stream, "id" | "created_at">>;
        Update: Partial<Omit<Stream, "id">>;
        Relationships: [
          {
            foreignKeyName: "streams_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at"> & Partial<Pick<Event, "id" | "created_at">>;
        Update: Partial<Omit<Event, "id">>;
        Relationships: [
          {
            foreignKeyName: "events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, "id" | "created_at" | "updated_at"> & Partial<Pick<Wallet, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Wallet, "id">>;
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at"> & Partial<Pick<Transaction, "id" | "created_at">>;
        Update: Partial<Omit<Transaction, "id">>;
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> & Partial<Pick<Subscription, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Subscription, "id">>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "resolved_at"> & Partial<Pick<Report, "id" | "created_at" | "resolved_at">>;
        Update: Partial<Omit<Report, "id">>;
        Relationships: [
          {
            foreignKeyName: "reports_reported_profile_id_fkey";
            columns: ["reported_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trust_scores: {
        Row: TrustScore;
        Insert: Omit<TrustScore, "id" | "updated_at"> & Partial<Pick<TrustScore, "id" | "updated_at">>;
        Update: Partial<Omit<TrustScore, "id">>;
        Relationships: [
          {
            foreignKeyName: "trust_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "sent_at"> & Partial<Pick<Notification, "id" | "created_at" | "sent_at">>;
        Update: Partial<Omit<Notification, "id">>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_agent_logs: {
        Row: AIAgentLog;
        Insert: Omit<AIAgentLog, "id" | "created_at"> & Partial<Pick<AIAgentLog, "id" | "created_at">>;
        Update: Partial<Omit<AIAgentLog, "id">>;
        Relationships: [];
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Re-exported so callers/consumers don't need to hand-roll relationship shapes.
export type { Relationship };
