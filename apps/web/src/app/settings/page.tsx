/**
 * Settings Page
 *
 * Placeholder account settings form. Covers display preferences,
 * privacy toggles, and notification settings.
 */

"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [locationHidden, setLocationHidden] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-glow">Account Settings</h1>

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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative h-6 w-11 rounded-full transition ${darkMode ? "bg-primary" : "bg-surface-light"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
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
                <button
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`relative h-6 w-11 rounded-full transition ${emailNotifs ? "bg-primary" : "bg-surface-light"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      emailNotifs ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Push Notifications</p>
                  <p className="text-xs text-text-muted">Real-time alerts on your device</p>
                </div>
                <button
                  onClick={() => setPushNotifs(!pushNotifs)}
                  className={`relative h-6 w-11 rounded-full transition ${pushNotifs ? "bg-primary" : "bg-surface-light"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      pushNotifs ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => setProfileVisible(!profileVisible)}
                  className={`relative h-6 w-11 rounded-full transition ${profileVisible ? "bg-primary" : "bg-surface-light"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      profileVisible ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">Hide Exact Location</p>
                  <p className="text-xs text-text-muted">Fuzz your location for privacy</p>
                </div>
                <button
                  onClick={() => setLocationHidden(!locationHidden)}
                  className={`relative h-6 w-11 rounded-full transition ${locationHidden ? "bg-primary" : "bg-surface-light"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      locationHidden ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
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
              <button className="rounded-lg border border-danger/50 px-4 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 transition">
                Delete
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
