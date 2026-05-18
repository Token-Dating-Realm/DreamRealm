/**
 * DreamRealm global constants.
 */

/** Supported profile relationship modes. */
export const PROFILE_MODES = [
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
] as const;

export type ProfileMode = (typeof PROFILE_MODES)[number];

/** Match directions for swipe engine. */
export const MATCH_DIRECTIONS = ["left", "right", "super"] as const;
export type MatchDirection = (typeof MATCH_DIRECTIONS)[number];

/** Conversation types. */
export const CONVERSATION_TYPES = ["direct", "group", "stream"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

/** Subscription tiers. */
export const SUBSCRIPTION_TIERS = ["free", "silver", "gold", "platinum"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

/** Trust score buckets. */
export const TRUST_BUCKETS = ["new", "verified", "trusted", "vip", "flagged"] as const;
export type TrustBucket = (typeof TRUST_BUCKETS)[number];

/** Content visibility levels. */
export const VISIBILITY_LEVELS = ["public", "friends", "matches", "private"] as const;
export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[number];

/** Pagination defaults. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
