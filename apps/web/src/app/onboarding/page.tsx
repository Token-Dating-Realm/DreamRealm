/**
 * Web Onboarding / Profile Creation Wizard
 *
 * Multi-step form for new users to configure their profile mode,
 * display name, bio, birth date, city, location, and preferences.
 * Validates with Zod before submission via createMyProfile.
 * Redirects to / after completion.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { createMyProfile } from "@dreamrealm/api-client";
import { profileModeSchema, visibilitySchema } from "@dreamrealm/types";
import type { ProfileMode, Visibility } from "@dreamrealm/types";

const STEPS = ["mode", "basics", "location", "preferences", "review"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const { client, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("mode");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ProfileMode | "">("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [lookingFor, setLookingFor] = useState<ProfileMode[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("public");

  const profileModes = profileModeSchema.options;
  const visibilities = visibilitySchema.options;

  const toggleLookingFor = (m: ProfileMode) => {
    setLookingFor((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].slice(0, 5)
    );
  };

  const canProceed = () => {
    switch (step) {
      case "mode":
        return !!mode;
      case "basics":
        return displayName.trim().length >= 1 && displayName.trim().length <= 100;
      case "location":
        return true; // optional
      case "preferences":
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!mode) return;
    setIsPending(true);
    setError(null);
    try {
      await createMyProfile(client, {
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
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-8 shadow-lg border border-border">
        <h1 className="mb-6 text-center text-2xl font-bold text-primary">
          Welcome to DreamRealm
        </h1>

        {/* Progress */}
        <div className="mb-6 flex items-center justify-between text-sm text-text-muted">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  STEPS.indexOf(step) >= i
                    ? "bg-primary text-white"
                    : "bg-surface-light text-text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className={STEPS.indexOf(step) >= i ? "text-text" : ""}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 text-border">/</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {step === "mode" && (
          <div className="space-y-4">
            <p className="text-text-muted">Choose your profile type</p>
            <div className="grid grid-cols-2 gap-3">
              {profileModes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                    mode === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text hover:border-primary"
                  }`}
                >
                  {m.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "basics" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">
                Display Name <span className="text-danger">*</span>
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name on DreamRealm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Tell others about yourself"
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
          </div>
        )}

        {step === "location" && (
          <div className="space-y-4">
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
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-muted">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
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
          </div>
        )}

        {step === "preferences" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">
                I&apos;m looking for (max 5)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profileModes.map((m) => (
                  <button
                    key={m}
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
          </div>
        )}

        {step === "review" && (
          <div className="space-y-3 text-sm text-text">
            <div className="rounded-lg bg-surface-light p-4">
              <p className="text-text-muted">Mode</p>
              <p className="font-semibold">{mode.replace(/_/g, " ")}</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <p className="text-text-muted">Name</p>
              <p className="font-semibold">{displayName}</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <p className="text-text-muted">Location</p>
              <p>
                {city || "—"}, {country || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <p className="text-text-muted">Looking for</p>
              <p>{lookingFor.length > 0 ? lookingFor.map((m) => m.replace(/_/g, " ")).join(", ") : "—"}</p>
            </div>
            <div className="rounded-lg bg-surface-light p-4">
              <p className="text-text-muted">Visibility</p>
              <p>{visibility.charAt(0).toUpperCase() + visibility.slice(1)}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => {
              const idx = STEPS.indexOf(step);
              if (idx > 0) setStep(STEPS[idx - 1] as Step);
            }}
            disabled={STEPS.indexOf(step) === 0}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-surface-light disabled:opacity-40"
          >
            Back
          </button>

          {step === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Finish"}
            </button>
          ) : (
            <button
              onClick={() => {
                const idx = STEPS.indexOf(step);
                if (idx < STEPS.length - 1) setStep(STEPS[idx + 1] as Step);
              }}
              disabled={!canProceed()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
