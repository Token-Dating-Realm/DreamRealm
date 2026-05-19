/**
 * Community feed post sample data and helpers.
 *
 * Static post definitions for Phase 3 frontend previews.
 * Will be replaced by API calls once the backend feed endpoints are built.
 */

export type PostType = "announcement" | "discussion" | "creator_update" | "event" | "marketplace";

export interface SamplePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorVerified: boolean;
  realm: string;
  realmSlug: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  type: PostType;
  liked?: boolean;
}

export const SAMPLE_POSTS: SamplePost[] = [
  {
    id: "post-001",
    authorId: "user-001",
    authorName: "Dreamcadian Founder",
    authorAvatar: null,
    authorVerified: true,
    realm: "Business Builder Realm",
    realmSlug: "business-builder-realm",
    content: "Welcome to the new DreamRealm dashboard! We're rolling out personalized feeds, realm interactions, and creator tools over the next few weeks. Your feedback shapes everything.",
    timestamp: "2025-05-18T10:00:00Z",
    likes: 342,
    commentsCount: 56,
    type: "announcement",
  },
  {
    id: "post-002",
    authorId: "user-002",
    authorName: "Realm Builder",
    authorAvatar: null,
    authorVerified: true,
    realm: "The Temple of Thoughts",
    realmSlug: "temple-of-thoughts",
    content: "What if consciousness itself is a realm? I've been thinking about how we construct digital spaces that mirror the architecture of human thought. Would love your takes on this.",
    timestamp: "2025-05-18T08:30:00Z",
    likes: 128,
    commentsCount: 42,
    type: "discussion",
  },
  {
    id: "post-003",
    authorId: "user-004",
    authorName: "Creative Vendor",
    authorAvatar: null,
    authorVerified: true,
    realm: "The Creator's Market",
    realmSlug: "creators-market",
    content: "Just dropped a new collection of dreamscape digital art! Each piece is inspired by a different realm in our ecosystem. Check out my vendor stall in the Creator's Market — first 10 buyers get a free NFT badge.",
    timestamp: "2025-05-17T16:00:00Z",
    likes: 89,
    commentsCount: 23,
    type: "creator_update",
  },
  {
    id: "post-004",
    authorId: "user-003",
    authorName: "Cupid's Corner Host",
    authorAvatar: null,
    authorVerified: true,
    realm: "Cupid's Corner",
    realmSlug: "cupids-corner",
    content: "This Friday: Virtual Speed Dating Night in Cupid's Corner! 50 spots available. We'll have themed rooms, icebreaker games, and live music. Sign up via the events tab.",
    timestamp: "2025-05-17T12:00:00Z",
    likes: 256,
    commentsCount: 67,
    type: "event",
  },
  {
    id: "post-005",
    authorId: "user-005",
    authorName: "Dating Dreamer Member",
    authorAvatar: null,
    authorVerified: false,
    realm: "Dating Dreamer Lounge",
    realmSlug: "dating-dreamer-lounge",
    content: "Looking for recommendations: what's the best first-date spot in the DreamRealm? I've been thinking about the Temple of Thoughts for deep conversation, or maybe something more active?",
    timestamp: "2025-05-16T20:00:00Z",
    likes: 45,
    commentsCount: 31,
    type: "discussion",
  },
  {
    id: "post-006",
    authorId: "user-004",
    authorName: "Creative Vendor",
    authorAvatar: null,
    authorVerified: true,
    realm: "The Creator's Market",
    realmSlug: "creators-market",
    content: "FOR SALE: Custom avatar commissions starting at 50 DreamCoin. I specialize in futuristic portraits and realm-themed backgrounds. DM me for portfolio.",
    timestamp: "2025-05-16T14:00:00Z",
    likes: 34,
    commentsCount: 12,
    type: "marketplace",
  },
  {
    id: "post-007",
    authorId: "user-001",
    authorName: "Dreamcadian Founder",
    authorAvatar: null,
    authorVerified: true,
    realm: "Business Builder Realm",
    realmSlug: "business-builder-realm",
    content: "Hiring: Looking for a senior frontend engineer to join the DreamRealm core team. React/Next.js expertise required. Remote-friendly. Compensation in USD + DreamCoin equity.",
    timestamp: "2025-05-15T09:00:00Z",
    likes: 178,
    commentsCount: 44,
    type: "marketplace",
  },
  {
    id: "post-008",
    authorId: "user-002",
    authorName: "Realm Builder",
    authorAvatar: null,
    authorVerified: true,
    realm: "The AfterDark Realm",
    realmSlug: "afterdark-realm",
    content: "Late night poetry slam starting in 30 minutes in the AfterDark Realm. Bring your verses, your voice, and your vulnerability. All skill levels welcome.",
    timestamp: "2025-05-18T02:00:00Z",
    likes: 67,
    commentsCount: 19,
    type: "event",
  },
];

export function getAllPosts(): SamplePost[] {
  return SAMPLE_POSTS;
}

export function getPostsByRealm(realmSlug: string): SamplePost[] {
  return SAMPLE_POSTS.filter((p) => p.realmSlug === realmSlug);
}

export function getPostsByType(type: PostType): SamplePost[] {
  return SAMPLE_POSTS.filter((p) => p.type === type);
}

export function getPostById(id: string): SamplePost | undefined {
  return SAMPLE_POSTS.find((p) => p.id === id);
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  announcement: "Announcement",
  discussion: "Discussion",
  creator_update: "Creator Update",
  event: "Event",
  marketplace: "Marketplace",
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  announcement: "bg-primary/20 text-primary",
  discussion: "bg-accent/20 text-accent",
  creator_update: "bg-warning/20 text-warning",
  event: "bg-success/20 text-success",
  marketplace: "bg-blue-500/20 text-blue-400",
};
