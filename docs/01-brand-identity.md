# 01 — Brand identity

> Bylineship is a literary agency for B2B LinkedIn — done-for-you organic growth for founders and senior operators who know they should be writing publicly but are not.

## Brand pyramid

- **Essence** — Editorial.
- **Personality** — patient · candid · craft-proud.
- **Values** — taste · refusal · slow-truth.
- **Attributes** — literary · plainspoken · thin-staffed · regional · refusal-first.

## Positioning statement

For B2B founders and senior operators who know LinkedIn is the right channel but cannot find the six hours a week to write well, **Bylineship** is a *literary agency* that ships three ghostwritten posts a week in your voice, an editorial comment plan against fifty target accounts, and a CRM-routed DM book — unlike LinkedIn coaches (who teach you to write but never write) and unlike growth hackers (who run engagement pods and bot comments) because we are six writers, we cap intake at six retainers per cohort, and we keep a printed list of things we will not do that we send back signed with every contract.

## Audience persona — primary

**Maya, the operations VP** — 36-50, runs operations at a 60-200 person B2B SaaS company, reports to the CEO, technically fluent. She reads *Stratechery*, *Lenny's Newsletter*, and the *FT Lex* column daily. She has been told by her CEO she should "be more visible on LinkedIn." She has tried; she has 1,400 followers; she has posted nothing in six months.

- **Goals** — be respected by her industry peers; be known to the next 30 CFOs and CIOs she'll sit across from; build a small audience that follows her, not a brand.
- **Frustrations** — LinkedIn coaches who tell her to "use a hook"; ghostwriters who wrote a post that sounded like a vendor blog; "personal brand" courses that turn her into a performer; the 90 minutes a post draft eats from her week.
- **Channels she lives in** — LinkedIn (reading, not writing), her CEO's Slack, *Stratechery* email, *Lenny*, *Lex*, podcast feeds (*Acquired*, *Invest Like the Best*, *In Depth*).

## Audience persona — secondary

**Diego, the second-time founder** — 38-55, raised a Series B last year, ICP is enterprise CIOs (specifically heads of platform, security, data infrastructure). He has tried two LinkedIn coaches and one ghostwriter; none caught his voice. He believes in the channel because his Series A was sourced through a LinkedIn DM from his lead investor's portfolio CEO.

- **Goals** — show up in the LinkedIn feeds of the 200 enterprise CIOs his Salesforce flags as ICP; build a quiet POV that becomes the reason a CIO takes his cold meeting.
- **Frustrations** — every ghostwriter so far has injected a "viral hook" into his drafts; his audience is allergic to that; he's lost trust in agencies twice.
- **Channels he lives in** — LinkedIn (writing rarely, reading seriously), Pavilion, GTM Partners' Discord, Reforge alumni, two *Acquired* group chats.

## Anti-personas

- Solopreneurs at <$300k ARR — too small for the price point and too underbaked on POV to make ghostwriting work.
- Influencer-economy creators — we don't run engagement pods, we don't write hooks, and we don't optimise for follower count.
- D2C consumer brands — wrong audience and wrong voice.
- Anyone who asks for a "viral hook framework" on the intake call. We send the deposit back.

## Voice and tone

**Do** —

- Plainspoken; first sentence drops the reader into the action ("Last week our CFO asked me how we'd cut renewal-cycle time without hiring. I gave her the wrong answer.").
- Use a single concrete artifact per post (a number, a meeting, a calendar, a transcript line).
- Be willing to be a little embarrassed. The most credible posts admit a small mistake.

**Don't** —

- Open with a hook ("Here's why most VPs fail at —"). Cut it.
- Use lists with arrows or unicode bullets. Use sentences.
- Manufacture controversy. The audience is allergic to it.

**Sample sentence** —
*The dashboard you stare at is not the system you run.*

## Visual system

### Palette

| Role | Hex | Purpose |
|---|---|---|
| Surface (page) | `#F5F1E8` | Bone — the page background; reads as paper |
| Surface (band) | `#EBE3D2` | Bone-2 — section bands and footer |
| Surface (manuscript) | `#FBF7EE` | The hero sample-post frame; one shade lighter than the page so the page itself looks like a desk |
| Ink | `#0B1A2A` | Deep navy; all body copy and primary buttons |
| Ink-2 | `#142435` | Inverted-section card surface |
| Graphite | `#1F2A38` | 14-15px body and ledger paragraph |
| Smoke | `#6E7989` | Marginalia caps and captions |
| Olive (editor) | `#5B6B2F` | Editor's marks, eyebrow rules, hover, signature underbar |
| Olive-2 | `#7A8C44` | The lighter olive used on the dark inverted manifesto section |
| Rust (correction) | `#9C3E1F` | Strikethroughs on anti-features, manuscript margin rule, error caption |

The palette deliberately avoids LinkedIn-blue, AI-mint, and "personal brand" purple. It reads as a printed page, not a SaaS dashboard.

### Typography pairing

- **Display — EB Garamond** (Google Fonts; weights 400 / 500 / 600 / 700 / 800 + italic 400 / 500). Old-style optical-sized serif tuned for both display and body. The italic 400 carries the editorial voice. Used at 56-112px in the hero, 40-56px in section headings, 22-26px in long-form prose, and 15.5px italic-leading in the sample-post body.
- **Body — Inter** (Google Fonts; weights 400 / 500 / 600). Neutral, high-legibility sans. Used at 14-17px for body, 11-13px for marginalia caps where the mono is wrong.
- **Mono — IBM Plex Mono** (Google Fonts; weights 400 / 500). Literary mono with slight serifs at the terminals. Used for marginalia caps, byline dotline, error captions.

### Logo concept

A small ink-fill stamp 32×32 with an EB Garamond Bold `B` monogram in manuscript white, and a 1.5px olive editor's-underbar across the bottom — a manuscript margin mark. Wordmark beside it: `Bylineship.` in EB Garamond 600, 20px, with the trailing period in olive.

```svg
<svg viewBox="0 0 64 64" width="34" height="34">
  <rect width="64" height="64" rx="2" fill="#0B1A2A"/>
  <text x="32" y="40" text-anchor="middle"
        font-family="EB Garamond, serif" font-weight="800" font-size="36"
        fill="#FBF7EE">B</text>
  <rect x="14" y="49" width="36" height="2" fill="#5B6B2F"/>
</svg>
```

### Spacing / radius / motion

- 4px base unit, scale 4 / 8 / 12 / 20 / 32 / 56 / 96.
- Square edges (`radius: 0`) on every primary surface; 2px on small avatar/initial blocks.
- One animation in steady state (typing cursor on the sample post). One hover transition per interactive element (ink→olive in 80ms).
- One soft shadow allowed on the masthead band (`0 1px 0 0 rgba(11,26,42,.08)`); a second on the manuscript frame; nothing else.

## Forbidden

- Copying any palette from another Wave 2 brand (chatbot-agency forest/carmine, market-research scarlet/ochre, voice-agents copper/sage, outbound-sales orange-on-graphite, tender-sniper brass/signal, lead-enrichment dev-portal mint).
- LinkedIn-blue accents anywhere — not in the buttons, not in the icons, not in the email signature.
- Mimicking Anthropic / OpenAI / Vercel / Linear visual identities.
- "Founder-flexing" headlines. "I went from $0 to $10M…" stays out of the brand.
- Lorem ipsum. Every word in this site is real copy a writer would defend in a Tuesday call.
