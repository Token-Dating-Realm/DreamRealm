/**
 * DreamRealm shared UI tokens and primitives.
 *
 * Phase 1 exports design tokens (colors, spacing, typography) that both
 * web (Tailwind) and mobile (NativeWind) can consume.
 *
 * TODO: Add primitive components once Expo 52 + NativeWind 4 stable interop
 * with Next.js 15 is verified in the target environment.
 */

export const theme = {
  colors: {
    primary: "#A855F7",
    primaryDark: "#7E22CE",
    accent: "#F472B6",
    accentDark: "#DB2777",
    background: "#0F0F1A",
    surface: "#1A1A2E",
    surfaceLight: "#252540",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    success: "#22C55E",
    warning: "#EAB308",
    danger: "#EF4444",
    border: "#334155",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    xs: { size: 12, lineHeight: 16 },
    sm: { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg: { size: 18, lineHeight: 28 },
    xl: { size: 20, lineHeight: 28 },
    "2xl": { size: 24, lineHeight: 32 },
    "3xl": { size: 30, lineHeight: 36 },
  },
} as const;

export type Theme = typeof theme;
