import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Bylineship palette — matched with landing DESIGN.md tokens
        canvas: "#FFFFFF",
        fog: "#F5F5F7",
        snow: "#FFFFFF",
        manuscript: "#FAFAF8",
        "silver-mist": "#E8E8ED",
        ink: "#1D1D1F",
        slate: "#474747",
        graphite: "#707070",
        ash: "#8F8F8F",
        obsidian: "#000000",
        azure: "#0071E3",
        "cobalt-link": "#0066CC",
        olive: "#5B6B2F",
        rust: "#9C3E1F"
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        garamond: ["EB Garamond", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      maxWidth: {
        prose: "1180px",
        column: "640px"
      },
      letterSpacing: {
        "apple-display": "-0.022em",
        "apple-headline": "-0.016em",
        "apple-body": "-0.010em",
        "mono-caps": "0.18em"
      }
    }
  },
  plugins: []
};

export default config;
