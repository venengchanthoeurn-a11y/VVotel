import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vvotel: {
          navy: "#0c2340",
          blue: "#1a365d",
          accent: "#0070ba",
          gold: "#c5a059",
          amber: "#e6af2e",
          sand: "#f7f5f0",
          dark: "#121820",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        khmer: ["var(--font-khmer)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
