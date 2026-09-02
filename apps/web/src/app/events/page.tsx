/**
 * Events Page
 *
 * Lists upcoming events from the `events` table, joined against
 * `profiles` for organizer display info.
 */

"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../components/AuthProvider";
import type { Event } from "@dreamrealm/types";

interface EventWithOrganizer extends Event {
  organizer?: { display_name: string } | null;
}

export default function EventsPage() {
  const { client } = useAuth();
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fetchError } = await client
          .from("events")
          .select("*, organizer:profiles!events_profile_id_fkey(display_name)")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(50);
        if (fetchError) throw fetchError;
        if (!cancelled) setEvents((data ?? []) as unknown as EventWithOrganizer[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load events");
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
          <h1 className="mb-1 text-2xl font-bold text-glow">Events</h1>
          <p className="text-text-muted">Upcoming local meetups and parties.</p>
        </div>

        {isLoading ? (
          <p className="text-text-muted">Loading events...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-lg font-semibold text-text">No upcoming events</p>
            <p className="text-sm text-text-muted">Check back later for new events.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div key={e.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-glow/50">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  {new Date(e.starts_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <h3 className="mb-1 text-sm font-bold text-text">{e.title}</h3>
                {e.description && <p className="mb-3 line-clamp-2 text-xs text-text-muted">{e.description}</p>}
                <div className="mt-auto flex items-center justify-between text-xs text-text-muted">
                  <span>{e.city}{e.country ? `, ${e.country}` : ""}</span>
                  <span>by {e.organizer?.display_name ?? "Unknown"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
