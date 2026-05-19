/**
 * DreamRealm shared types and Zod schemas.
 *
 * All database entities are defined here as both Zod schemas (runtime)
 * and TypeScript types (compile-time) to guarantee contract safety
 * across web, mobile, edge functions, and AI agents.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const uuidSchema = z.string().uuid();
export const timestampSchema = z.string().datetime();
export const emailSchema = z.string().email();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    count: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
  });

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const userRoleSchema = z.enum(["user", "moderator", "admin", "system"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  role: userRoleSchema.default("user"),
  email_confirmed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
  last_sign_in_at: timestampSchema.nullable(),
  raw_user_meta_data: z.record(z.unknown()).nullable(),
  device_fingerprint: z.string().nullable(),
  geo_region: z.string().nullable(),
  trust_bucket: z.enum(["new", "verified", "trusted", "vip", "flagged"]).default("new"),
});

export type User = z.infer<typeof userSchema>;

export const signUpInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type SignInInput = z.infer<typeof signInInputSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileModeSchema = z.enum([
  "single_male",
  "single_female",
  "nonbinary",
  "couple_mf",
  "couple_mm",
  "couple_ff",
  "poly_open",
  "friends_only",
  "casual_dating",
  "serious_dating",
  "local_meetups",
  "swing_lifestyle",
  "creator_influencer",
  "verified_professional",
]);

export type ProfileMode = z.infer<typeof profileModeSchema>;

export const visibilitySchema = z.enum(["public", "friends", "matches", "private"]);
export type Visibility = z.infer<typeof visibilitySchema>;

export const profileSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  mode: profileModeSchema,
  display_name: z.string().min(1).max(100),
  bio: z.string().max(2000).nullable(),
  birth_date: z.string().date().nullable(),
  city: z.string().max(100).nullable(),
  country: z.string().max(100).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  looking_for: z.array(profileModeSchema).max(5).nullable(),
  visibility: visibilitySchema.default("public"),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
  trust_score: z.number().int().min(0).max(100).default(0),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Profile = z.infer<typeof profileSchema>;

export const createProfileInputSchema = profileSchema
  .pick({
    mode: true,
    display_name: true,
    bio: true,
    birth_date: true,
    city: true,
    country: true,
    latitude: true,
    longitude: true,
    looking_for: true,
    visibility: true,
  })
  .partial({
    bio: true,
    birth_date: true,
    city: true,
    country: true,
    latitude: true,
    longitude: true,
    looking_for: true,
    visibility: true,
  });

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

export const updateProfileInputSchema = profileSchema
  .pick({
    mode: true,
    display_name: true,
    bio: true,
    birth_date: true,
    city: true,
    country: true,
    latitude: true,
    longitude: true,
    looking_for: true,
    visibility: true,
    is_active: true,
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const mediaTypeSchema = z.enum(["image", "video", "voice", "document"]);
export type MediaType = z.infer<typeof mediaTypeSchema>;

export const mediaSchema = z.object({
  id: uuidSchema,
  profile_id: uuidSchema,
  type: mediaTypeSchema,
  url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  blurhash: z.string().nullable(),
  is_private: z.boolean().default(false),
  encryption_key_id: z.string().nullable(),
  sort_order: z.number().int().min(0).default(0),
  created_at: timestampSchema,
});

export type Media = z.infer<typeof mediaSchema>;

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

export const matchDirectionSchema = z.enum(["left", "right", "super"]);
export type MatchDirection = z.infer<typeof matchDirectionSchema>;

export const matchStatusSchema = z.enum(["pending", "matched", "blocked", "expired"]);
export type MatchStatus = z.infer<typeof matchStatusSchema>;

export const matchSchema = z.object({
  id: uuidSchema,
  actor_id: uuidSchema,
  target_id: uuidSchema,
  direction: matchDirectionSchema,
  status: matchStatusSchema.default("pending"),
  created_at: timestampSchema,
});

export type Match = z.infer<typeof matchSchema>;

// ---------------------------------------------------------------------------
// Conversations & Messages
// ---------------------------------------------------------------------------

export const conversationTypeSchema = z.enum(["direct", "group", "stream"]);
export type ConversationType = z.infer<typeof conversationTypeSchema>;

export const conversationSchema = z.object({
  id: uuidSchema,
  type: conversationTypeSchema.default("direct"),
  title: z.string().max(200).nullable(),
  created_by: uuidSchema,
  is_encrypted: z.boolean().default(false),
  encryption_key_fingerprint: z.string().nullable(),
  last_message_at: timestampSchema.nullable(),
  created_at: timestampSchema,
});

export type Conversation = z.infer<typeof conversationSchema>;

export const conversationMemberSchema = z.object({
  id: uuidSchema,
  conversation_id: uuidSchema,
  profile_id: uuidSchema,
  role: z.enum(["member", "admin", "owner"]).default("member"),
  joined_at: timestampSchema,
  last_read_at: timestampSchema.nullable(),
});

export type ConversationMember = z.infer<typeof conversationMemberSchema>;

export const messageTypeSchema = z.enum(["text", "image", "video", "voice", "system"]);
export type MessageType = z.infer<typeof messageTypeSchema>;

export const messageSchema = z.object({
  id: uuidSchema,
  conversation_id: uuidSchema,
  sender_profile_id: uuidSchema,
  type: messageTypeSchema.default("text"),
  content: z.string().max(10000).nullable(),
  encrypted_payload: z.string().nullable(),
  media_id: uuidSchema.nullable(),
  reply_to_id: uuidSchema.nullable(),
  is_deleted: z.boolean().default(false),
  created_at: timestampSchema,
});

export type Message = z.infer<typeof messageSchema>;

export const createMessageInputSchema = messageSchema
  .pick({
    conversation_id: true,
    type: true,
    content: true,
    encrypted_payload: true,
    media_id: true,
    reply_to_id: true,
  })
  .partial({
    encrypted_payload: true,
    media_id: true,
    reply_to_id: true,
  });

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createConversationInputSchema = z.object({
  type: conversationTypeSchema.default("direct"),
  title: z.string().max(200).optional(),
  is_encrypted: z.boolean().default(false),
  member_profile_ids: z.array(uuidSchema).min(1).max(50),
});

export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;

// ---------------------------------------------------------------------------
// Streams
// ---------------------------------------------------------------------------

export const streamStatusSchema = z.enum(["scheduled", "live", "ended", "cancelled"]);
export type StreamStatus = z.infer<typeof streamStatusSchema>;

export const streamSchema = z.object({
  id: uuidSchema,
  profile_id: uuidSchema,
  title: z.string().max(300),
  description: z.string().max(2000).nullable(),
  status: streamStatusSchema.default("scheduled"),
  room_token: z.string().nullable(),
  is_private: z.boolean().default(false),
  token_gate_min: z.number().int().min(0).default(0),
  scheduled_at: timestampSchema.nullable(),
  started_at: timestampSchema.nullable(),
  ended_at: timestampSchema.nullable(),
  created_at: timestampSchema,
});

export type Stream = z.infer<typeof streamSchema>;

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const eventSchema = z.object({
  id: uuidSchema,
  profile_id: uuidSchema,
  title: z.string().max(300),
  description: z.string().max(5000).nullable(),
  city: z.string().max(100),
  country: z.string().max(100).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  starts_at: timestampSchema,
  ends_at: timestampSchema.nullable(),
  max_attendees: z.number().int().min(1).nullable(),
  is_private: z.boolean().default(false),
  token_gate_min: z.number().int().min(0).default(0),
  created_at: timestampSchema,
});

export type Event = z.infer<typeof eventSchema>;

// ---------------------------------------------------------------------------
// Wallet & Transactions (DreamCoin)
// ---------------------------------------------------------------------------

export const transactionTypeSchema = z.enum([
  "deposit",
  "withdrawal",
  "tip",
  "gift",
  "unlock",
  "subscription",
  "stream_payment",
  "creator_payout",
  "referral_bonus",
  "adjustment",
]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const walletSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  balance: z.number().int().min(0).default(0),
  lifetime_earned: z.number().int().min(0).default(0),
  lifetime_spent: z.number().int().min(0).default(0),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Wallet = z.infer<typeof walletSchema>;

export const transactionSchema = z.object({
  id: uuidSchema,
  wallet_id: uuidSchema,
  type: transactionTypeSchema,
  amount: z.number().int(),
  description: z.string().max(500).nullable(),
  reference_id: uuidSchema.nullable(),
  reference_table: z.string().max(64).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export type Transaction = z.infer<typeof transactionSchema>;

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export const subscriptionTierSchema = z.enum(["free", "silver", "gold", "platinum"]);
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export const subscriptionSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  tier: subscriptionTierSchema.default("free"),
  starts_at: timestampSchema,
  ends_at: timestampSchema.nullable(),
  is_active: z.boolean().default(true),
  auto_renew: z.boolean().default(false),
  payment_provider: z.string().max(50).nullable(),
  provider_subscription_id: z.string().max(255).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// ---------------------------------------------------------------------------
// Trust & Moderation
// ---------------------------------------------------------------------------

export const reportReasonSchema = z.enum([
  "spam",
  "harassment",
  "fake_profile",
  "underage",
  "violence",
  "hate_speech",
  "nudity",
  "scam",
  "other",
]);
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const reportStatusSchema = z.enum(["open", "under_review", "resolved", "dismissed"]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportSchema = z.object({
  id: uuidSchema,
  reporter_id: uuidSchema,
  reported_profile_id: uuidSchema,
  reason: reportReasonSchema,
  details: z.string().max(5000).nullable(),
  status: reportStatusSchema.default("open"),
  assigned_moderator_id: uuidSchema.nullable(),
  resolved_at: timestampSchema.nullable(),
  created_at: timestampSchema,
});

export type Report = z.infer<typeof reportSchema>;

export const trustScoreSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  overall: z.number().int().min(0).max(100).default(0),
  identity: z.number().int().min(0).max(100).default(0),
  behavior: z.number().int().min(0).max(100).default(0),
  community: z.number().int().min(0).max(100).default(0),
  transaction: z.number().int().min(0).max(100).default(0),
  ai_insights: z.record(z.unknown()).nullable(),
  updated_at: timestampSchema,
});

export type TrustScore = z.infer<typeof trustScoreSchema>;

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationTypeSchema = z.enum([
  "match",
  "message",
  "like",
  "tip",
  "stream_start",
  "event_reminder",
  "system",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  type: notificationTypeSchema,
  title: z.string().max(200),
  body: z.string().max(1000),
  data: z.record(z.unknown()).nullable(),
  is_read: z.boolean().default(false),
  sent_at: timestampSchema.nullable(),
  created_at: timestampSchema,
});

export type Notification = z.infer<typeof notificationSchema>;

// ---------------------------------------------------------------------------
// Realms
// ---------------------------------------------------------------------------

export const realmStatusSchema = z.enum(["active", "beta", "archived", "private"]);
export type RealmStatus = z.infer<typeof realmStatusSchema>;

export const realmSchema = z.object({
  id: uuidSchema,
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  category: z.string().max(100),
  image_url: z.string().url().nullable(),
  status: realmStatusSchema.default("active"),
  member_count: z.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
  is_joined: z.boolean().default(false),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Realm = z.infer<typeof realmSchema>;

// ---------------------------------------------------------------------------
// AI Agent Logs
// ---------------------------------------------------------------------------

export const aiAgentTypeSchema = z.enum([
  "matchmaking",
  "moderation",
  "spam_detection",
  "trust_scoring",
  "growth",
  "recommendation",
  "creator_assistant",
]);
export type AIAgentType = z.infer<typeof aiAgentTypeSchema>;

export const aiAgentLogSchema = z.object({
  id: uuidSchema,
  agent_type: aiAgentTypeSchema,
  input_hash: z.string().max(128),
  output_summary: z.string().max(2000),
  model_used: z.string().max(100).nullable(),
  latency_ms: z.number().int().min(0).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export type AIAgentLog = z.infer<typeof aiAgentLogSchema>;
