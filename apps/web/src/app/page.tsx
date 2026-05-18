/**
 * Dashboard (Home) page
 *
 * Authenticated shell for the DreamRealm web app.
 * Displays a navigation header and placeholder module cards
 * for Discover, Matches, Messages, Streams, and Wallet.
 *
 * TODO: Populate each module with real data queries and components.
 */

"use client";

import { useAuth } from "./components/AuthProvider";
import Link from "next/link";

const MODULES = [
  { name: "Discover", description: "Swipe and explore profiles nearby", href: "/discover" },
  { name: "Matches", description: "View your mutual connections", href: "/matches" },
  { name: "Messages", description: "Chat with your matches", href: "/messages" },
  { name: "Streams", description: "Watch live creator channels", href: "/streams" },
  { name: "Events", description: "Find local meetups and parties", href: "/events" },
  { name: "Wallet", description: "DreamCoin balance and history", href: "/wallet" },
];

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-muted">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-muted">Please sign in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-bold text-primary">DreamRealm</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{user.email}</span>
            <button
              onClick={signOut}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-light"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-text">Welcome back</h1>
        <p className="mb-8 text-text-muted">Pick a module to get started</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.name}
              href={m.href}
              className="group block rounded-2xl border border-border bg-surface p-6 transition hover:border-primary hover:shadow-lg"
            >
              <h2 className="mb-1 text-lg font-semibold text-text group-hover:text-primary">
                {m.name}
              </h2>
              <p className="text-sm text-text-muted">{m.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
