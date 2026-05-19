/**
 * Community Feed Page
 *
 * A public feed of activity from across realms. Placeholder posts
 * demonstrating the FeedCard component and layout.
 */

"use client";

import AppShell from "../components/AppShell";
import FeedCard from "../components/FeedCard";

const PLACEHOLDER_POSTS = [
  {
    author: "NovaStar",
    timeAgo: "2h ago",
    content:
      "Just launched my first live stream in The Creator's Market! The energy was incredible — 300+ dreamers showed up to vibe with my new ambient set. Thank you DreamRealm.",
    realmName: "The Creator's Market",
    likes: 124,
    comments: 18,
  },
  {
    author: "DeepThinker",
    timeAgo: "5h ago",
    content:
      "What if consciousness itself is a realm? Reading through the Temple of Thoughts archives and the threads on phenomenology are blowing my mind. Highly recommend the midnight discussion group.",
    realmName: "The Temple of Thoughts",
    likes: 89,
    comments: 42,
  },
  {
    author: "CupidVibes",
    timeAgo: "8h ago",
    content:
      "Matched with someone in Cupid's Corner who also collects vinyl and practices yoga at sunrise. Sometimes the algorithm gets it right. First date this weekend!",
    realmName: "Cupid's Corner",
    likes: 256,
    comments: 31,
  },
  {
    author: "NightOwl",
    timeAgo: "12h ago",
    content:
      "The AfterDark Realm late-night poetry slam was fire. If you missed it, the replay is up. Shout out to everyone who shared their raw verses. This community is special.",
    realmName: "The AfterDark Realm",
    likes: 67,
    comments: 9,
  },
  {
    author: "FounderX",
    timeAgo: "1d ago",
    content:
      "Looking for a technical co-founder in the Business Builder Realm. Building a decentralized review protocol for the Dreamcadian marketplace. DM if you're a Solidity dev with taste.",
    realmName: "Business Builder Realm",
    likes: 45,
    comments: 22,
  },
];

export default function FeedPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-glow">Community Feed</h1>
          <p className="text-text-muted">
            Pulse of the dreamers. Discover what's happening across realms.
          </p>
        </div>

        <div className="space-y-4">
          {PLACEHOLDER_POSTS.map((post, i) => (
            <FeedCard key={i} {...post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
