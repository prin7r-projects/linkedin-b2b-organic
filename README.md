# Underline — a literary agency for B2B LinkedIn · `linkedin-b2b-organic.prin7r.com`

> Done-for-you LinkedIn organic growth for B2B founders and senior operators. Three ghostwritten posts a week in your voice, an editorial comment plan against fifty target accounts, a DM book that lands meetings. No engagement pods, no bots, no clickbait hooks. Six writers, six retainers per cohort.

- Landing — <https://linkedin-b2b-organic.prin7r.com>
- Notion opportunity — `3543ceec-2619-81ce-af77-f6ddd853b95d`
- Repo — <https://github.com/prin7r-projects/linkedin-b2b-organic>

## Repo structure

```
.
├── DESIGN.md                 # 15-section design + style guide (Chief of Design)
├── apps/
│   ├── landing/              # Next.js 15 + ShadCN — hero (sample post) / service / week / anti / pricing / faq
│   └── app/                  # Stub for the open-saas Voice & Brief dashboard (deferred)
├── docs/                     # 10 strategy docs + pitch deck (MD + HTML)
│   └── screenshots/          # Desktop + mobile production captures
├── Dockerfile.landing        # Next.js standalone build, multi-stage
├── docker-compose.yml        # Single-service Traefik label set
└── .env.example              # NOWPayments + Plisio + Reown env names
```

## What this Wave 2 build ships

- A 15-section [`DESIGN.md`](./DESIGN.md) at root.
- The 10 strategy / design docs under [`docs/`](./docs/) — brand identity, architecture, journeys, pain points, audience, channels, sales, marketing, GTM, pitch deck (with companion `pitch-deck.html`).
- A hand-coded Next.js 15 landing at [`apps/landing/`](./apps/landing/) with ShadCN-vendored Button + Card primitives re-themed to the Underline tokens, a manuscript-framed sample ghostwritten post as the visual hero, and an inverted "anti-feature manifesto" section.
- NOWPayments hosted-invoice route at [`/api/checkout/nowpayments`](./apps/landing/app/api/checkout/nowpayments/route.ts) and HMAC-SHA512 IPN webhook at [`/api/webhooks/nowpayments`](./apps/landing/app/api/webhooks/nowpayments/route.ts).
- A Dockerfile + docker-compose for deployment to `storage-contabo` behind Traefik with Let's Encrypt.
- Desktop + mobile production screenshots under [`docs/screenshots/`](./docs/screenshots/).

## Screenshots

| | |
|---|---|
| Desktop 1440×900 | ![desktop](docs/screenshots/landing-desktop.png) |
| Mobile 390×844 | ![mobile](docs/screenshots/landing-mobile.png) |

## Dev quickstart

```bash
# From repo root
cd apps/landing
pnpm install
cp ../../.env.example ../../.env   # populate NOWPayments creds locally
pnpm dev                           # http://localhost:3000
```

The page renders without env credentials, but the **Take Founder / Operator / Director** buttons return HTTP 503 with a clear error until `NOWPAYMENTS_API_KEY` is set.

## Deploy quickstart

```bash
ssh storage-contabo
mkdir -p /opt/prin7r-deploys/linkedin-b2b-organic && cd /opt/prin7r-deploys/linkedin-b2b-organic
git clone https://github.com/prin7r-projects/linkedin-b2b-organic.git .
cp .env.example .env && nano .env   # paste NOWPayments creds (same keys as chatbot-agency)
docker compose build
docker compose up -d
```

Traefik on `storage-contabo` runs in host-network mode with a Docker provider mounted on `/var/run/docker.sock`; the labels in `docker-compose.yml` are sufficient — no per-subdomain DNS or Traefik dynamic config needed (wildcard `*.prin7r.com → 161.97.99.120` is already in place).

Verify within 5 min:

```bash
curl -sI https://linkedin-b2b-organic.prin7r.com | head -3
# HTTP/2 200 …
```

## Provenance

The NOWPayments checkout pattern (`apps/landing/lib/nowpayments.ts`) is copied verbatim from the canonical reference at `/Users/keer/projects/prin7r/payments-prototypes/src/lib/signatures.ts`. The repo skeleton (Dockerfile.landing, docker-compose.yml, env conventions) mirrors `chatbot-agency` — the *structural* sister Wave 2 build — for consistency across the studio's twenty Wave 2 projects, with the visual identity (palette, typography, voice, manuscript-frame motif, anti-feature manifesto) entirely ours.

## License

MIT. See [LICENSE](./LICENSE).
