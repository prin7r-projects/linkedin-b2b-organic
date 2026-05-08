# DESIGN.md — Bylineship

> Canonical design + style guide for `linkedin-b2b-organic` (brand: **Bylineship**).
> Owned by Chief of Design. Kept in sync with `apps/landing/` — any landing-page change updates this file in the same commit.

The visual identity is sourced from [`docs/01-brand-identity.md`](docs/01-brand-identity.md). This document is the implementation-facing translation of that identity into tokens, components, layout rules, and verification artifacts.

---

## 1. Product and audience

**Product** — Bylineship is a done-for-you LinkedIn organic-growth retainer for B2B founders and senior operators. The deliverable is a working *writers' room*: three ghostwritten posts a week in the founder's voice, an editorial comment plan against fifty target accounts, a living DM book, and CRM webhook routing of replies-with-intent. The retainer is monthly, capped at six clients per cohort, and intake closes the first Monday of the month. It is positioned as a **literary agency**, not a "personal brand" SaaS.

**Audience** —
- **Maya, the operations VP**: 36-50, runs a 60-200 person B2B SaaS company, technically fluent, knows she should be writing publicly but cannot find the 6 hours/week. Reads Stratechery, Lenny's, Lex column. Hates thumbnails with arrows on them.
- **Diego, the second-time founder**: 38-55, raised a Series B last year, ICP is enterprise CIOs who don't follow influencers. Wants thoughtful presence, not virality. Has tried two LinkedIn coaches and one ghostwriter — none in his voice.
- **Anti-personas** — solopreneurs at <$300k ARR (we are too expensive); influencer-economy creators (we don't run engagement pods); D2C brands (we don't write consumer voice); anyone who asks for a "viral hook framework" on the intake call.

The landing is written for these two. Voice mirrors a literary agency's day-book — editorially confident, plainspoken, decisive. *Stratechery* and *Lex* register, not SaaS-dashboard register, not LinkedIn-bro register.

## 2. Visual positioning

A literary agency dressed for the open page.

- **Anchor reference points** — the masthead rule of a regional broadsheet, a literary-quarterly cover, a writer's signed manuscript laid on a desk, the *Lex* column's typographic discipline, the *Stratechery* email letterhead.
- **Avoided reference points** — LinkedIn-blue hero, Vercel/Linear flat-mono dashboard, AI-mint pastels, "personal brand" SaaS purple gradients, founder-bro guru fonts (Bebas, Anton), the "screenshot of a viral post with 100k likes" hero, hyperbolic capitalised titles, emojis in product copy.
- **Felt sense** — bone paper laid on a navy desk, deep ink, a single olive editor's mark, rust used the way a copy-editor crosses out a line. No drop shadows beyond a single 1px hairline shadow on the masthead and the manuscript frame; no gradients beyond a 3.5% paper grain.
- **Anti-features** — gradients, neon, glassmorphism, drop shadows beyond `0 1px 0 0 rgba(11,26,42,.08)`, three-platform-logo-collage hero, chat-bubble illustrations, emoji in product copy, unironic use of the word "thought leadership".

## 3. ShadCN baseline and local component policy

**Baseline.** This repo follows the Prin7r Component Library Baseline (ShadCN-first). Default base for any future SaaS surface in `apps/app/` is shadcn/ui — install via `pnpm dlx shadcn@latest add <component>`, vendor the source into the project so we own and review every primitive.

**Current state — Wave 2 batch landing.** `apps/landing/` uses **two ShadCN primitives** vendored under `app/components/ui/` (`Button`, `Card`) and re-themed against the Bylineship tokens in section 4. The remainder of the landing is hand-coded — the literary-agency aesthetic is carried by typography, hairlines, the manuscript-frame component, the ledger row, and a five-color print palette. We will add primitives as the dashboard surface lands in `apps/app/`.

**Documented exceptions.** The `Button` and `Card` primitives are vendored from ShadCN but reset to `radius: 0`, ink-fill ink-text, and the hairline border tokens — the source of truth for those resets is `apps/landing/app/globals.css`. The day-numerals, the ledger rows, the manuscript frame, the typing cursor on the sample post, the anti-feature crossed-out cards, and the pull-quote are hand-coded in `apps/landing/app/page.tsx` and `globals.css`.

