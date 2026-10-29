import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#070605",
          900: "#0b0a09",
          800: "#121010",
          700: "#1a1716",
        },
        bone: {
          DEFAULT: "#d9d2c5",
          dim: "#9a9184",
          faint: "#5c554c",
        },
        blood: {
          DEFAULT: "#8a0a0a",
          bright: "#d11a1a",
          soft: "#5c0505",
          wash: "#1a0707",
        },
        line: {
          DEFAULT: "rgba(217,210,197,0.08)",
          bright: "rgba(217,210,197,0.16)",
        },
      },
      fontFamily: {
        sans: ["var(--font-host)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(217,210,197,0.05), 0 32px 80px -32px rgba(0,0,0,0.8)",
        blood: "0 0 40px rgba(138,10,10,0.25), 0 0 120px rgba(138,10,10,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
