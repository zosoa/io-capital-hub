import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:       "#C0392B",    // logo identity only
          navy:      "#07090F",
          navyMid:   "#0A0D18",
          navyCard:  "#0E1020",
          gold:      "#B8913A",
          goldBright:"#C8992A",
          cream:     "#F6F4EF",
          ink:       "#0F1320",
          muted:     "#5A6280",
          border:    "#E8E2D9",
        },
      },
      fontFamily: {
        sans:    ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
      },
      spacing: {
        // Used by the navbar height (h-18) on the landing + investisseurs pages.
        // Not in Tailwind's default scale (jumps 16 → 20), so define it here.
        "18": "4.5rem", // 72px
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(184,145,58,0.07) 0%, transparent 65%)",
      },
      animation: {
        "fade-up":     "fadeUp 0.65s ease forwards",
        "fade-in":     "fadeIn 0.4s ease forwards",
        "scroll-hint": "scrollHint 2.5s ease-in-out infinite",
        "pulse-slow":  "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scrollHint: {
          "0%,100%": { opacity: "0.2", transform: "translateY(0)" },
          "50%":     { opacity: "0.45", transform: "translateY(4px)" },
        },
      },
      boxShadow: {
        "card":    "0 2px 16px rgba(0,0,0,0.18)",
        "card-lg": "0 6px 40px rgba(0,0,0,0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
