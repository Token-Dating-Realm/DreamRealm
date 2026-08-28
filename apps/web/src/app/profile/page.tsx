/**
 * Profile Page — Phase 4.1 Enhanced
 *
 * Tabbed layout: Overview, Activity, Achievements, Skills, Guilds, Inventory, Stats.
 * Gamification data: XP bar, achievements, skills, guilds, inventory, friends.
 */

"use client";

import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import AppShell from "../components/AppShell";
import ProfileTabNav from "../components/ProfileTabNav";
import XPBar from "../components/XPBar";
import AchievementBadge from "../components/AchievementBadge";
import SkillTreeNode from "../components/SkillTreeNode";
import GuildCard from "../components/GuildCard";
import { SAMPLE_USERS } from "../lib/users";
import type { SampleUser } from "../lib/users";

const TABS = ["Overview", "Achievements", "Skills", "Guilds", "Inventory", "Stats"];

const MOOD_LABELS: Record<string, string> = {
  adventurous: "🗡️ Adventurous",
  chill: "🍃 Chill",
  creative: "🎨 Creative",
  flirty: "💋 Flirty",
  focused: "🎯 Focused",
  mysterious: "🌙 Mysterious",
  playful: "🎮 Playful",
  romantic: "🌹 Romantic",
  social: "🗣️ Social",
  tired: "😴 Tired",
};

const STATUS_DOT: Record<string, string> = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  busy: "bg-rose-400",
  invisible: "bg-slate-500",
  streaming: "bg-purple-400",
  in_realm: "bg-cyan-400",
};

