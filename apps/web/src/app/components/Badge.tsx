/**
 * Badge
 *
 * Small status/category badge component.
 */

"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

const VARIANTS: Record<string, string> = {
  default: "bg-surface-light text-text-muted border-border",
  primary: "bg-primary/20 text-primary border-primary/30",
  success: "bg-success/20 text-success border-success/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  danger: "bg-danger/20 text-danger border-danger/30",
  accent: "bg-accent/20 text-accent border-accent/30",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${VARIANTS[variant] ?? VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}
