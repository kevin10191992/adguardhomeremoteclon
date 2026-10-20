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
      colors: {
        ios: {
          bg: {
            dark: "#000000",
            light: "#f2f2f7",
          },
          card: {
            dark: "#1c1c1e",
            light: "#ffffff",
          },
          cardSecondary: {
            dark: "#2c2c2e",
            light: "#f2f2f7",
          },
          border: {
            dark: "#38383a",
            light: "#e5e5ea",
          },
          green: "#34c759",
          red: "#ff3b30",
          orange: "#ff9500",
          blue: "#007aff",
          purple: "#af52de",
          yellow: "#ffcc00",
          teal: "#5ac8fa",
          indigo: "#5856d6",
          gray: {
            1: "#8e8e93",
            2: "#636366",
            3: "#48484a",
            4: "#3a3a3c",
            5: "#2c2c2e",
            6: "#1c1c1e",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        ios: "0 4px 20px -2px rgba(0, 0, 0, 0.15)",
        "ios-sheet": "0 -10px 40px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
