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
    };
  };
}
