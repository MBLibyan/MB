import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        obsidian: {
          950: "#090A0F",
          900: "#12141D",
          800: "#1A1D2B",
          700: "#24283B",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "eq-1": "equalizer1 0.9s ease-in-out infinite alternate",
        "eq-2": "equalizer2 0.65s ease-in-out infinite alternate",
        "eq-3": "equalizer3 1.1s ease-in-out infinite alternate",
        "eq-4": "equalizer4 0.8s ease-in-out infinite alternate",
      },
      keyframes: {
        equalizer1: {
          "0%": { height: "20%" },
          "100%": { height: "95%" },
        },
        equalizer2: {
          "0%": { height: "85%" },
          "100%": { height: "25%" },
        },
        equalizer3: {
          "0%": { height: "35%" },
          "100%": { height: "100%" },
        },
        equalizer4: {
          "0%": { height: "75%" },
          "100%": { height: "15%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
