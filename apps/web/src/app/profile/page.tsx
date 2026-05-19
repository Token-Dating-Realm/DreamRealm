/**
 * Web Profile View Page
 *
 * Displays the current authenticated user's profile and user metadata.
 * Provides a link to edit the profile.
 */

"use client";

import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import AppShell from "../components/AppShell";
import { SAMPLE_USERS } from "../lib/users";

export default function ProfilePage() {
  const { user, profile, isProfileLoading } = useAuth();
  // Use the first sample user as a preview when no real profile exists
  const previewUser = SAMPLE_USERS[0]!;

  if (isProfileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Please sign in to view your profile.</p>
      </main>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/40 text-3xl font-bold text-white">
              {previewUser.displayName.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{previewUser.displayName}</h1>
                {previewUser.verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="mb-2 text-sm text-primary capitalize">{previewUser.role.replace("_", " ")}</p>
              <p className="max-w-lg text-sm leading-relaxed text-text-muted">{previewUser.bio}</p>
              {previewUser.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewUser.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs text-primary">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/profile/edit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{previewUser.trustScore}</p>
            <p className="text-xs text-text-muted">Trust Score</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{previewUser.joinedRealms.length}</p>
            <p className="text-xs text-text-muted">Realms Joined</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center">
            <p className="text-2xl font-bold text-text">{previewUser.savedRealms.length}</p>
            <p className="text-xs text-text-muted">Saved Realms</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Joined Realms */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Joined Realms</h2>
            {previewUser.joinedRealms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewUser.joinedRealms.map((realm) => (
                  <span key={realm} className="rounded-full border border-border bg-surface-light px-3 py-1 text-xs text-text-muted">
                    {realm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No realms joined yet.</p>
            )}
            <Link href="/realms" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
              Explore Realms →
            </Link>
          </div>

          {/* Saved Realms */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Saved Realms</h2>
            {previewUser.savedRealms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewUser.savedRealms.map((realm) => (
                  <span key={realm} className="rounded-full border border-border bg-surface-light px-3 py-1 text-xs text-text-muted">
                    {realm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No realms saved yet.</p>
            )}
            <Link href="/realms" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
              Explore Realms →
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Account</h2>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Email</span>
              <span className="text-text">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Role</span>
              <span className="text-text">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Trust Level</span>
              <span className="text-text">{user.trust_bucket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Verified</span>
              <span className="text-text">{user.email_confirmed_at ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        {/* Onboarding fallback */}
        {!profile && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-sm text-text-muted mb-2">Complete your profile setup</p>
            <Link
              href="/onboarding"
              className="inline-block rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark"
            >
              Finish Setup
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
