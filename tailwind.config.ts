import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#144DC8",
          dark: "#103FA5",
          light: "#DCE9FF",
        },
        navy: {
          DEFAULT: "#1E293B",
          light: "#334155",
          dark: "#0F172A",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#0EA5E9",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
