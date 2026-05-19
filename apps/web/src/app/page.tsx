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
import { SAMPLE_POSTS } from "./lib/posts";
import { DREAMCADIAN_PROJECTS } from "./lib/projects";
import { POST_TYPE_LABELS, POST_TYPE_COLORS } from "./lib/posts";
import type { PostType } from "./lib/posts";

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
            <RealmCard key={realm.id} realm={realm} showActions={false} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-4 rounded-3xl border border-border bg-surface/50 p-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{SAMPLE_REALMS.length}</p>
            <p className="text-xs text-text-muted">Realms</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">
              {SAMPLE_REALMS.reduce((sum, r) => sum + r.member_count, 0).toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Dreamers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success">{DREAMCADIAN_PROJECTS.length}</p>
            <p className="text-xs text-text-muted">Ecosystem Projects</p>
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

function AuthenticatedDashboard() {
  const { user } = useAuth();
  const featured = getFeaturedRealms();
  const suggestedRealms = SAMPLE_REALMS.filter((r) => !r.is_featured).slice(0, 3);
  const recentPosts = SAMPLE_POSTS.slice(0, 3);
  const activeProjects = DREAMCADIAN_PROJECTS.filter((p) => p.status === "active" || p.status === "beta").slice(0, 3);

  const firstName = user?.email?.split("@")[0] ?? "Dreamer";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-text">Welcome back, {firstName}</h1>
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Realms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured realms */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Featured Realms</h2>
              <Link href="/realms" className="text-xs font-semibold text-primary hover:text-accent transition">
                Explore All →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((realm) => (
                <RealmCard key={realm.id} realm={realm} showActions={false} />
              ))}
            </div>
          </section>

          {/* Suggested realms */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Suggested for You</h2>
              <Link href="/realms" className="text-xs font-semibold text-primary hover:text-accent transition">
                Browse →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {suggestedRealms.map((realm) => (
                <Link
                  key={realm.id}
                  href={`/realms/${realm.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/50 hover:shadow-glow/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold text-white">
                    {realm.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text group-hover:text-primary transition-colors">{realm.name}</p>
                    <p className="text-xs text-text-muted">{realm.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent community activity */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Recent Activity</h2>
              <Link href="/feed" className="text-xs font-semibold text-primary hover:text-accent transition">
                View Feed →
              </Link>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/30 hover:shadow-glow/30">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      {post.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-text">{post.authorName}</span>
                    {post.type && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${POST_TYPE_COLORS[post.type as PostType]}`}>
                        {POST_TYPE_LABELS[post.type as PostType]}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-text-muted">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{formatTimeAgo(post.timestamp)}</span>
                    <span>·</span>
                    <span className="text-primary">{post.realm}</span>
                    <span>·</span>
                    <span>{post.likes} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Shortcuts */}
        <div className="space-y-8">
          {/* Saved Realms Preview */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Saved Realms</h2>
              <Link href="/realms" className="text-xs text-primary hover:underline">See All</Link>
            </div>
            <div className="space-y-3">
              {featured.slice(0, 2).map((realm) => (
                <Link key={realm.id} href={`/realms/${realm.slug}`} className="group flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-bold text-white">
                    {realm.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text group-hover:text-primary transition">{realm.name}</p>
                    <p className="text-xs text-text-muted">{realm.member_count.toLocaleString()} members</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/realms"
              className="mt-4 block w-full rounded-lg border border-border py-2 text-center text-xs font-semibold text-text-muted transition hover:border-primary/50 hover:text-text"
            >
              Browse All Realms
            </Link>
          </section>

          {/* Joined Realms Preview */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Joined Realms</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">2 active</span>
            </div>
            <div className="space-y-3">
              {SAMPLE_REALMS.filter((r) => r.slug === "creators-market" || r.slug === "cupids-corner").map((realm) => (
                <Link key={realm.id} href={`/realms/${realm.slug}`} className="group flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-success/20 to-primary/20 text-xs font-bold text-white">
                    {realm.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text group-hover:text-primary transition">{realm.name}</p>
                    <p className="text-xs text-text-muted">{realm.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Dreamcadian Shortcuts */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Ecosystem</h2>
            </div>
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
                    project.color === "purple" ? "from-primary/20 to-primary-dark/20" :
                    project.color === "green" ? "from-success/20 to-emerald-600/20" :
                    project.color === "orange" ? "from-warning/20 to-amber-600/20" :
                    "from-blue-500/20 to-indigo-500/20"
                  } text-xs font-bold text-white`}>
                    {project.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{project.name}</p>
                    <p className="text-xs text-text-muted">{project.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/hub"
              className="mt-4 block w-full rounded-lg bg-primary py-2 text-center text-xs font-semibold text-white shadow-glow transition hover:bg-primary-dark"
            >
              Explore Dreamcadian Hub
            </Link>
          </section>
        </div>
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
