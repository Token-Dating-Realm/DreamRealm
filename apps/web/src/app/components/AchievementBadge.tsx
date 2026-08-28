/**
 * AchievementBadge
 *
 * Colored rarity badge with glow effect for achievements.
 * Supports tooltip hint (title attribute) and compact mode.
 */

"use client";

interface AchievementBadgeProps {
  name: string;
  rarity?: string;
  compact?: boolean;
  unlocked?: boolean;
}

const RARITY_STYLES: Record<string, { border: string; bg: string; text: string; glow?: string }> = {
  common:    { border: "border-slate-500/30",    bg: "bg-slate-500/10",    text: "text-slate-300" },
  uncommon:  { border: "border-emerald-500/30",  bg: "bg-emerald-500/10",  text: "text-emerald-300" },
  rare:      { border: "border-blue-500/30",     bg: "bg-blue-500/10",     text: "text-blue-300" },
  epic:      { border: "border-purple-500/30",   bg: "bg-purple-500/10",   text: "text-purple-300", glow: "shadow-[0_0_8px_rgba(168,85,247,0.3)]" },
  legendary: { border: "border-amber-500/30",    bg: "bg-amber-500/10",    text: "text-amber-300", glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]" },
  mythic:    { border: "border-rose-500/30",     bg: "bg-rose-500/10",     text: "text-rose-300",   glow: "shadow-[0_0_12px_rgba(244,63,94,0.5)]" },
};

export default function AchievementBadge({ name, rarity = "common", compact = false, unlocked = true }: AchievementBadgeProps) {
  const style = (RARITY_STYLES[rarity] ?? RARITY_STYLES.common)!;

  if (compact) {
    return (
      <span
        title={name}
        className={`inline-flex items-center rounded-full border ${style.border} ${style.bg} ${style.text} px-2 py-0.5 text-[10px] font-semibold ${unlocked ? "" : "opacity-40 grayscale"} ${style.glow ?? ""}`}
      >
        {name}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border ${style.border} ${style.bg} p-2.5 ${unlocked ? "" : "opacity-40 grayscale"} ${style.glow ?? ""}`}
      title={name}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-sm`}>
        🏆
      </div>
      <span className={`text-xs font-semibold ${style.text}`}>{name}</span>
    </div>
  );
}
