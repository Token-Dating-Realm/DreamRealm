/**
 * Public User Profile Page
 *
 * Placeholder page for viewing another user's public profile.
 * Shows avatar, name, bio, joined realms, and action buttons.
 */

"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { getUserByUsername } from "../../lib/users";

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const user = getUserByUsername(params.id);

  if (!user) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/realms" className="hover:text-primary transition">
            Realms
          </Link>
          <span>/</span>
          <span className="text-text">{user.displayName}</span>
        </div>

        {/* Profile Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/40 text-3xl font-bold text-white">
              {user.displayName.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{user.displayName}</h1>
                {user.verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="mb-2 text-sm text-primary capitalize">{user.role.replace(/_/g, " ")}</p>
              <p className="max-w-lg text-sm leading-relaxed text-text-muted">{user.bio}</p>
              {user.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs text-primary">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-xl font-bold text-text">{user.trustScore}</p>
            <p className="text-xs text-text-muted">Trust Score</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-xl font-bold text-text">{user.joinedRealms.length}</p>
            <p className="text-xs text-text-muted">Realms Joined</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-xl font-bold text-text">{user.savedRealms.length}</p>
            <p className="text-xs text-text-muted">Saved Realms</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <button className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition">
            Follow
          </button>
          <Link
            href="/messages"
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-center text-sm text-text hover:bg-surface-light transition"
          >
            Message
          </Link>
        </div>

        {/* Joined Realms */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
              Joined Realms
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.joinedRealms.map((realm) => (
                <span
                  key={realm}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted"
                >
                  {realm}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
              Saved Realms
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.savedRealms.map((realm) => (
                <span
                  key={realm}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted"
                >
                  {realm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
