/**
 * Discover Page
 *
 * Calls the `nearby_profiles` RPC (via getNearbyProfiles) to surface
 * nearby profiles as cards. Requests browser geolocation; falls back
 * to the user's own profile coordinates when geolocation is denied.
 */

"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import ProfileCard from "../components/ProfileCard";
import { useAuth } from "../components/AuthProvider";
import { getNearbyProfiles, getMyProfile } from "@dreamrealm/api-client";
import type { Profile } from "@dreamrealm/types";

export default function DiscoverPage() {
  const { client, user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async (latitude: number, longitude: number) => {
      try {
        const data = await getNearbyProfiles(client, { latitude, longitude, radiusKm: 100, limit: 30 });
        if (!cancelled) setProfiles(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load nearby profiles");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const start = async () => {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => load(pos.coords.latitude, pos.coords.longitude),
          async () => {
            // Fall back to the current user's own profile coordinates
            const myProfile = await getMyProfile(client).catch(() => null);
            if (myProfile?.latitude != null && myProfile?.longitude != null) {
              load(myProfile.latitude, myProfile.longitude);
            } else if (!cancelled) {
              setError("Enable location access, or set your location in your profile, to discover nearby people.");
              setIsLoading(false);
            }
          },
          { timeout: 8000 }
        );
      } else {
        const myProfile = await getMyProfile(client).catch(() => null);
        if (myProfile?.latitude != null && myProfile?.longitude != null) {
          load(myProfile.latitude, myProfile.longitude);
        } else if (!cancelled) {
          setError("Set your location in your profile to discover nearby people.");
          setIsLoading(false);
        }
      }
    };

    start();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-glow">Discover</h1>
          <p className="text-text-muted">Nearby profiles waiting to connect.</p>
        </div>

        {isLoading ? (
          <p className="text-text-muted">Finding people nearby...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-lg font-semibold text-text">No one nearby yet</p>
            <p className="text-sm text-text-muted">Check back soon as more dreamers join.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                id={p.id}
                name={p.display_name}
                bio={p.bio ?? undefined}
                mode={p.mode}
                verified={p.is_verified}
                trustScore={p.trust_score}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
