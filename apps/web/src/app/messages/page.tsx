/**
 * Web Conversation List Page
 *
 * Displays all conversations the current user is a member of,
 * ordered by last message. Shows unread indicators and links
 * to individual chat rooms.
 *
 * TODO: Fetch last message content/sender for richer previews.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../components/AuthProvider";
import AppShell from "../components/AppShell";
import {
  getMyConversations,
  subscribeToConversations,
} from "@dreamrealm/api-client";
import type { ConversationWithLastMessage } from "@dreamrealm/api-client";
import Link from "next/link";

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function MessagesPage() {
  const { client } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyConversations(client);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToConversations(client, () => {
      load();
    });
    return unsubscribe;
  }, [client, load]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Loading conversations...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-danger">{error}</p>
      </main>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <h1 className="text-xl font-bold text-text">Messages</h1>
            <Link
              href="/"
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-light"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl">
          {conversations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-text-muted">No conversations yet.</p>
              <p className="mt-1 text-sm text-text-muted">
                Start matching to chat with people.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-surface-light"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-text">
                        {c.title ?? (c.type === "direct" ? "Direct Message" : "Group Chat")}
                      </h2>
                      {c.is_encrypted && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Encrypted
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {c.type === "direct" ? "Private conversation" : `${c.type} chat`}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    {c.last_message_at && (
                      <span className="text-xs text-text-muted">
                        {formatTimeAgo(c.last_message_at)}
                      </span>
                    )}
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${
                        c.last_message_at ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
