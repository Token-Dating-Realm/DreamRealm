/**
 * Realm Detail Page
 *
 * Shows a single realm's full description, status, member count, and a
 * real Join/Leave button backed by the `realms` / `realm_members` tables
 * (023_realms.sql). Links back to realms list.
 */

"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { useAuth } from "../../components/AuthProvider";
import { getRealmBySlug, getMyRealmMemberships, joinRealm, leaveRealm } from "@dreamrealm/api-client";
import type { Realm } from "@dreamrealm/api-client";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-success/20 text-success",
  beta: "bg-warning/20 text-warning",
  archived: "bg-text-muted/20 text-text-muted",
  private: "bg-danger/20 text-danger",
};

export default function RealmDetailPage({ params }: { params: { id: string } }) {
  const { client, user } = useAuth();
  const [realm, setRealm] = useState<Realm | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRealmBySlug(client, params.id);
        if (cancelled) return;
        if (!data) {
          setNotFoundFlag(true);
        } else {
          setRealm(data);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, params.id]);

  useEffect(() => {
    if (!user || !realm) return;
    let cancelled = false;
    (async () => {
      const memberships = await getMyRealmMemberships(client).catch(() => []);
      if (!cancelled) setIsJoined(memberships.some((m) => m.realm_id === realm.id));
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user, realm]);

  const handleToggleJoin = async () => {
    if (!user || !realm) return;
    setIsJoining(true);
    try {
      if (isJoined) {
        await leaveRealm(client, realm.id);
        setIsJoined(false);
        setRealm((r) => (r ? { ...r, member_count: Math.max(r.member_count - 1, 0) } : r));
      } else {
        await joinRealm(client, realm.id);
        setIsJoined(true);
        setRealm((r) => (r ? { ...r, member_count: r.member_count + 1 } : r));
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (notFoundFlag) {
    notFound();
  }

  if (isLoading || !realm) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-text-muted">Loading realm...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/realms" className="hover:text-primary transition">
            Realms
          </Link>
          <span>/</span>
          <span className="text-text">{realm.name}</span>
        </div>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 to-accent/20 p-8 md:p-12">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {realm.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[realm.status] ?? "bg-text-muted/20 text-text-muted"}`}>
                  {realm.status}
                </span>
                {realm.is_featured && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="mb-3 text-3xl font-bold text-glow md:text-4xl">{realm.name}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-text-muted">
                {realm.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-4xl font-bold text-white backdrop-blur-sm">
                {realm.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats + Action */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{realm.member_count.toLocaleString()}</p>
            <p className="text-xs text-text-muted">Members</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{realm.category}</p>
            <p className="text-xs text-text-muted">Category</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{realm.status === "active" ? "Open" : "Limited"}</p>
            <p className="text-xs text-text-muted">Access</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <h2 className="text-xl font-bold text-text">Enter {realm.name}</h2>
          <p className="max-w-md text-sm text-text-muted">
            Join the community, participate in discussions, attend events, and connect
            with fellow dreamers in this realm.
          </p>
          <div className="flex gap-3">
            {user ? (
              <button
                onClick={handleToggleJoin}
                disabled={isJoining}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  isJoined
                    ? "border border-success/50 bg-success/10 text-success hover:bg-success/20"
                    : "bg-primary text-white shadow-glow hover:bg-primary-dark"
                }`}
              >
                {isJoining ? "..." : isJoined ? "Joined" : "Join Realm"}
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition"
              >
                Sign In to Join
              </Link>
            )}
            <Link
              href="/realms"
              className="rounded-xl border border-border px-6 py-2.5 text-sm text-text hover:bg-surface-light transition"
            >
              Browse More
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
