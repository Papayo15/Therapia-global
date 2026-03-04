import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  "#eef4ff",
          100: "#d9e8ff",
          200: "#bcd4ff",
          300: "#8db7ff",
          400: "#598eff",
          500: "#3362ff",
          600: "#1a40f5",
          700: "#132ce1",
          800: "#1625b6",
          900: "#17258f",
          950: "#111657",
        },
        // Clinical green
        clinical: {
          50:  "#effef7",
          100: "#d9fced",
          200: "#b6f7d9",
          300: "#7eefc0",
          400: "#3fdfa0",
          500: "#17c584",
          600: "#0ca06a",
          700: "#0c8058",
          800: "#0d6548",
          900: "#0d533c",
          950: "#052f22",
        },
        // Neutrals
        surface: {
          0:   "#ffffff",
          50:  "#f8f9fc",
          100: "#f1f3f9",
          200: "#e4e7f0",
          300: "#d0d5e4",
          400: "#9ba5be",
          500: "#6b7899",
          600: "#4a5578",
          700: "#364060",
          800: "#232d4a",
          900: "#141c33",
          950: "#0a0f1e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
