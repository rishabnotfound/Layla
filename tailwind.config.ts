import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        panel: "#0a0a0a",
        border: "#1a1a1a",
        muted: "#8a8a8a",
        accent: {
          DEFAULT: "#5d0ad1",
          hover: "#6f14e6",
          soft: "#5d0ad133",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        spotlight: "spotlight 2s ease .35s 1 forwards",
        "border-spin": "border-spin 7s linear infinite",
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        "border-spin": {
          "100%": { transform: "rotate(-360deg)" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
