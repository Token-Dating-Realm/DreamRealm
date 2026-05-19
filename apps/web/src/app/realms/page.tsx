/**
 * Realms Explore Page
 *
 * Grid of all realms with category filtering. Each realm links to its detail page.
 */

"use client";

import { useState, useMemo } from "react";
import AppShell from "../components/AppShell";
import RealmCard from "../components/RealmCard";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import { SAMPLE_REALMS, getAllCategories, getFeaturedRealms } from "../lib/realms";

export default function RealmsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const categories = getAllCategories();
  const featured = getFeaturedRealms();

  const toggleJoin = (id: string) => {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = SAMPLE_REALMS;
    if (activeCategory !== "All") {
      result = result.filter((r) => r.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [activeCategory, search]);

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

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search realms by name, category, or description..."
            className="max-w-xl mx-auto"
          />
          <div className="flex justify-center">
            <FilterTabs
              options={categories}
              active={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>
        </div>

        {/* Featured section */}
        {activeCategory === "All" && !search.trim() && (
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-text">Featured Realms</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((realm) => (
                <RealmCard
                  key={realm.id}
                  realm={realm}
                  isJoined={joinedIds.has(realm.id)}
                  isSaved={savedIds.has(realm.id)}
                  onToggleJoin={() => toggleJoin(realm.id)}
                  onToggleSave={() => toggleSave(realm.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All realms */}
        <h2 className="mb-4 text-lg font-bold text-text">
          {search.trim() || activeCategory !== "All" ? "Results" : "All Realms"}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((realm) => (
            <RealmCard
              key={realm.id}
              realm={realm}
              isJoined={joinedIds.has(realm.id)}
              isSaved={savedIds.has(realm.id)}
              onToggleJoin={() => toggleJoin(realm.id)}
              onToggleSave={() => toggleSave(realm.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light">
              <svg className="h-8 w-8 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-text">No realms found</p>
            <p className="text-sm text-text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
