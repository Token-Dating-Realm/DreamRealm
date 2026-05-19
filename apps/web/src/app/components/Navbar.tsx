/**
 * Navbar
 *
 * Top navigation bar for DreamRealm.
 * Responsive: logo + search placeholder + user actions on desktop,
 * hamburger menu that opens the mobile drawer.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-light hover:text-text md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
              DR
            </span>
            <span className="text-lg font-bold text-glow hidden sm:block">DreamRealm</span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden flex-1 px-8 md:block">
          <div className="relative mx-auto max-w-md">
            <input
              type="text"
              placeholder="Search realms, people, projects..."
              className="w-full rounded-full border border-border bg-surface-light/60 px-4 py-1.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-light hover:text-text md:hidden"
            aria-label="Search"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-text-muted hover:bg-surface-light hover:text-text"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-light"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="hidden text-sm text-text-muted sm:block">
                  {user.email?.split("@")[0]}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:bg-surface-light"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-surface-light"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="border-t border-border px-4 py-2 md:hidden">
          <input
            type="text"
            placeholder="Search..."
            autoFocus
            className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}
    </header>
  );
}
