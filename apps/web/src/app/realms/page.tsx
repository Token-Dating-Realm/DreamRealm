/**
 * Realms Explore Page
 *
 * Grid of all realms with category filtering. Each realm links to its detail page.
 */

"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import RealmCard from "../components/RealmCard";
import { SAMPLE_REALMS, getAllCategories } from "../lib/realms";

export default function RealmsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = ["All", ...getAllCategories()];

  const filtered =
    activeCategory === "All"
      ? SAMPLE_REALMS
      : SAMPLE_REALMS.filter((r) => r.category === activeCategory);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-glow">Explore Realms</h1>
          <p className="mx-auto max-w-xl text-text-muted">
            Step into different worlds within DreamRealm. Each realm is a unique community
            shaped by its members, purpose, and energy.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-glow"
                  : "border border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Realm grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((realm) => (
            <RealmCard key={realm.id} realm={realm} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-text-muted">
            No realms found in this category.
          </div>
        )}
      </div>
    </AppShell>
  );
}
