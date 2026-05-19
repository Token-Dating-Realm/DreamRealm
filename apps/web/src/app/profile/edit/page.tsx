/**
 * Web Profile Edit Page
 *
 * Form to update profile fields via updateMyProfile.
 * Uses Zod validation and the shared api-client helper.
 * Redirects back to /profile on success.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { updateMyProfile } from "@dreamrealm/api-client";
import { profileModeSchema, visibilitySchema } from "@dreamrealm/types";
import type { ProfileMode, Visibility } from "@dreamrealm/types";

export default function EditProfilePage() {
  const { client, profile, isProfileLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<ProfileMode>(profile?.mode ?? "single_male");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [latitude, setLatitude] = useState(profile?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(profile?.longitude?.toString() ?? "");
  const [lookingFor, setLookingFor] = useState<ProfileMode[]>(profile?.looking_for ?? []);
  const [visibility, setVisibility] = useState<Visibility>(profile?.visibility ?? "public");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileModes = profileModeSchema.options;
  const visibilities = visibilitySchema.options;

  const toggleLookingFor = (m: ProfileMode) => {
    setLookingFor((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].slice(0, 5)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await updateMyProfile(client, {
        mode,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        birth_date: birthDate || null,
        city: city.trim() || null,
        country: country.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
        visibility,
      });
      await refreshProfile();
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  if (isProfileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">No profile found. Create one first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-surface p-8 shadow-lg border border-border">
        <h1 className="mb-6 text-2xl font-bold text-text">Edit Profile</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted">
              Display Name <span className="text-danger">*</span>
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted">Profile Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ProfileMode)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {profileModes.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted">
              I&apos;m looking for (max 5)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileModes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleLookingFor(m)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    lookingFor.includes(m)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:border-primary"
                  }`}
                >
                  {m.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {visibilities.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="rounded-lg border border-border px-6 py-2 text-sm text-text hover:bg-surface-light"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
