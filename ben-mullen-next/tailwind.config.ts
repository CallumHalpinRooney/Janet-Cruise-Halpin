import type { Config } from "tailwindcss";

/**
 * Ben Mullen Architects — a bespoke, restrained system.
 * Neutral architectural palette (warm off-white → warm grey → near-black),
 * a neo-grotesque for structure and a restrained serif for statements.
 * No decorative colour: the buildings carry the colour.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f6f4ef", // warm off-white canvas
        "paper-2": "#efece5", // slightly deeper panel
        ink: "#16150f", // near-black, warm
        "ink-soft": "#2c2a22",
        stone: "#8b867a", // warm grey — secondary text
        "stone-2": "#a7a297",
        line: "rgba(22,21,15,0.14)",
        "line-strong": "rgba(22,21,15,0.28)",
        "line-inv": "rgba(246,244,239,0.18)",
      },
      fontFamily: {
        // wired to next/font CSS variables (see app/layout.tsx)
        sans: ["var(--font-grotesque)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        label: "0.18em",
      },
      maxWidth: {
        page: "1600px",
        prose: "62ch",
      },
      transitionTimingFunction: {
        arch: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