export default function ProfilePage() {
  const { user, isProfileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");

  // Use first sample user as preview data
  const u: SampleUser = SAMPLE_USERS[0]!;

  if (isProfileLoading) {
    return (
      <AppShell>
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-text-muted">Loading profile...</p>
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-text-muted">Please sign in to view your profile.</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* ===== HERO ===== */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar with frame */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-glow">
              {u.displayName.charAt(0)}
              {u.inventory.find((i) => i.type === "avatar_frame" && i.equipped) && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {/* Name row */}
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{u.displayName}</h1>
                {u.verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Meta row: role, mood, status */}
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {u.role.replace("_", " ")}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-2.5 py-0.5 text-[10px] text-text-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[u.presenceStatus] ?? STATUS_DOT.online}`} />
                  {MOOD_LABELS[u.mood] ?? u.mood}
                </span>
                {u.statusMessage && (
                  <span className="text-[11px] text-text-muted italic">&ldquo;{u.statusMessage}&rdquo;</span>
                )}
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-text-muted">{u.bio}</p>

              {/* Interests */}
              {u.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {u.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] text-primary">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* XP Bar */}
              <div className="mt-4 max-w-md">
                <XPBar level={u.level} currentXp={u.xpToNextLevel - 50} xpToNextLevel={u.xpToNextLevel} size="sm" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/profile/edit"
                className="rounded-lg bg-primary px-5 py-2 text-center text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark"
              >
                Edit Profile
              </Link>
              <div className="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs text-text-muted">
                <span className="text-primary font-semibold">{u.coins.toLocaleString()}</span>
                <span>🪙</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== QUICK STATS ===== */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Level" value={`${u.level}`} accent="text-primary" />
          <StatCard label="Reputation" value={u.reputationScore.toLocaleString()} accent="text-accent" />
          <StatCard label="Achievements" value={`${u.achievements.length}`} accent="text-amber-300" />
          <StatCard label="Realms" value={`${u.joinedRealms.length}`} accent="text-cyan-300" />
        </div>

        {/* ===== TABS ===== */}
        <div className="mb-5">
          <ProfileTabNav tabs={TABS} active={activeTab} onSelect={setActiveTab} />
        </div>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "Overview" && <OverviewTab user={u} />}
        {activeTab === "Achievements" && <AchievementsTab user={u} />}
        {activeTab === "Skills" && <SkillsTab user={u} />}
        {activeTab === "Guilds" && <GuildsTab user={u} />}
        {activeTab === "Inventory" && <InventoryTab user={u} />}
        {activeTab === "Stats" && <StatsTab user={u} />}
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Helper: Stat Card                                                    */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center transition hover:border-primary/20">
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Overview                                                        */
/* ------------------------------------------------------------------ */
function OverviewTab({ user }: { user: SampleUser }) {
  return (
    <div className="space-y-6">
      {/* Friends */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Friends ({user.friends.length})</h3>
        {user.friends.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.friends.map((friendId) => {
              const friend = SAMPLE_USERS.find((u) => u.username === friendId);
              return friend ? (
                <Link key={friendId} href={`/users/${friend.username}`} className="group flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-primary/40">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {friend.displayName.charAt(0)}
                  </div>
                  <span className="text-xs text-text group-hover:text-primary transition">{friend.displayName}</span>
                </Link>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No friends yet. Start connecting!</p>
        )}
      </section>

      {/* Guilds preview */}
      {user.guilds.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Guilds</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {user.guilds.map((g) => (
              <GuildCard key={g.name} name={g.name} role={g.role} memberCount={g.memberCount} />
            ))}
          </div>
        </section>
      )}

      {/* Recent achievements */}
      {user.achievements.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Latest Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {user.achievements.slice(0, 4).map((a) => (
              <AchievementBadge key={a} name={a} rarity={a === "Legendary Dreamer" ? "legendary" : "common"} compact />
            ))}
          </div>
        </section>
      )}

      {/* Account info */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Account</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-text-muted">Email</span><span className="text-text">founder@dreamrealm.app</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Role</span><span className="text-text capitalize">{user.role.replace("_", " ")}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Trust Score</span><span className="text-text">{user.trustScore}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Profile Theme</span><span className="text-text">{user.profileTheme}</span></div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Achievements                                                    */
/* ------------------------------------------------------------------ */
function AchievementsTab({ user }: { user: SampleUser }) {
  const rarityMap: Record<string, string> = {
    "First Steps": "common",
    "Social Butterfly": "common",
    "Realm Explorer": "common",
    "Night Owl": "common",
    "Matchmaker": "uncommon",
    "Content Creator": "uncommon",
    "Guild Founder": "rare",
    "Market Mogul": "rare",
    "Mystery Seeker": "epic",
    "Legendary Dreamer": "legendary",
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">{user.achievements.length} Unlocked</h3>
      <p className="mb-5 text-sm text-text-muted">Complete challenges across the DreamRealm to earn badges, XP, and DreamCoin.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {user.achievements.map((a) => (
          <AchievementBadge key={a} name={a} rarity={rarityMap[a] ?? "common"} />
        ))}
        {/* Placeholder locked achievements */}
        {["Market Mogul", "Mystery Seeker"].filter((a) => !user.achievements.includes(a)).map((a) => (
          <AchievementBadge key={a} name={a} rarity={rarityMap[a] ?? "common"} unlocked={false} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Skills                                                          */
/* ------------------------------------------------------------------ */
function SkillsTab({ user }: { user: SampleUser }) {
  const catMap: Record<string, string> = {
    "Social Charm": "social",
    "Leadership Presence": "leadership",
    "Creative Vision": "creativity",
    "Market Wisdom": "trader",
    "Stealth Profile": "stealth",
    "Magic Streamer": "magic",
    "Combat Banter": "combat",
    "Crafting Artisan": "crafting",
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Skill Trees</h3>
      <p className="mb-5 text-sm text-text-muted">Level up your abilities by participating in the DreamRealm ecosystem.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {user.skills.map((s) => (
          <SkillTreeNode
            key={s.name}
            name={s.name}
            level={s.level}
            maxLevel={s.maxLevel}
            currentXp={s.xp}
            xpPerLevel={100}
            category={catMap[s.name] ?? "social"}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Guilds                                                          */
/* ------------------------------------------------------------------ */
function GuildsTab({ user }: { user: SampleUser }) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Guilds</h3>
      <p className="mb-5 text-sm text-text-muted">Join forces with other dreamers. Guilds unlock exclusive realms, events, and rewards.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {user.guilds.map((g) => (
          <GuildCard key={g.name} name={g.name} role={g.role} memberCount={g.memberCount} description="Active guild in the Dreamcadian ecosystem." />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Inventory                                                       */
/* ------------------------------------------------------------------ */
function InventoryTab({ user }: { user: SampleUser }) {
  const rarityStyles: Record<string, string> = {
    legendary: "border-amber-500/30 bg-amber-500/10",
    epic:      "border-purple-500/30 bg-purple-500/10",
    rare:      "border-blue-500/30 bg-blue-500/10",
    uncommon:  "border-emerald-500/30 bg-emerald-500/10",
    common:    "border-slate-500/30 bg-slate-500/10",
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Inventory</h3>
      <p className="mb-5 text-sm text-text-muted">Items, badges, cosmetics, and tools you have acquired.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {user.inventory.map((item) => (
          <div key={item.name} className={`relative rounded-2xl border p-4 ${rarityStyles[item.rarity] ?? rarityStyles.common}`}>
            {item.equipped && (
              <span className="absolute right-3 top-3 rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary">EQUIPPED</span>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-lg">
                {item.type === "badge" ? "🏅" : item.type === "avatar_frame" ? "🖼️" : item.type === "tool" ? "🔨" : item.type === "title" ? "📜" : "🎁"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text">{item.name}</h4>
                <p className="text-[10px] text-text-muted capitalize">{item.type} · {item.rarity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Stats                                                           */
/* ------------------------------------------------------------------ */
function StatsTab({ user }: { user: SampleUser }) {
  const stats = [
    { label: "Total XP", value: user.totalXp.toLocaleString() },
    { label: "Level", value: `${user.level}` },
    { label: "Reputation", value: user.reputationScore.toLocaleString() },
    { label: "Achievements", value: `${user.achievements.length}` },
    { label: "Skills Maxed", value: `${user.skills.filter((s) => s.level === s.maxLevel).length}` },
    { label: "Realms Joined", value: `${user.joinedRealms.length}` },
    { label: "Realms Saved", value: `${user.savedRealms.length}` },
    { label: "Guilds", value: `${user.guilds.length}` },
    { label: "Friends", value: `${user.friends.length}` },
    { label: "DreamCoin Balance", value: `${user.coins.toLocaleString()} 🪙` },
  ];

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Statistics</h3>
      <p className="mb-5 text-sm text-text-muted">Your journey through the DreamRealm, by the numbers.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <span className="text-sm text-text-muted">{s.label}</span>
            <span className="text-sm font-semibold text-text">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
