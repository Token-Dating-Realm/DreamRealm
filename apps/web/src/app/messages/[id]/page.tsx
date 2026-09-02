/**
 * Web Chat Room Page (Dynamic Route)
 *
 * Displays messages for a specific conversation with real-time updates
 * via Supabase Realtime. Includes message sending, auto-scroll, and
 * basic sender differentiation (me vs others).
 *
 * Transparently encrypts/decrypts when both this conversation and the
 * current member have E2EE key material set up (see getConversationKeyForMember).
 *
 * TODO: Add image uploads, reply threads.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../components/AuthProvider";
import AppShell from "../../components/AppShell";
import {
  getConversationMessages,
  sendMessage,
  subscribeToMessages,
  updateLastRead,
  getConversationKeyForMember,
} from "@dreamrealm/api-client";
import type { Message } from "@dreamrealm/types";
import Link from "next/link";

export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { client, user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationKey, setConversationKey] = useState<CryptoKey | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (key: CryptoKey | null) => {
      try {
        const data = await getConversationMessages(client, id, 50, undefined, key);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    },
    [client, id]
  );

  // Resolve this member's conversation key (if E2EE is set up), then load/subscribe
  useEffect(() => {
    if (!user || !profile) return;
    let cancelled = false;

    (async () => {
      const key = await getConversationKeyForMember(client, id, user.id, profile.id).catch(() => null);
      if (cancelled) return;
      setConversationKey(key);
      await loadMessages(key);
    })();

    updateLastRead(client, id).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [client, id, user, profile, loadMessages]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      client,
      id,
      (newMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      },
      conversationKey
    );

    return () => {
      unsubscribe();
    };
  }, [client, id, conversationKey]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const sent = await sendMessage(
        client,
        {
          conversation_id: id,
          type: "text",
          content: input.trim(),
        },
        conversationKey
      );
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const myProfileId = profile?.id;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
        <header className="border-b border-border bg-surface px-6 py-3">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link
              href="/messages"
              className="text-sm text-text-muted hover:text-text"
            >
              ← Back
            </Link>
            <h1 className="text-sm font-semibold text-text">Chat</h1>
            <span className="text-sm text-text-muted">{messages.length} messages</span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-muted">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-muted">No messages yet. Say hello!</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender_profile_id === myProfileId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        isMe
                          ? "bg-primary text-white"
                          : "bg-surface-light text-text"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isMe ? "text-white/70" : "text-text-muted"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-surface px-6 py-3">
          <form
            onSubmit={handleSend}
            className="mx-auto flex max-w-3xl items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-border bg-surface-light px-4 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isSending ? "..." : "Send"}
            </button>
          </form>
          {error && (
            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
