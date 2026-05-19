/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A855F7",
        "primary-dark": "#7E22CE",
        accent: "#F472B6",
        "accent-dark": "#DB2777",
        background: "#0F0F1A",
        surface: "#1A1A2E",
        "surface-light": "#252540",
        text: "#F8FAFC",
        "text-muted": "#94A3B8",
        success: "#22C55E",
        warning: "#EAB308",
        danger: "#EF4444",
        border: "#334155",
      },
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168,85,247,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(168,85,247,0.35)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(168,85,247,0.25)",
        "glow-accent": "0 0 24px rgba(244,114,182,0.25)",
      },
    },
  },
  plugins: [],
};