**Forbidden.** Paid / pro libraries without CEO approval. Component libraries that conflict with ShadCN conventions. Marketing-page kits that drag in animation libraries beyond the single typing-cursor blink on the sample post.

## 4. Color tokens

Single source of truth: `apps/landing/tailwind.config.ts` and `apps/landing/app/globals.css`. Five-color editorial palette; intentionally not LinkedIn-blue and intentionally not the "personal brand" purple-on-cream default.

| Role | Token | Hex | CSS var | Used for |
|------|-------|-----|---------|----------|
| Surface (page) | `bone` | `#FFFFFF` | `--bone` | Page background, default card surfaces |
| Surface (band) | `bone-2` | `#F4F2EE` | `--bone-2` | Section bands, footer surface, faint separation |
| Surface (manuscript) | `manuscript` | `#FAFAF8` | `--manuscript` | Hero ghostwritten-post frame, agency-tier card surface |
| Ink | `ink` | `#0B1A2A` | `--ink` | All body copy, primary buttons, masthead rule |
| Ink (raised) | `ink-2` | `#142435` | `--ink-2` | Anti-manifesto card surface (inverted), avatar block |
| Ink (subdued) | `graphite` | `#1F2A38` | `--graphite` | Body 14-15px copy, ledger paragraph |
| Muted | `smoke` | `#6E7989` | `--smoke` | Marginalia caps, mono labels, captions |
| Accent (editor) | `olive` | `#5B6B2F` | `--olive` | Editor's marks, eyebrow rules, hover states, signature underbar |
| Accent (raised) | `olive-2` | `#7A8C44` | `--olive-2` | Anti-manifesto eyebrow rule on dark surface |
| Accent (correction) | `rust` | `#9C3E1F` | `--rust` | Pull-quote rule, anti-feature strikethrough, error caption text |

**Contrast.** All foreground/background combinations meet WCAG AA: ink-on-bone 13.3:1; graphite-on-bone 11.6:1; smoke-on-bone 4.6:1 (use only at 14px+); olive-on-bone 4.5:1; manuscript-on-ink 13.3:1; olive-2-on-ink 5.6:1; rust-on-bone 4.6:1.

**Forbidden combinations.** Olive text on rust; smoke on bone-2 below 14px; olive-2 text on bone below 16px; any color on a gradient.

## 5. Typography

Three families. No fourth font. Pairing is deliberately *not* the all-sans tech aesthetic — Bylineship reads as a literary agency, not as a SaaS, and not as a LinkedIn-creator's bio.

| Role | Family | Weights | Used at | Reason |
|------|--------|---------|---------|--------|
| Display | **EB Garamond** | 400 / 500 / 600 / 700 / 800 (+ italic 400, italic 500) | Hero 56-112px, sections 40-56px, long-form 22-26px, sample-post body | Optical-sized old-style serif tuned for both display and body; reads as a manuscript page, not a startup. The italic 400 carries the editorial voice. |
| Body | **Inter** | 400 / 500 / 600 | Body 15-17px, UI 14px, sample-post profile metadata, button labels | Neutral, high-legibility sans; pairs cleanly with Garamond and stands in for a LinkedIn post's native feed font without being LinkedIn-blue. |
| Mono | **IBM Plex Mono** | 400 / 500 | Marginalia caps `est. 2026`, byline dotline, day numerals on the week-cards (when not in display), error captions | A literary mono with slight serifs at the terminals; reads as machine output and as old hot-metal type at the same time. |

Loaded from Google Fonts in `globals.css` with `display=swap`. The pairing rationale is documented in [`docs/01-brand-identity.md`](docs/01-brand-identity.md) — old-style serif display + neutral sans body + literary mono is the editorial pairing for a writers' room brand.

**Type scale (display).** 18 / 22 / 28 / 34 / 40 / 44 / 56 / 64 / 88 / 112 / 116 px. **Body scale.** 11 / 12 / 13 / 14 / 14.5 / 15 / 15.5 / 17 / 19 / 22 / 24 px. **Letter-spacing.** Display tightens by `-0.014em`; mono labels open to `0.18em` for caps.

## 6. Spacing, radius, shadows, and borders

