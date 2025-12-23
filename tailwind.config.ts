import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0b0f19",
        aurora: "#22d3ee",
        ember: "#fb7185"
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.25)",
        card: "0 12px 40px rgba(15, 23, 42, 0.3)"
      }
    }
  },
  plugins: []
};

export default config;
