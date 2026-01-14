import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scGreen: "#2c5f2d",
        scGreenDark: "#1e4520",
        scBlue: "#0b4ea2",
        scOlive: "#a7c86a"
      }
    },
  },
  plugins: [],
} satisfies Config;
