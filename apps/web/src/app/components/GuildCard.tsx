/**
 * GuildCard
 *
 * Compact guild preview card with emblem placeholder, level, member count, and role badge.
 * Used in profile guild tab and guild directory.
 */

"use client";

interface GuildCardProps {
  name: string;
  description?: string;
  memberCount: number;
  guildLevel?: number;
  role: string;
  emblem?: string;
  banner?: string;
  isRecruiting?: boolean;
}

const ROLE_BADGES: Record<string, string> = {
  founder: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  officer: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  member: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  recruit: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  guest: "bg-surface-light text-text-muted border-border",
};

export default function GuildCard({
  name,
  description,
  memberCount,
  guildLevel = 1,
  role,
  emblem,
  banner,
  isRecruiting = true,
}: GuildCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/30 hover:shadow-glow/20">
      {banner && (
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/10 to-transparent" />
      )}
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-white">
          {emblem ?? name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="truncate text-sm font-bold text-text">{name}</h4>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGES[role] ?? ROLE_BADGES.guest}`}>
              {role}
            </span>
          </div>
          {description && (
            <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-text-muted">{description}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span className="text-primary">Lv. {guildLevel}</span>
            <span>{memberCount.toLocaleString()} members</span>
            {isRecruiting && <span className="text-emerald-400">Recruiting</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
