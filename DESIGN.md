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

> A literary agency installed on a gallery wall. Pure white room. Enormous display type carries the room. The post-itself is the museum-piece — framed in serif, mounted in the centre of the canvas. Color enters only through the writing.

After the **2026-05-08 Apple-gallery refresh** (see §15), the visual posture is `apple` reference: enormous SF-Pro-class display headlines (96-128px hero) on a pure-white canvas, with the ghostwritten post acting as the colored "product" the gallery is built around. The literary identity is preserved by EB Garamond inside the post — the rest of the page (nav, sections, headers) is now Inter at Apple's display tracking (`-0.022em` at 96px+).

- **Anchor reference points** — Apple's MacBook product pages (gallery wall, enormous type, product is the only color); the masthead rule of a regional broadsheet; a writer's signed manuscript mounted under museum glass; the *Lex* column's typographic discipline.
- **Avoided reference points** — LinkedIn-blue hero, Vercel/Linear flat-mono dashboard, AI-mint pastels, "personal brand" SaaS purple gradients, founder-bro guru fonts (Bebas, Anton), the "screenshot of a viral post with 100k likes" hero, hyperbolic capitalised titles, emojis in product copy.
- **Felt sense** — pure-white gallery room, near-black ink, the post-itself in editorial serif as the only "colored" element. No drop shadows; elevation is colour-only (canvas vs fog vs snow). Generous whitespace as the primary design element.
- **Anti-features** — gradients, neon, glassmorphism, drop shadows beyond a 1px hairline on the masthead, three-platform-logo-collage hero, chat-bubble illustrations, emoji in product copy, unironic use of the word "thought leadership".

## 3. ShadCN baseline and local component policy

**Baseline.** This repo follows the Prin7r Component Library Baseline (ShadCN-first). Default base for any future SaaS surface in `apps/app/` is shadcn/ui — install via `pnpm dlx shadcn@latest add <component>`, vendor the source into the project so we own and review every primitive.

**Current state — Wave 2 batch landing.** `apps/landing/` uses **two ShadCN primitives** vendored under `app/components/ui/` (`Button`, `Card`) and re-themed against the Bylineship tokens in section 4. The remainder of the landing is hand-coded — the literary-agency aesthetic is carried by typography, hairlines, the manuscript-frame component, the ledger row, and a five-color print palette. We will add primitives as the dashboard surface lands in `apps/app/`.

**Documented exceptions.** The `Button` and `Card` primitives are vendored from ShadCN but reset to `radius: 0`, ink-fill ink-text, and the hairline border tokens — the source of truth for those resets is `apps/landing/app/globals.css`. The day-numerals, the ledger rows, the manuscript frame, the typing cursor on the sample post, the anti-feature crossed-out cards, and the pull-quote are hand-coded in `apps/landing/app/page.tsx` and `globals.css`.

**Forbidden.** Paid / pro libraries without CEO approval. Component libraries that conflict with ShadCN conventions. Marketing-page kits that drag in animation libraries beyond the single typing-cursor blink on the sample post.

## 4. Color tokens

Single source of truth: `apps/landing/tailwind.config.ts` and `apps/landing/app/globals.css`. Apple-gallery scale (canvas → fog → snow → silver-mist) with the editorial olive/rust held back as in-content accents on the manuscript only.

| Role | Token | Hex | CSS var | Used for |
|------|-------|-----|---------|----------|
| Canvas | `canvas` | `#FFFFFF` | `--canvas` | Page background, hero band, default surface |
| Surface (band) | `fog` | `#F5F5F7` | `--fog` | Service / FAQ section bands; week-card recessed surface |
| Surface (snow) | `snow` | `#FFFFFF` | `--snow` | Tier card surface, anti-feature card surface, raised wells |
| Surface (manuscript) | `manuscript` | `#FAFAF8` | `--manuscript` | Hero ghostwritten-post frame (the museum-piece), featured tier card |
| Border / hairline | `silver-mist` | `#E8E8ED` | `--silver-mist` | Section bottoms, card outlines, button-ghost borders, FAQ rules |
| Ink | `ink` | `#1D1D1F` | `--ink` | All headline + body text, primary nav labels, masthead rule |
| Slate | `slate` | `#474747` | `--slate` | 17px body copy, ledger paragraph, FAQ answers |
| Graphite | `graphite` | `#707070` | `--graphite` | Marginalia text, day labels, day-card body, lede/secondary copy |
| Ash | `ash` | `#8F8F8F` | `--ash` | Disabled state, fine-grain icon strokes |
| Obsidian | `obsidian` | `#000000` | `--obsidian` | Dark "anti-manifesto" stage, primary CTA fill, max-contrast wells |
| Azure (CTA) | `azure` | `#0071E3` | `--azure` | Reserved for future Apple-style primary CTA fill (selection highlight, focus ring) |
| Cobalt link | `cobalt-link` | `#0066CC` | `--cobalt-link` | Inline text links only (not button fills) |
| Olive (accent) | `olive` | `#5B6B2F` | `--olive` | Held back; available as an in-manuscript editorial mark only |
| Rust (correction) | `rust` | `#9C3E1F` | `--rust` | Anti-feature strikethrough, pull-quote rule on dark stage |

