/**
 * ProjectCard
 *
 * Dreamcadian project preview card for the hub page.
 * Shows project name, description, status, and link.
 */

"use client";

interface ProjectCardProps {
  name: string;
  tagline: string;
  description: string;
  status: "active" | "beta" | "coming_soon";
  color?: string;
  url?: string;
}

const STATUS_CONFIG = {
  active: { label: "Active", class: "bg-success/20 text-success" },
  beta: { label: "Beta", class: "bg-warning/20 text-warning" },
  coming_soon: { label: "Coming Soon", class: "bg-primary/20 text-primary" },
};

const COLOR_MAP: Record<string, string> = {
  purple: "from-primary/30 to-primary-dark/20",
  pink: "from-accent/30 to-accent-dark/20",
  blue: "from-blue-500/20 to-indigo-500/20",
  green: "from-success/20 to-emerald-600/20",
  orange: "from-warning/20 to-amber-600/20",
  indigo: "from-indigo-500/20 to-purple-500/20",
  red: "from-red-500/20 to-rose-600/20",
};

export default function ProjectCard({ name, tagline, description, status, color = "purple", url }: ProjectCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const gradient = COLOR_MAP[color] ?? COLOR_MAP.purple;

  return (
    <div className={`flex flex-col rounded-2xl border border-border bg-gradient-to-br ${gradient} p-5 transition hover:border-primary/40 hover:shadow-glow/50`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">{name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusConfig.class}`}>
          {statusConfig.label}
        </span>
      </div>
      <p className="mb-1 text-sm font-medium text-primary">{tagline}</p>
      <p className="mb-4 text-sm leading-relaxed text-text-muted">{description}</p>
      <div className="mt-auto">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition"
          >
            Visit
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="text-sm text-text-muted">Launching soon</span>
        )}
      </div>
    </div>
  );
}
