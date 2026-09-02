/**
 * Profile Page
 *
 * Tabbed layout: Overview, Achievements, Skills, Guilds, Inventory, Stats.
 * All data is fetched for the authenticated user (profile + user_stats +
 * achievements + skills + guilds + inventory + friendships).
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import AppShell from "../components/AppShell";
import ProfileTabNav from "../components/ProfileTabNav";
import XPBar from "../components/XPBar";
import AchievementBadge from "../components/AchievementBadge";
import SkillTreeNode from "../components/SkillTreeNode";
import GuildCard from "../components/GuildCard";
import {
  getUserStats,
  getUserAchievements,
  getUserSkills,
  getUserGuilds,
  getUserInventory,
  getMyFriends,
  type UserStats,
  type UserAchievementWithDetails,
  type UserSkillWithDetails,
  type GuildMembershipWithGuild,
  type UserInventoryWithItem,
} from "@dreamrealm/api-client";
import type { Profile } from "@dreamrealm/types";

const TABS = ["Overview", "Achievements", "Skills", "Guilds", "Inventory", "Stats"];

interface FriendSummary {
  userId: string;
  profileId: string;
  displayName: string;
}

export default function ProfilePage() {
  const { client, user, profile, isProfileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");

  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievementWithDetails[]>([]);
  const [skills, setSkills] = useState<UserSkillWithDetails[]>([]);
  const [guilds, setGuilds] = useState<GuildMembershipWithGuild[]>([]);
  const [inventory, setInventory] = useState<UserInventoryWithItem[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [st, ach, sk, gl, inv, friendships] = await Promise.all([
          getUserStats(client, user.id),
          getUserAchievements(client, user.id),
          getUserSkills(client, user.id),
          getUserGuilds(client, user.id),
          getUserInventory(client, user.id),
          getMyFriends(client),
        ]);
        if (cancelled) return;
        setStats(st);
        setAchievements(ach);
        setSkills(sk);
        setGuilds(gl);
        setInventory(inv);

        const otherIds = friendships.map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id));
        if (otherIds.length > 0) {
          const { data: friendProfiles } = await client
            .from("profiles")
            .select("id, user_id, display_name")
            .in("user_id", otherIds);
          if (!cancelled) {
            setFriends(
              ((friendProfiles ?? []) as unknown as { id: string; user_id: string; display_name: string }[]).map((p) => ({
                userId: p.user_id,
                profileId: p.id,
                displayName: p.display_name,
              }))
            );
          }
        } else if (!cancelled) {
          setFriends([]);
        }
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  if (isProfileLoading || (user && isLoadingData)) {
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

  if (!profile) {
    return (
      <AppShell>
        <main className="flex min-h-screen flex-col items-center justify-center gap-3">
          <p className="text-text-muted">You haven&apos;t finished setting up your profile yet.</p>
          <Link href="/onboarding" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-primary-dark transition">
            Complete Onboarding
          </Link>
        </main>
      </AppShell>
    );
  }

  const level = stats?.level ?? 1;
  const totalXp = stats?.total_xp ?? 0;
  const xpToNextLevel = stats?.xp_to_next_level ?? 100;
  const reputationScore = stats?.reputation_score ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* ===== HERO ===== */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-glow">
              {profile.display_name.charAt(0)}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {/* Name row */}
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{profile.display_name}</h1>
                {profile.is_verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Meta row */}
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {profile.mode.replace(/_/g, " ")}
                </span>
              </div>

              {profile.bio && <p className="max-w-lg text-sm leading-relaxed text-text-muted">{profile.bio}</p>}

              {/* XP Bar */}
              <div className="mt-4 max-w-md">
                <XPBar level={level} currentXp={totalXp % Math.max(xpToNextLevel, 1)} xpToNextLevel={xpToNextLevel} size="sm" />
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
            </div>
          </div>
        </div>

        {/* ===== QUICK STATS ===== */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Level" value={`${level}`} accent="text-primary" />
          <StatCard label="Reputation" value={reputationScore.toLocaleString()} accent="text-accent" />
          <StatCard label="Achievements" value={`${achievements.length}`} accent="text-amber-300" />
          <StatCard label="Friends" value={`${friends.length}`} accent="text-cyan-300" />
        </div>

        {/* ===== TABS ===== */}
        <div className="mb-5">
          <ProfileTabNav tabs={TABS} active={activeTab} onSelect={setActiveTab} />
        </div>

        {/* ===== TAB CONTENT ===== */}
        {activeTab === "Overview" && (
          <OverviewTab
            profile={profile}
            userEmail={user.email}
            achievements={achievements}
            guilds={guilds}
            friends={friends}
          />
        )}
        {activeTab === "Achievements" && <AchievementsTab achievements={achievements} />}
        {activeTab === "Skills" && <SkillsTab skills={skills} />}
        {activeTab === "Guilds" && <GuildsTab guilds={guilds} />}
        {activeTab === "Inventory" && <InventoryTab inventory={inventory} />}
        {activeTab === "Stats" && (
          <StatsTab
            stats={stats}
            achievementsCount={achievements.length}
            skillsMaxed={skills.filter((s) => s.current_level >= s.skill.max_level).length}
            guildsCount={guilds.length}
            friendsCount={friends.length}
          />
        )}
      </div>
    </AppShell>
  );
}

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
function OverviewTab({
  profile,
  userEmail,
  achievements,
  guilds,
  friends,
}: {
  profile: Profile;
  userEmail: string;
  achievements: UserAchievementWithDetails[];
  guilds: GuildMembershipWithGuild[];
  friends: FriendSummary[];
}) {
  return (
    <div className="space-y-6">
      {/* Friends */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Friends ({friends.length})</h3>
        {friends.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {friends.map((friend) => (
              <Link key={friend.userId} href={`/users/${friend.profileId}`} className="group flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-primary/40">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {friend.displayName.charAt(0)}
                </div>
                <span className="text-xs text-text group-hover:text-primary transition">{friend.displayName}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No friends yet. Start connecting!</p>
        )}
      </section>

      {/* Guilds preview */}
      {guilds.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Guilds</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {guilds.map((g) => (
              <GuildCard key={g.id} name={g.guild.name} role={g.role} memberCount={g.guild.member_count} />
            ))}
          </div>
        </section>
      )}

      {/* Recent achievements */}
      {achievements.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Latest Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 4).map((a) => (
              <AchievementBadge key={a.id} name={a.achievement.name} rarity={a.achievement.rarity} compact />
            ))}
          </div>
        </section>
      )}

      {/* Account info */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Account</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-text-muted">Email</span><span className="text-text">{userEmail}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Mode</span><span className="text-text capitalize">{profile.mode.replace(/_/g, " ")}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Trust Score</span><span className="text-text">{profile.trust_score}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">Visibility</span><span className="text-text capitalize">{profile.visibility}</span></div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function AchievementsTab({ achievements }: { achievements: UserAchievementWithDetails[] }) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">{achievements.length} Unlocked</h3>
      <p className="mb-5 text-sm text-text-muted">Complete challenges across the DreamRealm to earn badges, XP, and DreamCoin.</p>
      {achievements.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} name={a.achievement.name} rarity={a.achievement.rarity} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No achievements unlocked yet. Get out there and start dreaming!</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function SkillsTab({ skills }: { skills: UserSkillWithDetails[] }) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Skill Trees</h3>
      <p className="mb-5 text-sm text-text-muted">Level up your abilities by participating in the DreamRealm ecosystem.</p>
      {skills.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((s) => (
            <SkillTreeNode
              key={s.id}
              name={s.skill.name}
              level={s.current_level}
              maxLevel={s.skill.max_level}
              currentXp={s.current_xp}
              xpPerLevel={s.skill.xp_per_level}
              category={s.skill.category}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No skills leveled yet.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function GuildsTab({ guilds }: { guilds: GuildMembershipWithGuild[] }) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Guilds</h3>
      <p className="mb-5 text-sm text-text-muted">Join forces with other dreamers. Guilds unlock exclusive realms, events, and rewards.</p>
      {guilds.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {guilds.map((g) => (
            <GuildCard key={g.id} name={g.guild.name} role={g.role} memberCount={g.guild.member_count} description={g.guild.description ?? undefined} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Not in any guilds yet.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function InventoryTab({ inventory }: { inventory: UserInventoryWithItem[] }) {
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
      {inventory.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inventory.map((entry) => (
            <div key={entry.id} className={`relative rounded-2xl border p-4 ${rarityStyles[entry.item.rarity] ?? rarityStyles.common}`}>
              {entry.is_equipped && (
                <span className="absolute right-3 top-3 rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary">EQUIPPED</span>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-lg">
                  {entry.item.type === "badge" ? "🏅" : entry.item.type === "avatar_frame" ? "🖼️" : entry.item.type === "tool" ? "🔨" : entry.item.type === "title" ? "📜" : "🎁"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">{entry.item.name}</h4>
                  <p className="text-[10px] text-text-muted capitalize">{entry.item.type} · {entry.item.rarity}{entry.quantity > 1 ? ` · x${entry.quantity}` : ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No items yet.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function StatsTab({
  stats,
  achievementsCount,
  skillsMaxed,
  guildsCount,
  friendsCount,
}: {
  stats: UserStats | null;
  achievementsCount: number;
  skillsMaxed: number;
  guildsCount: number;
  friendsCount: number;
}) {
  const rows = [
    { label: "Total XP", value: (stats?.total_xp ?? 0).toLocaleString() },
    { label: "Level", value: `${stats?.level ?? 1}` },
    { label: "Reputation", value: (stats?.reputation_score ?? 0).toLocaleString() },
    { label: "Achievements", value: `${achievementsCount}` },
    { label: "Skills Maxed", value: `${skillsMaxed}` },
    { label: "Realms Created", value: `${stats?.realms_created ?? 0}` },
    { label: "Streams Hosted", value: `${stats?.streams_hosted ?? 0}` },
    { label: "Messages Sent", value: `${stats?.messages_sent ?? 0}` },
    { label: "Matches Made", value: `${stats?.matches_made ?? 0}` },
    { label: "Guilds", value: `${guildsCount}` },
    { label: "Friends", value: `${friendsCount}` },
    { label: "Coins Earned", value: `${(stats?.total_coins_earned ?? 0).toLocaleString()} 🪙` },
  ];

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold text-text">Statistics</h3>
      <p className="mb-5 text-sm text-text-muted">Your journey through the DreamRealm, by the numbers.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <span className="text-sm text-text-muted">{s.label}</span>
            <span className="text-sm font-semibold text-text">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