**Contrast.** All foreground/background combinations meet WCAG AA: ink-on-canvas 16.5:1; slate-on-canvas 9.7:1; graphite-on-canvas 5.7:1; ash-on-canvas 3.9:1 (use only at 14px+ semibold); azure-on-canvas 4.6:1.

**Forbidden combinations.** Olive text on rust; ash on fog below 14px; cobalt-link as a button fill (it is link-only); any color on a gradient (the page is gradient-free).

## 5. Typography

Three families. After the 2026-05-08 Apple-gallery refresh, **Inter** carries the entire UI surface (display + body + nav) at Apple's SF-Pro tracking; **EB Garamond** is held back for the post-itself and pull-quotes (the museum-piece copy); **IBM Plex Mono** for marginalia.

| Role | Family | Weights | Used at | Reason |
|------|--------|---------|---------|--------|
| Display + UI | **Inter** | 300 / 400 / 500 / 600 / 700 | Hero 96-128px, sections 64-80px, body 17px, nav 14px, button labels | SF-Pro Display substitute called out in `apple.md`. Tightens to `-0.022em` at 96px+ — the chiseled-mass effect Apple uses for marketing headlines. Weight 700 for hero, 600 for section headers, 400/500 for body and labels, 300 for the lede paragraphs (Apple's "lighter than headline" rule). |
| Editorial accent | **EB Garamond** | 400 / 500 / 600 / 700 (+ italic 400, italic 500) | Sample-post body 18-19px, pull-quotes 22-26px, ledger bullet em-dashes | Held back for the in-content "writing" only — the museum-piece treatment. The post and the pull-quote are the only places Garamond appears now; it carries the literary-agency identity from inside the gallery frame, not as the chrome of the page. |
| Mono | **IBM Plex Mono** | 400 / 500 | Marginalia caps `est. 2026`, byline dotline, mono labels, captions | Editorial machine-output voice; opens to `0.18em` for caps. |

Loaded from Google Fonts in `globals.css` with `display=swap`.

**Type scale (display, Apple-aligned).** 12 / 14 / 17 / 20 / 24 / 28 / 40 / 56 / 80 / 96 / 128 px. **Body scale.** 13 / 14 / 14.5 / 15 / 17 / 18 / 19 / 22 px. **Letter-spacing.** Display Inter at `-0.022em` for 96px+, `-0.016em` at 56px, `-0.010em` at 20px; mono labels open to `0.18em` for caps.

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
| 2026-05-08 | **Design refresh — `apple` reference (Gallery wall)**. Lifted Apple's MacBook product-page direction: pure-white canvas (`#FFFFFF`), Inter as SF-Pro substitute carrying the entire UI at Apple's display tracking (`-0.022em` at 96px+), hero headline pushed to **96-128px** centered above a museum-piece manuscript card. EB Garamond preserved inside the post and on pull-quotes — it now reads as the "color" of the gallery, not the chrome. Olive eyebrow rules and grain texture removed; section bands switched to canvas/fog alternation. Buttons swapped from square to **999px pills**, fill from olive-on-hover to opacity-only Apple feedback. Tier cards radius `0 → 28px`. Anti-manifesto stage swapped to `obsidian #000000` per Apple Dark Stage surface. Reference: `/Users/keer/projects/prin7r/design-references/apple.md`. | `apps/landing/`, DESIGN.md §1, §4-5, §15, button primitive |
