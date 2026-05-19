/**
 * RealmCard
 *
 * Preview card for a realm with gradient placeholder, status badge,
 * member count, category, and hover glow effect.
 */

"use client";

import Link from "next/link";
import type { Realm } from "@dreamrealm/types";

interface RealmCardProps {
  realm: Realm;
  isJoined?: boolean;
  isSaved?: boolean;
  onToggleJoin?: () => void;
  onToggleSave?: () => void;
  showActions?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/20 text-success",
  beta: "bg-warning/20 text-warning",
  archived: "bg-text-muted/20 text-text-muted",
  private: "bg-danger/20 text-danger",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Intellectual: "from-primary/40 to-primary-dark/40",
  Dating: "from-accent/40 to-accent-dark/40",
  Creative: "from-warning/40 to-accent/40",
  Social: "from-primary/30 to-accent/30",
  Business: "from-success/40 to-primary/40",
};

export default function RealmCard({
  realm,
  isJoined = false,
  isSaved = false,
  onToggleJoin,
  onToggleSave,
  showActions = true,
}: RealmCardProps) {
  const gradient = CATEGORY_GRADIENTS[realm.category] ?? "from-primary/20 to-accent/20";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-primary/50 hover:shadow-glow">
      <Link href={`/realms/${realm.slug}`} className="block">
      {/* Image placeholder */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {realm.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white/90 backdrop-blur-sm">
          {realm.name.charAt(0)}
        </div>
      </div>

      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {realm.category}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[realm.status] ?? "bg-text-muted/20 text-text-muted"}`}>
            {realm.status}
          </span>
        </div>
        <Link href={`/realms/${realm.slug}`}>
          <h3 className="mb-1 text-lg font-bold text-text group-hover:text-primary transition-colors">
            {realm.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {realm.description}
          </p>
        </Link>
        <div className="mt-auto flex items-center gap-2 text-xs text-text-muted">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{realm.member_count.toLocaleString()} members</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleJoin?.();
              }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isJoined
                  ? "border border-success/50 bg-success/10 text-success hover:bg-success/20"
                  : "bg-primary text-white shadow-glow hover:bg-primary-dark"
              }`}
            >
              {isJoined ? "Joined" : "Join Realm"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave?.();
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isSaved
                  ? "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
                  : "border-border bg-surface-light text-text-muted hover:border-primary/50 hover:text-text"
              }`}
              aria-label={isSaved ? "Unsave realm" : "Save realm"}
            >
              <svg className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
