/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
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
    },
  },
  plugins: [],
};
