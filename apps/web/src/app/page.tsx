/**
 * Home / Dashboard / Landing page
 *
 * Dual-mode page:
 * - Guest mode: immersive landing with hero, realm preview, and CTAs
 * - Authenticated mode: dashboard with modules + featured realms
 */

"use client";

import { useAuth } from "./components/AuthProvider";
import Link from "next/link";
import AppShell from "./components/AppShell";
import RealmCard from "./components/RealmCard";
import { getFeaturedRealms, SAMPLE_REALMS } from "./lib/realms";

const MODULES = [
  { name: "Discover", description: "Swipe and explore profiles nearby", href: "/discover", icon: "🔍" },
  { name: "Matches", description: "View your mutual connections", href: "/matches", icon: "💞" },
  { name: "Messages", description: "Chat with your matches", href: "/messages", icon: "💬" },
  { name: "Streams", description: "Watch live creator channels", href: "/streams", icon: "📡" },
  { name: "Events", description: "Find local meetups and parties", href: "/events", icon: "🎉" },
  { name: "Wallet", description: "DreamCoin balance and history", href: "/wallet", icon: "🪙" },
];

function GuestLanding() {
  const featured = getFeaturedRealms();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Dreamcadian Ecosystem
          </div>
          <h1 className="mb-4 text-4xl font-bold text-glow md:text-6xl">
            Enter the <span className="text-primary">DreamRealm</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-text-muted">
            A digital world built for connection, creation, and community.
            Step into realms designed for dreamers, daters, creators, and builders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition hover:bg-surface-light"
            >
              Sign In
            </Link>
            <Link
              href="/realms"
              className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:border-primary/50 hover:text-text"
            >
              Explore Realms
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Realms */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text">Featured Realms</h2>
            <p className="text-sm text-text-muted">Communities waiting for you</p>
          </div>
          <Link
            href="/realms"
            className="text-sm font-semibold text-primary hover:text-accent transition"
          >
            View All →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((realm) => (
            <RealmCard key={realm.id} realm={realm} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-4 rounded-3xl border border-border bg-surface/50 p-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-xs text-text-muted">Realms</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">
              {SAMPLE_REALMS.reduce((sum, r) => sum + r.member_count, 0).toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Dreamers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success">1</p>
            <p className="text-xs text-text-muted">Ecosystem</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="mb-3 text-2xl font-bold text-text">Ready to dream?</h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-text-muted">
          Join DreamRealm and become part of a growing digital world where communities,
          creators, and connections thrive.
        </p>
        <Link
          href="/signup"
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-3 text-sm font-semibold text-white shadow-glow-accent transition hover:opacity-90"
        >
          Start Your Journey
        </Link>
      </section>
    </div>
  );
}

function AuthenticatedDashboard() {
  const { user, signOut } = useAuth();
  const featured = getFeaturedRealms();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-text">Welcome back, {user?.email?.split("@")[0]}</h1>
        <p className="text-text-muted">Your dashboard — pick a module or explore a realm.</p>
      </div>

      {/* Module grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/50 hover:shadow-glow"
          >
            <span className="text-2xl">{m.icon}</span>
            <div>
              <h2 className="mb-0.5 text-sm font-semibold text-text group-hover:text-primary transition-colors">
                {m.name}
              </h2>
              <p className="text-xs text-text-muted">{m.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured realms */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Featured Realms</h2>
        <Link href="/realms" className="text-xs font-semibold text-primary hover:text-accent transition">
          Explore All →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((realm) => (
          <RealmCard key={realm.id} realm={realm} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-muted">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <GuestLanding />;
  }

  return (
    <AppShell>
      <AuthenticatedDashboard />
    </AppShell>
  );
}
