/**
 * User sample data and helpers.
 *
 * Static user definitions for Phase 3 frontend previews.
 * Will be replaced by API calls once the backend user endpoints are built.
 */

export interface SampleUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  interests: string[];
  joinedRealms: string[];
  savedRealms: string[];
  role: "founder" | "admin" | "moderator" | "builder" | "host" | "vendor" | "member" | "guest";
  status: "active" | "away" | "busy" | "offline";
  trustScore: number;
  verified: boolean;

  // Gamification
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  reputationScore: number;
  achievements: string[];
  skills: { name: string; level: number; maxLevel: number; xp: number }[];
  inventory: { name: string; type: string; rarity: string; equipped: boolean }[];
  mood: string;
  presenceStatus: string;
  statusMessage: string;
  guilds: { name: string; role: string; memberCount: number }[];
  friends: string[];
  coins: number;
  profileTheme: string;
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    id: "user-001",
    username: "dreamcadian_founder",
    displayName: "Dreamcadian Founder",
    avatar: null,
    bio: "Building the digital world where dreamers connect, create, and thrive. Welcome to the ecosystem.",
    interests: ["Entrepreneurship", "Blockchain", "Community Building", "Design"],
    joinedRealms: ["Business Builder Realm", "The Creator's Market"],
    savedRealms: ["The Temple of Thoughts"],
    role: "founder",
    status: "active",
    trustScore: 100,
    verified: true,

    level: 47,
    totalXp: 12450,
    xpToNextLevel: 200,
    reputationScore: 9850,
    achievements: ["First Steps", "Social Butterfly", "Realm Explorer", "Content Creator", "Guild Founder", "Legendary Dreamer"],
    skills: [
      { name: "Social Charm", level: 18, maxLevel: 20, xp: 1800 },
      { name: "Leadership Presence", level: 16, maxLevel: 20, xp: 3200 },
      { name: "Creative Vision", level: 12, maxLevel: 15, xp: 1440 },
      { name: "Market Wisdom", level: 10, maxLevel: 15, xp: 1000 },
    ],
    inventory: [
      { name: "Founder Badge", type: "badge", rarity: "legendary", equipped: true },
      { name: "Neon Avatar Frame", type: "avatar_frame", rarity: "epic", equipped: true },
      { name: "Realm Builder Hammer", type: "tool", rarity: "rare", equipped: false },
      { name: "Socialite Title", type: "title", rarity: "rare", equipped: true },
    ],
    mood: "focused",
    presenceStatus: "online",
    statusMessage: "Architecting the next realm...",
    guilds: [
      { name: "Dream Council", role: "founder", memberCount: 47 },
      { name: "The Builders Guild", role: "officer", memberCount: 23 },
    ],
    friends: ["realm_builder", "cupid_host", "creative_vendor"],
    coins: 28450,
    profileTheme: "cyber-aurora",
  },
  {
    id: "user-002",
    username: "realm_builder",
    displayName: "Realm Builder",
    avatar: null,
    bio: "Architecting new realms and communities within DreamRealm. If you can imagine it, we can build it.",
    interests: ["Architecture", "Community Design", "Events", "Moderation"],
    joinedRealms: ["Business Builder Realm", "The Creator's Market", "The Temple of Thoughts"],
    savedRealms: ["Cupid's Corner"],
    role: "builder",
    status: "active",
    trustScore: 92,
    verified: true,

    level: 34,
    totalXp: 8200,
    xpToNextLevel: 350,
    reputationScore: 7120,
    achievements: ["First Steps", "Realm Explorer", "Content Creator"],
    skills: [
      { name: "Creative Vision", level: 13, maxLevel: 15, xp: 1560 },
      { name: "Leadership Presence", level: 8, maxLevel: 20, xp: 1600 },
      { name: "Crafting Artisan", level: 10, maxLevel: 15, xp: 1100 },
    ],
    inventory: [
      { name: "Realm Builder Hammer", type: "tool", rarity: "rare", equipped: true },
      { name: "Neon Avatar Frame", type: "avatar_frame", rarity: "epic", equipped: false },
    ],
    mood: "creative",
    presenceStatus: "in_realm",
    statusMessage: "Designing the new Crystal Spire realm...",
    guilds: [
      { name: "The Builders Guild", role: "founder", memberCount: 23 },
    ],
    friends: ["dreamcadian_founder", "creative_vendor"],
    coins: 12800,
    profileTheme: "neon-forge",
  },
  {
    id: "user-003",
    username: "cupid_host",
    displayName: "Cupid's Corner Host",
    avatar: null,
    bio: "Your guide to love and connection in the digital age. Hosting events, moderating discussions, and sparking romance.",
    interests: ["Dating", "Relationships", "Events", "Psychology"],
    joinedRealms: ["Cupid's Corner", "Dating Dreamer Lounge"],
    savedRealms: ["The AfterDark Realm"],
    role: "host",
    status: "active",
    trustScore: 88,
    verified: true,

    level: 29,
    totalXp: 6300,
    xpToNextLevel: 400,
    reputationScore: 5400,
    achievements: ["First Steps", "Social Butterfly", "Matchmaker"],
    skills: [
      { name: "Social Charm", level: 15, maxLevel: 20, xp: 1500 },
      { name: "Magic Streamer", level: 8, maxLevel: 15, xp: 800 },
      { name: "Combat Banter", level: 6, maxLevel: 12, xp: 540 },
    ],
    inventory: [
      { name: "Socialite Title", type: "title", rarity: "rare", equipped: true },
      { name: "Mystery Box", type: "collectible", rarity: "uncommon", equipped: false },
    ],
    mood: "flirty",
    presenceStatus: "streaming",
    statusMessage: "Live now: Speed Dating Night in Cupid's Corner!",
    guilds: [
      { name: "Hearts United", role: "officer", memberCount: 34 },
    ],
    friends: ["dreamcadian_founder", "dating_dreamer"],
    coins: 8750,
    profileTheme: "rose-gold",
  },
  {
    id: "user-004",
    username: "creative_vendor",
    displayName: "Creative Vendor",
    avatar: null,
    bio: "Digital artist and creator selling original works in the Creator's Market. Commissions open.",
    interests: ["Digital Art", "NFTs", "Design", "Music Production"],
    joinedRealms: ["The Creator's Market", "The AfterDark Realm"],
    savedRealms: ["Business Builder Realm"],
    role: "vendor",
    status: "active",
    trustScore: 85,
    verified: true,

    level: 22,
    totalXp: 4100,
    xpToNextLevel: 300,
    reputationScore: 3800,
    achievements: ["First Steps", "Content Creator"],
    skills: [
      { name: "Creative Vision", level: 10, maxLevel: 15, xp: 1200 },
      { name: "Crafting Artisan", level: 8, maxLevel: 15, xp: 880 },
      { name: "Market Wisdom", level: 6, maxLevel: 15, xp: 900 },
    ],
    inventory: [
      { name: "Neon Avatar Frame", type: "avatar_frame", rarity: "epic", equipped: true },
      { name: "Dream Coin Pouch", type: "consumable", rarity: "common", equipped: false },
    ],
    mood: "creative",
    presenceStatus: "busy",
    statusMessage: "Commission queue: 3 slots open",
    guilds: [
      { name: "The Artisans Collective", role: "member", memberCount: 56 },
    ],
    friends: ["dreamcadian_founder", "realm_builder"],
    coins: 15600,
    profileTheme: "midnight-canvas",
  },
  {
    id: "user-005",
    username: "dating_dreamer",
    displayName: "Dating Dreamer Member",
    avatar: null,
    bio: "Hopeless romantic looking for genuine connections. Love live music, long walks, and deep conversations.",
    interests: ["Dating", "Music", "Travel", "Cooking"],
    joinedRealms: ["Dating Dreamer Lounge", "Cupid's Corner"],
    savedRealms: ["The Temple of Thoughts"],
    role: "member",
    status: "active",
    trustScore: 78,
    verified: false,

    level: 12,
    totalXp: 1100,
    xpToNextLevel: 200,
    reputationScore: 890,
    achievements: ["First Steps", "Night Owl"],
    skills: [
      { name: "Social Charm", level: 5, maxLevel: 20, xp: 500 },
      { name: "Stealth Profile", level: 3, maxLevel: 10, xp: 240 },
    ],
    inventory: [
      { name: "Dream Coin Pouch", type: "consumable", rarity: "common", equipped: false },
    ],
    mood: "romantic",
    presenceStatus: "online",
    statusMessage: "Looking for someone to explore the Crystal Caverns with...",
    guilds: [
      { name: "Hearts United", role: "member", memberCount: 34 },
    ],
    friends: ["cupid_host"],
    coins: 420,
    profileTheme: "warm-glow",
  },
];

export function getUserById(id: string): SampleUser | undefined {
  return SAMPLE_USERS.find((u) => u.id === id);
}

export function getUserByUsername(username: string): SampleUser | undefined {
  return SAMPLE_USERS.find((u) => u.username === username);
}

export function getAllUsers(): SampleUser[] {
  return SAMPLE_USERS;
}
