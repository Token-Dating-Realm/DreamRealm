/**
 * Public User Profile Page
 *
 * Shows another user's real profile (looked up by `profiles.id`), plus
 * gamification data (achievements, skills, guilds) and a real
 * FriendshipButton wired to the `friendships` table.
 */

"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import AchievementBadge from "../../components/AchievementBadge";
import SkillTreeNode from "../../components/SkillTreeNode";
import GuildCard from "../../components/GuildCard";
import FriendshipButton from "../../components/FriendshipButton";
import { useAuth } from "../../components/AuthProvider";
import {
  getUserAchievements,
  getUserSkills,
  getUserGuilds,
  getFriendshipStatus,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriendship,
  type FriendshipButtonStatus,
  type UserAchievementWithDetails,
  type UserSkillWithDetails,
  type GuildMembershipWithGuild,
} from "@dreamrealm/api-client";
import type { Profile } from "@dreamrealm/types";

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { client, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievementWithDetails[]>([]);
  const [skills, setSkills] = useState<UserSkillWithDetails[]>([]);
  const [guilds, setGuilds] = useState<GuildMembershipWithGuild[]>([]);
  const [friendship, setFriendship] = useState<{ status: FriendshipButtonStatus; friendshipId: string | null }>({
    status: "none",
    friendshipId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await client.from("profiles").select("*").eq("id", params.id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFoundFlag(true);
        setIsLoading(false);
        return;
      }
      const p = data as Profile;
      setProfile(p);

      const [ach, sk, gl, fs] = await Promise.all([
        getUserAchievements(client, p.user_id).catch(() => []),
        getUserSkills(client, p.user_id).catch(() => []),
        getUserGuilds(client, p.user_id).catch(() => []),
        currentUser ? getFriendshipStatus(client, p.user_id).catch(() => ({ status: "none" as const, friendshipId: null })) : Promise.resolve({ status: "none" as const, friendshipId: null }),
      ]);
      if (cancelled) return;
      setAchievements(ach);
      setSkills(sk);
      setGuilds(gl);
      setFriendship(fs);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client, params.id, currentUser]);

  const refreshFriendship = async (targetUserId: string) => {
    const fs = await getFriendshipStatus(client, targetUserId).catch(() => ({ status: "none" as const, friendshipId: null }));
    setFriendship(fs);
  };

  const handleRequest = async () => {
    if (!profile) return;
    await sendFriendRequest(client, profile.user_id);
    await refreshFriendship(profile.user_id);
  };

  const handleAccept = async () => {
    if (!profile || !friendship.friendshipId) return;
    await respondToFriendRequest(client, friendship.friendshipId, "accepted");
    await refreshFriendship(profile.user_id);
  };

  const handleRemove = async () => {
    if (!profile || !friendship.friendshipId) return;
    await removeFriendship(client, friendship.friendshipId);
    await refreshFriendship(profile.user_id);
  };

  const handleBlock = async () => {
    if (!profile) return;
    if (friendship.status === "blocked" && friendship.friendshipId) {
      // FriendshipButton reuses onBlock for the "Unblock" action in the blocked state.
      await removeFriendship(client, friendship.friendshipId);
    } else if (friendship.friendshipId) {
      await respondToFriendRequest(client, friendship.friendshipId, "blocked");
    } else {
      await sendFriendRequest(client, profile.user_id);
      const fs = await getFriendshipStatus(client, profile.user_id).catch(() => null);
      if (fs?.friendshipId) await respondToFriendRequest(client, fs.friendshipId, "blocked");
    }
    await refreshFriendship(profile.user_id);
  };

  if (notFoundFlag) {
    notFound();
  }

  if (isLoading || !profile) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-text-muted">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/realms" className="hover:text-primary transition">
            Realms
          </Link>
          <span>/</span>
          <span className="text-text">{profile.display_name}</span>
        </div>

        {/* Profile Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-glow">
              {profile.display_name.charAt(0)}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-text">{profile.display_name}</h1>
                {profile.is_verified && (
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {profile.mode.replace(/_/g, " ")}
                </span>
              </div>

              {profile.bio && <p className="max-w-lg text-sm leading-relaxed text-text-muted">{profile.bio}</p>}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {currentUser && currentUser.id !== profile.user_id && (
                <FriendshipButton
                  status={friendship.status}
                  onRequest={handleRequest}
                  onAccept={handleAccept}
                  onRemove={handleRemove}
                  onBlock={handleBlock}
                />
              )}
              <Link
                href="/messages"
                className="rounded-xl border border-border px-4 py-2 text-center text-sm text-text hover:bg-surface-light transition"
              >
                Message
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Trust Score" value={`${profile.trust_score}`} accent="text-primary" />
          <StatCard label="Achievements" value={`${achievements.length}`} accent="text-amber-300" />
          <StatCard label="Skills" value={`${skills.length}`} accent="text-cyan-300" />
          <StatCard label="Guilds" value={`${guilds.length}`} accent="text-accent" />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Achievements */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Achievements</h3>
              {achievements.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {achievements.slice(0, 5).map((a) => (
                    <AchievementBadge key={a.id} name={a.achievement.name} rarity={a.achievement.rarity} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No achievements unlocked yet.</p>
              )}
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Skills</h3>
              {skills.length > 0 ? (
                <div className="space-y-3">
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
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Guilds */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">Guilds</h3>
              {guilds.length > 0 ? (
                <div className="space-y-3">
                  {guilds.map((g) => (
                    <GuildCard key={g.id} name={g.guild.name} role={g.role} memberCount={g.guild.member_count} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">Not in any guilds yet.</p>
              )}
            </section>
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
