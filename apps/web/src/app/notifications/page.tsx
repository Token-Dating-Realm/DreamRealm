/**
 * Notifications Page
 *
 * Real notifications for the current user, backed by the `notifications`
 * table (011_notifications.sql).
 */

"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { getMyNotifications, markAllNotificationsRead } from "@dreamrealm/api-client";
import type { Notification } from "@dreamrealm/types";

const TYPE_ICON: Record<string, string> = {
  match: "text-accent",
  message: "text-primary",
  like: "text-accent",
  tip: "text-warning",
  stream_start: "text-warning",
  event_reminder: "text-warning",
  system: "text-text-muted",
};

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

export default function NotificationsPage() {
  const { client, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyNotifications(client);
        if (!cancelled) setNotifications(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notifications read");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-glow">Notifications</h1>
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.is_read)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-surface-light hover:text-text transition disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        {isLoading ? (
          <p className="text-text-muted">Loading notifications...</p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-5 py-4 transition hover:bg-surface-light ${
                  !n.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? "bg-primary" : "bg-transparent"}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{n.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{n.body}</p>
                  <p className={`mt-1 text-xs ${TYPE_ICON[n.type] ?? "text-text-muted"}`}>{formatTimeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
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
