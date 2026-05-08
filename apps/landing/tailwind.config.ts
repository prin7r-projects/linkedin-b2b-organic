import type { Config } from "tailwindcss";

/**
 * [BYLINESHIP_TAILWIND] Apple-gallery refresh — 2026-05-08.
 * Source of truth for the Bylineship palette + type pair after the gallery-wall
 * direction. Mirrored in `app/globals.css` and documented in /DESIGN.md §4-5, §15.
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
        // Apple-gallery surface scale (canvas is pure white per house rule)
        canvas: "#FFFFFF",
        snow: "#FFFFFF",
        fog: "#F5F5F7",
        "silver-mist": "#E8E8ED",
        ink: "#1D1D1F",
        slate: "#474747",
        graphite: "#707070",
        ash: "#8F8F8F",
        obsidian: "#000000",
        azure: "#0071E3",
        "cobalt-link": "#0066CC",
        olive: "#5B6B2F",
        rust: "#9C3E1F",
        manuscript: "#FAFAF8",

        // Legacy aliases preserved so existing utilities still resolve.
        bone: "#FFFFFF",
        "bone-2": "#F5F5F7",
        "ink-2": "#2C2925",
        smoke: "#707070",
        "olive-2": "#7A8C44"
      },
      fontFamily: {
        // Inter is the Apple SF Pro substitute called out in apple.md.
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // EB Garamond reserved for the post-itself (the museum-piece) and pull-quotes.
        serif: ["EB Garamond", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"]
      },
      maxWidth: {
        prose: "1180px",
        column: "640px"
      },
      borderRadius: {
        none: "0",
        sm: "10px",        // Apple smallButtons radius
        DEFAULT: "10px",
        lg: "28px",        // Apple cards / featureLinks radius
        "2xl": "28px",
        "3xl": "36px",     // Apple roundedButtons
        full: "999px"
      },
      boxShadow: {
        // Apple's elevation system is colour-only — keep these empty by default
        // and provide a single hairline for the masthead bottom border state.
        masthead: "0 1px 0 0 rgba(29,29,31,.06)",
        none: "none"
      },
      letterSpacing: {
        // Apple display tracking shifts negatively as size grows.
        display: "-0.022em",
        tightest: "-0.022em",
        tighter: "-0.016em",
        tight: "-0.010em",
        marginalia: "0.18em"
      },
      fontSize: {
        // Apple display scale (96px / 80px / 56px / 40px) scaled to the
        // landing's typographic register — the literary feel is preserved by
        // EB Garamond for the manuscript inside, while UI display is Inter-700.
        deck: ["112px", { lineHeight: "0.96", letterSpacing: "-0.022em" }],
        masthead: ["56px", { lineHeight: "1.07", letterSpacing: "-0.016em" }],
        // Apple-aligned named tokens.
        "apple-display": ["96px", { lineHeight: "1.04", letterSpacing: "-0.022em" }],
        "apple-heading-lg": ["56px", { lineHeight: "1.07", letterSpacing: "-0.016em" }],
        "apple-heading": ["40px", { lineHeight: "1.17", letterSpacing: "-0.015em" }],
        "apple-subheading": ["20px", { lineHeight: "1.4", letterSpacing: "-0.010em" }],
        "apple-body": ["17px", { lineHeight: "1.47", letterSpacing: "-0.003em" }],
        "apple-caption": ["12px", { lineHeight: "1.33", letterSpacing: "-0.003em" }]
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
