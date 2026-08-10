import type { Config } from "tailwindcss";

const config: Config = {
  // Class, not media: the toggle owns the theme, and it writes `dark` on <html>.
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Colour palettes live here (eventStyles, dashboardSections) and are also
    // what the admin stores in the DB  without this they are never generated.
    "./lib/**/*.{js,ts}",
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
        // Decorative accent. Deliberately not green/amber/rose  those already
        // mean done / due soon / overdue in the UI.
        accent: {
          DEFAULT: "#7C3AED",
          light: "#C4B5FD",
          dark: "#5B21B6",
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
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // The caret in components/ui/typing-animation. It ships expecting
        // tw-animate-css (a Tailwind v4 package); this project is on v3.
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        // -50% because components/ui/marquee renders its children twice.
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.25s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
        "blink-cursor": "blink-cursor 1s step-end infinite",
        marquee: "marquee var(--duration, 30s) linear infinite",
        "marquee-reverse":
          "marquee-reverse var(--duration, 30s) linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