- **Base unit** — 4px.
- **Spacing scale** — 4 / 8 / 12 / 20 / 32 / 56 / 96 (Fibonacci-ish; tighter than Tailwind defaults so the page feels print-like, not SaaS-padded).
- **Radius** — `0` for cards, hero blocks, the manuscript frame, buttons, ledger rows, anti-feature cards. `2px` only for inputs (the partner-mailto opener) and the avatar in the sample post. `999px` reserved for pill-style badges (used once on "Most retainers settle here" tier label — though we ended up using a square edge for that one too; the pill class is reserved for future banners only).
- **Shadows** — exactly two allowed:
  - `0 1px 0 0 rgba(11,26,42,.08)` on the masthead band.
  - `0 1px 0 0 rgba(11,26,42,.05), 0 0 0 1px rgba(11,26,42,.08)` on the manuscript frame in the hero.
  - Glassmorphism, neumorphism, and drop shadows beyond these two are forbidden.
- **Borders** — 1px hairlines at `rgba(11,26,42,.10)` (light), `rgba(11,26,42,.14)` (default), `rgba(11,26,42,.18)` (dossier frame). 1.5-2px olive rules at `var(--olive)` for masthead breaks and section accents. 3px olive bar on the featured tier card. 3px rust bar on the pull-quote.

## 7. Layout system and responsive rules

- **Container.** `max-w-prose = 1180px`, 80px gutters at desktop, 24-40px at mobile. The landing uses `mx-auto max-w-prose px-6 md:px-10` consistently. A second token, `max-w-column = 640px`, caps the manuscript frame and the FAQ reading width.
- **Grid.** 12-column conceptually, but most sections are 1-2-3 column flex/grid combinations. Hero uses `md:grid-cols-12` with a 5/7 split (intro / sample post). Service block uses `md:grid-cols-2`. Process week is `md:grid-cols-5`. Pricing is `md:grid-cols-3`.
- **Breakpoints.** Mobile-first; `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Tested at 320 / 390 / 768 / 1024 / 1440.
- **Vertical rhythm.** Sections separated by `border-b border-ink/10`. Section padding `py-20 md:py-24` (80-96px). Hero pads down `pt-16 md:pt-24 pb-20 md:pb-24` to keep the manuscript frame breathing.
- **Reading width.** Long-form prose capped at `max-w-2xl` (672px) so the FAQ and the sample-post body read like a printed page.

## 8. Component catalog

All components are local (in `apps/landing/app/page.tsx` or `apps/landing/app/components/ui/`) until shadcn primitives land in `apps/app/`. Each has an explicit hover/focus state.

| Component | Where defined | Notes |
|-----------|---------------|-------|
| `Logo` | `page.tsx` Masthead | Ink-fill stamp 32×32, manuscript Garamond Bold `B` monogram, 1.5px olive underbar. Garamond `Bylineship.` wordmark with trailing olive period. |
| `Button` | `components/ui/button.tsx` (vendored from ShadCN; re-themed) | Square-edged, ink fill, 14×22px padding. Hover swaps to olive fill. Focus inherits `:focus-visible` ring (kept visible). |
| `Card` | `components/ui/card.tsx` (vendored from ShadCN; re-themed) | Square-edged bone surface, 1px ink/15 hairline. No shadow. |
| `SamplePost` | `page.tsx` Hero | The brand statement. A real-looking ghostwritten LinkedIn post on a manuscript surface, with avatar, name, role, dateline, body in Garamond italic-leading prose, a final-line punch with a blinking olive cursor, and a footer byline crediting Bylineship. |
| `Manuscript` | `globals.css` `.manuscript` | The visual frame for the sample post and the agency-tier card. Manuscript surface, 1px hairline, soft shadow, a subtle vertical rust line at 56px from the left to mimic a margin rule. |
| `LedgerRow` | `globals.css` `.ledger` | Two-column row used in the service block. 64px Garamond `01-06` numeral in olive on the left, headline + body on the right, dashed bottom border. |
| `WeekCell` | `page.tsx` Process | Five 260px-min cells, day name in mono caps, large olive numeric day index, headline in Garamond, copy in Inter. |
| `AntiCard` | `page.tsx` AntiManifesto | Inverted (`bg-ink-2`) card with a number kicker, a Garamond title with a rust strikethrough, and a bone-2 body. |
| `Tier` | `page.tsx` Pricing + `globals.css` `.tier` | Square-edged card. Featured tier swaps surface to manuscript and adds a 3px olive bar on the left edge. |
| `PullQuote` | `globals.css` `.pull` (also inlined in pricing & footer) | Garamond italic 22px with a 3px rust or olive bar on the left. |
| `FAQ` | `page.tsx` Faq + `globals.css` `details.faq` | `details/summary` with hairline separators; no JS. |

## 9. Landing page structure

Sections render in this exact order. Anchored at semantic `<section id>` so we can deep-link from outbound DMs.

1. `#masthead` — Logo + nav anchors (the work, the week, retainer, faq) + a single olive rule on hover. Sticky at desktop.
2. `#hero` — Display headline ("You should be writing. We'll do it."), sub-hero (95 chars), two CTAs: `Take a retainer →` (primary, → NOWPayments invoice anchor) and `Book a voice call` (mailto, secondary). The right column is a sample ghostwritten post in the manuscript frame — the brand statement.
3. `#service` — Six numbered ledger rows: 3 posts/week, comment plan, DM book, weekly editorial call, monthly accuracy report, house style.
4. `#process` — A typical Mon-Fri week, five cells with a large olive numeral and a one-paragraph description.
5. `#anti` — "Six things we won't do" — inverted (ink) section. Six cards with a strikethrough title and copy explaining each refusal. The brand's manifesto.
6. `#pricing` — Three retainers (Founder / Operator / Director). Each card has a NOWPayments CTA. Refund cohort intake-clause printed below the grid in italic Garamond. Two-team agency offer in a manuscript-framed callout.
7. `#faq` — Seven questions matching the objection-handling table in `docs/07-sales-strategy.md`.
8. `#footer` — Logo, the desk handle, partners handle, copyright, link to repo, link to docs.

