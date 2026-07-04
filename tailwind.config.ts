import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        give: {
          50: "#f0faf0",
          100: "#dcf2dc",
          200: "#b8e6b8",
          300: "#7dd37d",
          400: "#4caf50",
          500: "#2E7D32",
          600: "#256928",
          700: "#1b5e20",
          800: "#174f1b",
          900: "#0d3310",
        },
        warm: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F2ED",
        },
        dark: {
          bg: "#121212",
          card: "#1E1E1E",
          surface: "#2A2A2A",
          border: "#3A3A3A",
        },
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
