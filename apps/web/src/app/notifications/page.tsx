/**
 * Notifications Page
 *
 * Placeholder list of notification items. Styled like the Messages list
 * for visual consistency.
 */

"use client";

import AppShell from "../components/AppShell";
import Link from "next/link";

const PLACEHOLDER_NOTIFICATIONS = [
  { title: "New match in Cupid's Corner", body: "You and DeepThinker liked each other.", time: "2m ago", type: "match", read: false },
  { title: "Stream starting soon", body: "NovaStar is going live in The Creator's Market in 15 minutes.", time: "15m ago", type: "stream_start", read: false },
  { title: "Trust score updated", body: "Your trust score increased to 72. Keep being a positive presence.", time: "1h ago", type: "system", read: true },
  { title: "New message", body: "CupidVibes sent you a message.", time: "3h ago", type: "message", read: true },
  { title: "Realm invite", body: "You have been invited to join Business Builder Realm.", time: "1d ago", type: "system", read: true },
];

const TYPE_ICON: Record<string, string> = {
  match: "text-accent",
  message: "text-primary",
  stream_start: "text-warning",
  system: "text-text-muted",
};

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-glow">Notifications</h1>
          <button className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-surface-light hover:text-text transition">
            Mark all read
          </button>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          {PLACEHOLDER_NOTIFICATIONS.map((n, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-5 py-4 transition hover:bg-surface-light ${
                !n.read ? "bg-primary/5" : ""
              }`}
            >
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-transparent"}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">{n.title}</p>
                <p className="mt-0.5 text-sm text-text-muted">{n.body}</p>
                <p className={`mt-1 text-xs ${TYPE_ICON[n.type] ?? "text-text-muted"}`}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        {PLACEHOLDER_NOTIFICATIONS.length === 0 && (
          <div className="py-20 text-center text-text-muted">No notifications yet.</div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
