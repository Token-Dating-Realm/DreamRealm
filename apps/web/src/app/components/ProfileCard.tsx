/**
 * ProfileCard
 *
 * Compact user preview card with avatar, display name, bio snippet,
 * trust indicators, and follow/message actions.
 */

"use client";

import Link from "next/link";

interface ProfileCardProps {
  id: string;
  name: string;
  bio?: string;
  mode?: string;
  verified?: boolean;
  trustScore?: number;
  joinedRealms?: string[];
}

export default function ProfileCard({
  id,
  name,
  bio,
  mode,
  verified = false,
  trustScore = 0,
  joinedRealms = [],
}: ProfileCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-glow/50">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-lg font-bold text-text">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/users/${id}`} className="truncate text-sm font-bold text-text hover:text-primary transition">
              {name}
            </Link>
            {verified && (
              <svg className="h-4 w-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {mode && <span className="text-xs text-primary capitalize">{mode.replace(/_/g, " ")}</span>}
        </div>
      </div>
      {bio && <p className="mb-3 line-clamp-2 text-sm text-text-muted">{bio}</p>}
      <div className="mb-4 flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Trust {trustScore}/100
        </span>
        {joinedRealms.length > 0 && (
          <span>{joinedRealms.length} realms</span>
        )}
      </div>
      <div className="mt-auto flex gap-2">
        <button className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition">
          Follow
        </button>
        <Link
          href={`/messages`}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-center text-xs text-text hover:bg-surface-light transition"
        >
          Message
        </Link>
      </div>
    </div>
  );
}
