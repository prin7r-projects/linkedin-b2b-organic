import type { Config } from "tailwindcss";

/**
 * [BYLINESHIP_TAILWIND] Locked tokens for the linkedin-b2b-organic landing.
 * Source of truth for the Bylineship palette + type pair. Mirrored in
 * `app/globals.css` and documented in /DESIGN.md sections 4-6.
 */

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", md: "2.5rem" }
    },
    extend: {
      colors: {
        bone: "#FFFFFF",
        "bone-2": "#F4F2EE",
        ink: "#0B1A2A",
        "ink-2": "#142435",
        graphite: "#1F2A38",
        smoke: "#6E7989",
        olive: "#5B6B2F",
        "olive-2": "#7A8C44",
        rust: "#9C3E1F",
        manuscript: "#FAFAF8"
      },
      fontFamily: {
        display: ["EB Garamond", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"]
      },
      maxWidth: {
        prose: "1180px",
        column: "640px"
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        full: "9999px"
      },
      boxShadow: {
        masthead: "0 1px 0 0 rgba(11,26,42,.08)",
        manuscript: "0 1px 0 0 rgba(11,26,42,.05), 0 0 0 1px rgba(11,26,42,.08)"
      },
      letterSpacing: {
        tightest: "-0.014em",
        marginalia: "0.18em"
      },
      fontSize: {
        deck: ["116px", { lineHeight: "0.96", letterSpacing: "-0.022em" }],
        masthead: ["56px", { lineHeight: "1.0", letterSpacing: "-0.014em" }]
      },
      keyframes: {
        cursor: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" }
        }
      },
      animation: {
        cursor: "cursor 1.1s steps(2, start) infinite"
      }
    }
  },
  plugins: []
};

export default config;
