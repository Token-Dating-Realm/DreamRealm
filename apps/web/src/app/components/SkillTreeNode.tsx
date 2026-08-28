/**
 * SkillTreeNode
 *
 * RPG-style skill node showing name, level, max level, XP progress, and category color.
 * Used in the Skills tab of the profile page.
 */

"use client";

interface SkillTreeNodeProps {
  name: string;
  level: number;
  maxLevel: number;
  currentXp: number;
  xpPerLevel: number;
  category?: string;
  description?: string;
}

const CATEGORY_COLORS: Record<string, { accent: string; bg: string }> = {
  social:     { accent: "text-pink-300",     bg: "from-pink-500/20 to-rose-500/20" },
  combat:     { accent: "text-red-300",      bg: "from-red-500/20 to-orange-500/20" },
  crafting:   { accent: "text-amber-300",    bg: "from-amber-500/20 to-yellow-500/20" },
  magic:      { accent: "text-purple-300",   bg: "from-purple-500/20 to-indigo-500/20" },
  stealth:    { accent: "text-slate-300",    bg: "from-slate-500/20 to-gray-500/20" },
  charisma:   { accent: "text-cyan-300",     bg: "from-cyan-500/20 to-teal-500/20" },
  leadership: { accent: "text-blue-300",     bg: "from-blue-500/20 to-indigo-500/20" },
  creativity: { accent: "text-emerald-300",  bg: "from-emerald-500/20 to-green-500/20" },
};

export default function SkillTreeNode({
  name,
  level,
  maxLevel,
  currentXp,
  xpPerLevel,
  category = "social",
  description,
}: SkillTreeNodeProps) {
  const xpInCurrentLevel = currentXp % xpPerLevel;
  const pct = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));
  const colors = (CATEGORY_COLORS[category] ?? CATEGORY_COLORS.social)!;
  const isMaxed = level >= maxLevel;

  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${colors.bg} p-4 transition hover:border-primary/30 hover:shadow-glow/30`}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-bold ${colors.accent}`}>{name}</h3>
          {description && <p className="mt-0.5 text-[10px] text-text-muted leading-tight">{description}</p>}
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface/60 text-xs font-bold ${colors.accent}`}>
          {isMaxed ? "★" : level}
        </div>
      </div>

      <div className="mb-1 flex items-center justify-between text-[10px] text-text-muted">
        <span>
          {isMaxed ? "MAX" : `Level ${level} / ${maxLevel}`}
        </span>
        <span>{xpInCurrentLevel.toLocaleString()} / {xpPerLevel.toLocaleString()} XP</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ${isMaxed ? "opacity-50" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
