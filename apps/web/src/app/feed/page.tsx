/**
 * Community Feed Page
 *
 * A public feed of activity from across realms. Placeholder posts
 * demonstrating the FeedCard component and layout.
 */

"use client";

import { useState, useMemo } from "react";
import AppShell from "../components/AppShell";
import FeedCard from "../components/FeedCard";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import {
  SAMPLE_POSTS,
  POST_TYPE_LABELS,
  type PostType,
} from "../lib/posts";

const POST_TYPES: PostType[] = ["announcement", "discussion", "creator_update", "event", "marketplace"];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("All");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...SAMPLE_POSTS];
    if (activeType !== "All") {
      result = result.filter((p) => p.type === activeType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.realm.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeType, search]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-glow">Community Feed</h1>
          <p className="text-text-muted">
            Pulse of the dreamers. Discover what&apos;s happening across realms.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search posts, authors, or realms..."
          />
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs
              options={POST_TYPES.map((t) => POST_TYPE_LABELS[t])}
              active={activeType}
              onSelect={(val) => {
                const entry = Object.entries(POST_TYPE_LABELS).find(([, label]) => label === val);
                setActiveType(entry?.[0] ?? "All");
              }}
            />
          </div>
        </div>

        {/* Post count */}
        <div className="mb-4 flex items-center justify-between text-xs text-text-muted">
          <span>{filtered.length} posts</span>
          <span className="rounded-full border border-border bg-surface px-2 py-0.5">
            {activeType === "All" ? "All Types" : POST_TYPE_LABELS[activeType as PostType]}
          </span>
        </div>

        <div className="space-y-4">
          {filtered.map((post) => (
            <FeedCard
              key={post.id}
              author={post.authorName}
              timeAgo={formatTimeAgo(post.timestamp)}
              content={post.content}
              realmName={post.realm}
              likes={post.likes + (likedIds.has(post.id) ? 1 : 0)}
              comments={post.commentsCount}
              isLiked={likedIds.has(post.id)}
              onLike={() => toggleLike(post.id)}
              type={post.type}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light">
              <svg className="h-8 w-8 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-text">No posts found</p>
            <p className="text-sm text-text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
