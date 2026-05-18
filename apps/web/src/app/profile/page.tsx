/**
 * Web Profile View Page
 *
 * Displays the current authenticated user's profile and user metadata.
 * Provides a link to edit the profile.
 */

"use client";

import { useAuth } from "../components/AuthProvider";
import Link from "next/link";

export default function ProfilePage() {
  const { user, profile, isProfileLoading } = useAuth();

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
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-surface p-8 shadow-lg border border-border">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text">Your Profile</h1>
          <Link
            href="/profile/edit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Edit Profile
          </Link>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-lg bg-surface-light p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Account
            </h2>
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

          {/* Profile Info */}
          {profile ? (
            <div className="rounded-lg bg-surface-light p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                Profile
              </h2>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Display Name</span>
                  <span className="text-text">{profile.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Mode</span>
                  <span className="text-text">{profile.mode.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Visibility</span>
                  <span className="text-text">{profile.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Trust Score</span>
                  <span className="text-text">{profile.trust_score}/100</span>
                </div>
                {profile.bio && (
                  <div>
                    <span className="text-text-muted">Bio</span>
                    <p className="mt-1 text-text">{profile.bio}</p>
                  </div>
                )}
                {(profile.city || profile.country) && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Location</span>
                    <span className="text-text">
                      {profile.city}
                      {profile.city && profile.country ? ", " : ""}
                      {profile.country}
                    </span>
                  </div>
                )}
                {profile.birth_date && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Birth Date</span>
                    <span className="text-text">{profile.birth_date}</span>
                  </div>
                )}
                {profile.looking_for && profile.looking_for.length > 0 && (
                  <div>
                    <span className="text-text-muted">Looking for</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.looking_for.map((m) => (
                        <span
                          key={m}
                          className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {m.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-surface-light p-4 text-center">
              <p className="text-text-muted">No profile found.</p>
              <Link
                href="/onboarding"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                Create your profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
