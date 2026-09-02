/**
 * Settings Page
 *
 * Account settings form. Toggles are persisted to `profiles.preferences`
 * (024_account_preferences.sql). Delete Account soft-deletes the user
 * (`users.is_active = false`) then signs out.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useAuth } from "../components/AuthProvider";

interface Preferences {
  darkMode: boolean;
  emailNotifs: boolean;
  pushNotifs: boolean;
  profileVisible: boolean;
  locationHidden: boolean;
}

const DEFAULT_PREFS: Preferences = {
  darkMode: true,
  emailNotifs: true,
  pushNotifs: true,
  profileVisible: true,
  locationHidden: false,
};

export default function SettingsPage() {
  const { client, user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setPrefs({ ...DEFAULT_PREFS, ...(profile.preferences as Partial<Preferences>) });
    }
  }, [profile]);

  const updatePref = async (key: keyof Preferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    try {
      const { error: updateError } = await (client.from("profiles") as any)
        .update({ preferences: next })
        .eq("id", profile.id);
      if (updateError) throw updateError;
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete your account? This will deactivate your DreamRealm account.")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const { error: deactivateError } = await (client.from("users") as any)
        .update({ is_active: false })
        .eq("id", user.id);
      if (deactivateError) throw deactivateError;
      await client.auth.signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const Toggle = ({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${on ? "bg-primary" : "bg-surface-light"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-glow">Account Settings</h1>

        {error && (
          <div className="mb-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Appearance */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">Dark Mode</p>
                <p className="text-xs text-text-muted">Immersive dark theme optimized for DreamRealm</p>
              </div>
              <Toggle on={prefs.darkMode} disabled={isSaving} onClick={() => updatePref("darkMode", !prefs.darkMode)} />
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Email Notifications</p>
                  <p className="text-xs text-text-muted">Matches, messages, and important updates</p>
                </div>
                <Toggle on={prefs.emailNotifs} disabled={isSaving} onClick={() => updatePref("emailNotifs", !prefs.emailNotifs)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Push Notifications</p>
                  <p className="text-xs text-text-muted">Real-time alerts on your device</p>
                </div>
                <Toggle on={prefs.pushNotifs} disabled={isSaving} onClick={() => updatePref("pushNotifs", !prefs.pushNotifs)} />
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Profile Visible</p>
                  <p className="text-xs text-text-muted">Allow others to discover your profile</p>
                </div>
                <Toggle on={prefs.profileVisible} disabled={isSaving} onClick={() => updatePref("profileVisible", !prefs.profileVisible)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Hide Exact Location</p>
                  <p className="text-xs text-text-muted">Fuzz your location for privacy</p>
                </div>
                <Toggle on={prefs.locationHidden} disabled={isSaving} onClick={() => updatePref("locationHidden", !prefs.locationHidden)} />
              </div>
            </div>
          </section>

          {/* Danger */}
          <section className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-danger">
              Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">Delete Account</p>
                <p className="text-xs text-text-muted">Permanently remove your data from DreamRealm</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !user}
                className="rounded-lg border border-danger/50 px-4 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