## 10. Imagery and generated asset rules

This wave ships **no raster imagery in the hero**. The hero accent is purely typographic — a sample ghostwritten post on the manuscript surface. Graphic assets:

- The favicon SVG at `apps/landing/app/icon.svg` (manuscript `U` monogram on ink, 1.5px olive underbar).
- The avatar block in the sample post (CSS-drawn `MR` initials on `ink-2`; no image asset).
- A 3.5% paper grain via a tiny inline SVG noise filter on the hero (subtle; toggleable via a `.grain` class).

If `prin7r-generate-image` (GPT Image 2) becomes useful for an additional editorial asset in the polish pass, the prompt rules:

- Composition — desk-flat, top-down, single object on bone paper. A pen, a stack of pages, a fountain-pen nib resting on a manuscript margin.
- Color — must read as the Bylineship palette (bone, ink, olive accent only).
- Aspect — 3:2 for hero; 1:1 for footer; nothing else.
- No people, no faces, no LinkedIn screenshots, no chat-bubble icons, no laptops. Hands holding a pen are allowed if shot top-down on bone paper.

If the tool returns billing/entitlement errors, do **not** block the wave — record the blocker here and ship without generated images. (Wave 2 is shipping without them deliberately — the sample ghostwritten post carries the entire visual hero.)

Generated assets, if any, save to `apps/landing/public/generated/` with a sibling `<filename>.prompt.txt` containing prompt + model + date for reproducibility.

## 11. Motion and interaction rules

At most one element animates at any time.

- **Cursor bar** — A 2px olive cursor blinks at the end of the sample-post final line, `1.1s steps(2, start) infinite`. Steady-state.
- **Button hover** — instant fill swap from ink to olive. No transition longer than 80ms.
- **Tier-card hover** — 1px border darkens from ink/14 to ink/22. No translate, no scale, no shadow change.
- **No** scroll-jacking. **No** parallax. **No** hero animation. **No** typewriter effects on actual copy. **No** number counters.

`prefers-reduced-motion` — the cursor bar holds at full opacity (no blink).

## 12. Accessibility and quality gates

