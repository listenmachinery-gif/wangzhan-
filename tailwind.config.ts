import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0B0D10",
          900: "#101214",
          850: "#15181b",
          800: "#1b1f23",
          700: "#2a2f35",
        },
        ignition: "#76B900",
        neon: "#8DDB00",
        copper: "#c57b34",
        steel: "#a8b0b8",
      },
      boxShadow: {
        glow: "0 28px 80px rgba(118, 185, 0, 0.22)",
      },
      fontFamily: {
        sans: ["Montserrat", "DIN", "Eurostile", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
