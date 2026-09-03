/**
 * Matches Page
 *
 * Lists the current user's mutual matches, joined against `profiles`
 * for display info via `getMyMatches`.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import AppShell from "../components/AppShell";
import ProfileCard from "../components/ProfileCard";
import { getMyMatches } from "@dreamrealm/api-client";
import type { MatchWithProfile } from "@dreamrealm/api-client";

export default function MatchesPage() {
  const { client, user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyMatches(client);
        if (!cancelled) setMatches(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-glow">Your Matches</h1>
          <p className="text-text-muted">People you have mutually connected with.</p>
        </div>

        {isLoading ? (
          <p className="text-text-muted">Loading matches...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="mb-2 text-lg font-semibold text-text">No matches yet</p>
            <p className="mb-4 text-sm text-text-muted">Head over to Discover to start swiping.</p>
            <Link href="/discover" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition">
              Discover Profiles
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <ProfileCard
                key={m.id}
                id={m.target_profile?.id ?? m.id}
                name={m.target_profile?.display_name ?? "Unknown"}
                bio={m.target_profile?.bio ?? undefined}
                mode={m.target_profile?.mode}
                verified={m.target_profile?.is_verified}
                trustScore={m.target_profile?.trust_score}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
