/**
 * FilterTabs
 *
 * Horizontal scrollable pill tabs for filtering by category or type.
 */

"use client";

interface FilterTabsProps {
  options: string[];
  active: string;
  onSelect: (value: string) => void;
  allLabel?: string;
}

export default function FilterTabs({ options, active, onSelect, allLabel = "All" }: FilterTabsProps) {
  const allOptions = [allLabel, ...options];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allOptions.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            active === opt
              ? "bg-primary text-white shadow-glow"
              : "border border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
