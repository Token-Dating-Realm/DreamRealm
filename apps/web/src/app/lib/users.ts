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
