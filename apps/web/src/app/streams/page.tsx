/**
 * Streams Page
 *
 * Lists active/live and upcoming streams from the `streams` table,
 * joined against `profiles` for creator display info.
 */

"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../components/AuthProvider";
import type { Stream } from "@dreamrealm/types";

interface StreamWithCreator extends Stream {
  creator?: { display_name: string } | null;
}

const STATUS_BADGE: Record<string, string> = {
  live: "bg-danger/20 text-danger",
  scheduled: "bg-warning/20 text-warning",
  ended: "bg-text-muted/20 text-text-muted",
  cancelled: "bg-text-muted/20 text-text-muted",
};

export default function StreamsPage() {
  const { client } = useAuth();
  const [streams, setStreams] = useState<StreamWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fetchError } = await client
          .from("streams")
          .select("*, creator:profiles!streams_profile_id_fkey(display_name)")
          .in("status", ["live", "scheduled"])
          .order("status", { ascending: true })
          .order("scheduled_at", { ascending: true })
          .limit(50);
        if (fetchError) throw fetchError;
        if (!cancelled) setStreams((data ?? []) as unknown as StreamWithCreator[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load streams");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-glow">Streams</h1>
          <p className="text-text-muted">Live and upcoming creator channels.</p>
        </div>

        {isLoading ? (
          <p className="text-text-muted">Loading streams...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : streams.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-lg font-semibold text-text">No streams right now</p>
            <p className="text-sm text-text-muted">Check back later for live channels.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((s) => (
              <div key={s.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-glow/50">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_BADGE[s.status] ?? "bg-text-muted/20 text-text-muted"}`}>
                    {s.status}
                  </span>
                  {s.is_private && (
                    <span className="text-[10px] text-text-muted">Private</span>
                  )}
                </div>
                <h3 className="mb-1 text-sm font-bold text-text">{s.title}</h3>
                {s.description && <p className="mb-3 line-clamp-2 text-xs text-text-muted">{s.description}</p>}
                <div className="mt-auto text-xs text-text-muted">
                  Hosted by {s.creator?.display_name ?? "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
