/**
 * XPBar
 *
 * Animated XP progress bar showing level, current XP, and XP needed for next level.
 * Includes level badge and percentage display.
 */

"use client";

interface XPBarProps {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE_CONFIG = {
  sm: { height: "h-1.5", badge: "h-4 w-4 text-[9px]", text: "text-[10px]" },
  md: { height: "h-2.5", badge: "h-6 w-6 text-[10px]", text: "text-xs" },
  lg: { height: "h-4", badge: "h-8 w-8 text-xs", text: "text-sm" },
};

export default function XPBar({ level, currentXp, xpToNextLevel, size = "md", showLabel = true }: XPBarProps) {
  const pct = Math.min(100, Math.round((currentXp / xpToNextLevel) * 100));
  const config = SIZE_CONFIG[size];

  return (
    <div className="flex items-center gap-3">
      {/* Level Badge */}
      <div className={`flex ${config.badge} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent font-bold text-white shadow-glow`}>
        {level}
      </div>

      {/* Progress */}
      <div className="flex-1">
        {showLabel && (
          <div className={`mb-1 flex items-center justify-between ${config.text}`}>
            <span className="font-semibold text-primary">Level {level}</span>
            <span className="text-text-muted">
              {currentXp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
        )}
        <div className={`w-full overflow-hidden rounded-full bg-surface-light ${config.height}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out ${config.height}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