- **Color contrast.** Body text 13.3:1 (ink on bone). All interactive elements meet 4.5:1 in default and hover states. Olive on bone is 4.5:1 — used only for ≥14px text and short labels.
- **Focus.** All interactive elements ship with a visible `:focus-visible` ring (1.5px olive outline, 2px offset). Tab order: skip-to-content → masthead nav → hero CTAs → tier CTAs → FAQ summaries → footer links.
- **Semantics.** `<header>`, `<main>`, `<section>` with `aria-label`, `<footer>`, `<nav aria-label>`, `<figure aria-label>` on the sample post, `<details>`/`<summary>` on the FAQ.
- **Alt text.** No `alt=""` on meaningful icons. The `Logo` SVG has `role="img"` and `aria-label="Bylineship"`. The `SamplePost` figure has an `aria-label` describing it as a sample ghostwritten post. The avatar block is `aria-hidden="true"` (decorative initials).
- **Forms.** No native form on the landing. The desk CTAs are `mailto:` links with `aria-label` describing destination.
- **No-JS.** Page is fully readable with JS disabled. Only the NOWPayments CTAs require JS (a fetch + redirect); they degrade visibly to an error message that points to the head writer's email when JS or the API fails.

## 13. Screenshots and verification artifacts

| Artifact | Path | Captured from |
|---|---|---|
| Desktop screenshot 1440×900 | `docs/screenshots/landing-desktop.png` | `https://linkedin-b2b-organic.prin7r.com` (production) |
| Mobile screenshot 390×844 | `docs/screenshots/landing-mobile.png` | `https://linkedin-b2b-organic.prin7r.com` (production) |
| Pitch deck render | `docs/pitch-deck.html` | direct browser open |
| `curl -sI` proof | recorded in `wave2-reports/linkedin-b2b-organic.md` | production |

Captured via Playwright headless Chromium on the deployed URL (not localhost). Re-capture protocol: viewports `{1440,900}` and `{390,844}`, `waitUntil:'networkidle'`, `fullPage: true`.

## 14. External references and library sources

- **ShadCN UI** — base primitives. Source: <https://ui.shadcn.com/>. Used for `Button` and `Card`. Re-themed in this repo.
- **Google Fonts** — EB Garamond, Inter, IBM Plex Mono. Loaded via `<link>` import in `app/globals.css`.
- **Tailwind CSS 3.4** — utility-first; tokens locked in `tailwind.config.ts`.
- **Refero Styles** (reference gallery) — <https://styles.refero.design/>. Browsed for editorial-serif references; nothing copied.
- **Cited reference (sister Wave 2 build)** — `/Users/keer/projects/prin7r/wave2-builds/chatbot-agency/`. Used as a structural reference (DESIGN.md shape, the nowpayments wiring) but **not** as a visual reference. Dispatch's forest/carmine palette is theirs; Bylineship's navy/olive palette is ours, paired with EB Garamond instead of Fraunces and with the manuscript-frame component as our distinguishing motif.
- **NOWPayments** — hosted invoice + IPN docs. Implementation copied from `payments-prototypes/src/lib/signatures.ts` (HMAC-SHA512 verifier).

## 15. Changelog

| Date | Change | Surface |
|---|---|---|
| 2026-05-08 | Initial Wave 2 build. Hero (with manuscript-framed sample ghostwritten post), service ledger, week strip, anti-feature manifesto on inverted ink surface, three-tier pricing with NOWPayments CTAs, seven-question FAQ, footer. NOWPayments hosted-invoice route + HMAC-SHA512 IPN webhook wired. Vendored ShadCN `Button` + `Card`. | `apps/landing/` |
| 2026-05-08 | DESIGN.md authored at root. 10 strategy docs published under `docs/`. Pitch deck HTML + Markdown shipped. Desktop + mobile screenshots captured against production. | repo root + `docs/` |
| 2026-05-08 | Rebrand: **Underline → Bylineship**. Wave 2 name research flagged Underline FAIL (underline.com is an active fiber-network company; "underline" carries heavy unrelated meanings). Bylineship aligns with the existing literary-agency / ghostwriter positioning. Logo monogram swapped from `U` to `B`; wordmark, og:title, metadata, debug tags, and copy updated repo-wide. Visual essence (editorial-ghostwriter, serif-magazine palette, manuscript frame) unchanged. | repo-wide |
