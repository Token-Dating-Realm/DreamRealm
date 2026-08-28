/**
 * ProfileTabNav
 *
 * Tab navigation for the multi-section profile page.
 * Minimal horizontal pill-style tabs with active-state highlighting.
 */

"use client";

interface ProfileTabNavProps {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

export default function ProfileTabNav({ tabs, active, onSelect }: ProfileTabNavProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
            active === tab
              ? "bg-primary/15 text-primary shadow-sm"
              : "text-text-muted hover:bg-surface-light hover:text-text"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
