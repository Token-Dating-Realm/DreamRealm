/**
 * Realms Explore Page
 *
 * Grid of all realms with category filtering, backed by the `realms`
 * table (023_realms.sql). Each realm links to its detail page.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import RealmCard from "../components/RealmCard";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import { useAuth } from "../components/AuthProvider";
import { getRealms, getMyRealmMemberships, joinRealm, leaveRealm } from "@dreamrealm/api-client";
import type { Realm } from "@dreamrealm/api-client";
import type { Realm as RealmCardShape } from "@dreamrealm/types";

/** RealmCard was authored against the (structurally compatible) @dreamrealm/types Realm shape. */
function toCardRealm(realm: Realm): RealmCardShape {
  return realm as unknown as RealmCardShape;
}

export default function RealmsPage() {
  const { client, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [realms, setRealms] = useState<Realm[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRealms(client);
        if (!cancelled) setRealms(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load realms");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    if (!user) {
      setJoinedIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const memberships = await getMyRealmMemberships(client);
        if (!cancelled) setJoinedIds(new Set(memberships.map((m) => m.realm_id)));
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(realms.map((r) => r.category)))], [realms]);
  const featured = useMemo(() => realms.filter((r) => r.is_featured), [realms]);

  const toggleJoin = async (id: string) => {
    if (!user) return;
    const isJoined = joinedIds.has(id);
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (isJoined) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (isJoined) {
        await leaveRealm(client, id);
      } else {
        await joinRealm(client, id);
      }
    } catch {
      // revert on failure
      setJoinedIds((prev) => {
        const next = new Set(prev);
        if (isJoined) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    let result = realms;
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
  }, [realms, activeCategory, search]);

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

        {isLoading ? (
          <p className="text-center text-text-muted">Loading realms...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <>
            {/* Featured section */}
            {activeCategory === "All" && !search.trim() && featured.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-text">Featured Realms</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((realm) => (
                    <RealmCard
                      key={realm.id}
                      realm={toCardRealm(realm)}
                      isJoined={joinedIds.has(realm.id)}
                      showActions={!!user}
                      onToggleJoin={() => toggleJoin(realm.id)}
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
                  realm={toCardRealm(realm)}
                  isJoined={joinedIds.has(realm.id)}
                  showActions={!!user}
                  onToggleJoin={() => toggleJoin(realm.id)}
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
          </>
        )}
      </div>
    </AppShell>
  );
}
