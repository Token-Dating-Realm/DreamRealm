/**
 * Public User Profile Page
 *
 * Placeholder page for viewing another user's public profile.
 * Shows avatar, name, bio, joined realms, and action buttons.
 */

"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import XPBar from "../../components/XPBar";
import AchievementBadge from "../../components/AchievementBadge";
import SkillTreeNode from "../../components/SkillTreeNode";
import GuildCard from "../../components/GuildCard";
import FriendshipButton from "../../components/FriendshipButton";
import { getUserByUsername, SAMPLE_USERS } from "../../lib/users";

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

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const user = getUserByUsername(params.id);

  if (!user) {
    notFound();
  }

  // Determine friendship status based on current user (preview: user-001 is viewer)
  const currentUser = SAMPLE_USERS[0];
  const friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" | "blocked" =
    currentUser?.friends.includes(user.username)
      ? "friends"
      : "none";

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
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/realms" className="hover:text-primary transition">
            Realms
          </Link>
          <span>/</span>
          <span className="text-text">{user.displayName}</span>
        </div>

        {/* Profile Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-glow">
              {user.displayName.charAt(0)}
              {user.inventory.find((i) => i.type === "avatar_frame" && i.equipped) && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{user.displayName}</h1>
                {user.verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {user.role.replace("_", " ")}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-2.5 py-0.5 text-[10px] text-text-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[user.presenceStatus] ?? STATUS_DOT.online}`} />
                  {MOOD_LABELS[user.mood] ?? user.mood}
                </span>
                {user.statusMessage && (
                  <span className="text-[11px] text-text-muted italic">&ldquo;{user.statusMessage}&rdquo;</span>
                )}
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-text-muted">{user.bio}</p>

              {user.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {user.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] text-primary">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 max-w-md">
                <XPBar level={user.level} currentXp={user.xpToNextLevel - 50} xpToNextLevel={user.xpToNextLevel} size="sm" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <FriendshipButton status={friendshipStatus} />
              <Link
                href="/messages"
                className="rounded-xl border border-border px-4 py-2 text-center text-sm text-text hover:bg-surface-light transition"
              >
                Message
              </Link>
              <div className="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs text-text-muted">
                <span className="text-primary font-semibold">{user.coins.toLocaleString()}</span>
                <span>🪙</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Level" value={`${user.level}`} accent="text-primary" />
          <StatCard label="Reputation" value={user.reputationScore.toLocaleString()} accent="text-accent" />
          <StatCard label="Achievements" value={`${user.achievements.length}`} accent="text-amber-300" />
          <StatCard label="Friends" value={`${user.friends.length}`} accent="text-cyan-300" />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Achievements */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {user.achievements.slice(0, 5).map((a) => (
                  <AchievementBadge key={a} name={a} rarity={rarityMap[a] ?? "common"} compact />
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Skills</h3>
              <div className="space-y-3">
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
            </section>

            {/* Realms */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Realms</h3>
              <div className="flex flex-wrap gap-2">
                {user.joinedRealms.map((realm) => (
                  <span key={realm} className="rounded-full border border-border bg-surface-light px-3 py-1 text-xs text-text-muted">
                    {realm}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Guilds */}
            {user.guilds.length > 0 && (
              <section className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Guilds</h3>
                <div className="space-y-3">
                  {user.guilds.map((g) => (
                    <GuildCard key={g.name} name={g.name} role={g.role} memberCount={g.memberCount} />
                  ))}
                </div>
              </section>
            )}

            {/* Inventory preview */}
            {user.inventory.length > 0 && (
              <section className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Inventory</h3>
                <div className="space-y-2">
                  {user.inventory.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface-light px-3 py-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-sm">
                        {item.type === "badge" ? "🏅" : item.type === "avatar_frame" ? "🖼️" : item.type === "tool" ? "🔨" : item.type === "title" ? "📜" : "🎁"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text">{item.name}</p>
                        <p className="text-[10px] text-text-muted capitalize">{item.type} · {item.rarity} {item.equipped && "· equipped"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mutual friends */}
            {user.friends.length > 0 && (
              <section className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Friends ({user.friends.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {user.friends.map((friendId) => {
                    const friend = SAMPLE_USERS.find((u) => u.username === friendId);
                    return friend ? (
                      <Link key={friendId} href={`/users/${friend.username}`} className="group flex items-center gap-2 rounded-full border border-border bg-surface-light px-3 py-1.5 transition hover:border-primary/40">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {friend.displayName.charAt(0)}
                        </div>
                        <span className="text-xs text-text group-hover:text-primary transition">{friend.displayName}</span>
                      </Link>
                    ) : null;
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center transition hover:border-primary/20">
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
    </div>
  );
}
