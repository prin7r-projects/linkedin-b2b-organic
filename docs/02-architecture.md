# 02 — Architecture

> Wave 2 ships only the marketing landing + a working NOWPayments hosted-invoice checkout. The full member dashboard (Voice & Brief, drafts queue, comment plan, DM book, CRM webhook) is reserved for a later wave. This doc captures both the shipped surface and the deferred surfaces so the system is legible to the next agent.

## System diagram

```mermaid
flowchart TD
  subgraph BR[Browser]
    L[Landing page<br/>linkedin-b2b-organic.prin7r.com]
  end

  subgraph CO[storage-contabo · 161.97.99.120]
    T[dokploy-traefik<br/>host network · letsencrypt]
    NX[Next.js standalone server<br/>Node 22 · port 3000]
    EN[/opt/prin7r-deploys/linkedin-b2b-organic/.env]
  end

  subgraph PROV[3rd party]
    NP[NOWPayments API<br/>POST /v1/invoice<br/>IPN HMAC-SHA512]
    GH[GitHub<br/>prin7r-projects/linkedin-b2b-organic]
    NT[Notion<br/>opportunity 3543ceec…]
  end

  subgraph DEFER["apps/app/ — deferred (later wave)"]
    AP[Voice & Brief dashboard<br/>Wasp + open-saas]
    DB[(Postgres<br/>orders · drafts · comments)]
    HS[HubSpot / Pipedrive<br/>CRM webhook OUT]
  end

  L -->|GET /| T --> NX
  L -->|POST /api/checkout/nowpayments| NX -->|POST /v1/invoice<br/>x-api-key| NP
  NP -->|invoice_url JSON| NX -->|303 redirect| L
  NP -->|POST /api/webhooks/nowpayments<br/>x-nowpayments-sig HMAC-SHA512| NX
  NX -->|console.log audit| CO

  NX -.->|reads| EN
  NX -.->|future| AP --> DB
  AP -.->|future| HS

  GH -.->|git pull| CO
  NT -.->|Source URL property| GH
```

## Components (shipped surface)

| Component | Tech | Where | Purpose |
|---|---|---|---|
| Landing page | Next.js 15 App Router, React 19, Tailwind 3.4, hand-coded ShadCN-vendored primitives | `apps/landing/` | Marketing surface — hero, service ledger, week strip, anti-manifesto, pricing, FAQ, footer |
| Checkout API route | Next.js Route Handler, `nodejs` runtime | `apps/landing/app/api/checkout/nowpayments/route.ts` | `POST` { plan } → call NOWPayments `/v1/invoice` → return `{ invoice_url, invoice_id }` |
| IPN webhook | Next.js Route Handler, `nodejs` runtime | `apps/landing/app/api/webhooks/nowpayments/route.ts` | Verify HMAC-SHA512 of sorted JSON body → audit log paid status → return 200 |
| HMAC verifier | Node `crypto.createHmac('sha512')` + JSON canonicalisation by sorted keys | `apps/landing/lib/nowpayments.ts` | Reusable verifier copied from `payments-prototypes/src/lib/signatures.ts` |
| Container | Multistage Node 22 alpine; Next.js standalone output | `Dockerfile.landing` | Build `.next/standalone` into a slim runtime image |
| Reverse proxy | Traefik with letsencrypt resolver, host network | `dokploy-traefik` on storage-contabo | Routes `linkedin-b2b-organic.prin7r.com` to the container's port 3000 |
| DNS | Wildcard `*.prin7r.com → 161.97.99.120` | Cloudflare, zone `prin7r.com` | Existing wildcard covers this subdomain — no per-subdomain record needed |

## Components (deferred to later wave)

| Component | Tech | Status | Trigger to ship |
|---|---|---|---|
| Voice & Brief dashboard | Wasp + open-saas + shadcn/ui primitives | scaffold-only (`apps/app/.gitkeep` + `apps/app/README.md`) | When the third paying retainer signs and the head writer needs a non-Telegram review surface |
| Orders schema | Postgres on Coolify (server `144.91.94.91`) — `orders`, `drafts`, `comments`, `dms` | not implemented | Same trigger as above |
| CRM webhook OUT | HubSpot Marketplace OAuth or Pipedrive webhook URL | not implemented | When the first Operator-tier retainer activates the CRM-routing feature |
| Plisio backup checkout | `payments-prototypes/src/lib/plisio.ts` pattern | env var stubbed in `.env.example` | When NOWPayments rate-limits a cohort or a customer specifically requests |
| Reown wallet fallback | `payments-prototypes/src/components/web3-payment.tsx` pattern | env var stubbed in `.env.example` | When a customer asks to pay from their own MetaMask |

## Data flows

### 1. Visitor takes a retainer

```
User clicks "Take Operator →"
  → POST /api/checkout/nowpayments  body: {plan:"operator"}
  → Next.js validates plan id (one of "founder" | "operator" | "director")
  → reads NOWPAYMENTS_API_KEY from process.env
  → POST https://api.nowpayments.io/v1/invoice  headers: {x-api-key}
       body: {price_amount: 2990, price_currency:"usd", order_id, ipn_callback_url, success_url, cancel_url}
  → NOWPayments responds {id, invoice_url, ...}
  → Next.js returns {invoice_url} to client
  → client window.location.assign(invoice_url) — user lands on NOWPayments hosted page
```

### 2. NOWPayments confirms payment

```
Customer pays USDT/USDC on NOWPayments hosted page
  → NOWPayments POST https://linkedin-b2b-organic.prin7r.com/api/webhooks/nowpayments
       headers: {x-nowpayments-sig: <hmac-sha512 of sorted JSON>}
       body:    JSON of {payment_id, order_id, payment_status, ...}
  → Next.js reads NOWPAYMENTS_IPN_SECRET
  → recomputes HMAC over JSON.stringify(sortObject(body))
  → timing-safe-equal against header
  → if match: console.log audit line, returns 200
  → if mismatch: returns 401 (provider retries)
```

### 3. Future — orders persistence (deferred)

When `apps/app/` ships, the IPN handler will additionally write to a Postgres `orders` row keyed by `order_id`, transitioning state `awaiting_payment → paid → onboarding_call_booked → first_post_published`. The same handler will fire a Telegram notification to the on-call writer.

## Deploy topology

- **Host** — `storage-contabo` (root@161.97.99.120), Ubuntu 24.04, Docker 27+, Compose plugin v2.30.3.
- **Reverse proxy** — `dokploy-traefik` running in host network mode with `exposedByDefault=false`. Picks up our container via Docker labels, no `dokploy-network` reference needed.
- **TLS** — letsencrypt HTTP-01 resolver `letsencrypt`, account `kee22r@gmail.com`. Issued automatically on first request.
- **Storage** — bind-mount only for the `.env` file (read into the container via `env_file: - .env`). No persistent volumes.
- **Logs** — `docker logs linkedin-b2b-organic-landing` writes to journalctl on the host. The IPN handler emits `[UNDERLINE_NOWPAYMENTS_IPN]` tagged lines for audit.

## Security posture

- API key (`NOWPAYMENTS_API_KEY`) and IPN secret (`NOWPAYMENTS_IPN_SECRET`) only live in `/opt/prin7r-deploys/linkedin-b2b-organic/.env` on the host (gitignored). Never committed.
- HMAC-SHA512 IPN verification is mandatory; unverified requests return HTTP 401.
- Signature comparison uses `crypto.timingSafeEqual` over hex buffers.
- The landing has no auth, no PII collection, no cookies. The two CTAs are NOWPayments-hosted-invoice (which redirects off-domain) and `mailto:`.
- HSTS / TLS 1.2+ enforced by Traefik letsencrypt config.
- No third-party JS beyond Google Fonts CSS import (`fonts.googleapis.com`). No analytics, no pixels.

## Operational runbook (deploy + verify)

```bash
# On storage-contabo
mkdir -p /opt/prin7r-deploys/linkedin-b2b-organic
cd /opt/prin7r-deploys/linkedin-b2b-organic
git clone https://github.com/prin7r-projects/linkedin-b2b-organic.git .
cp .env.example .env
# paste NOWPAYMENTS_API_KEY + NOWPAYMENTS_IPN_SECRET (from chatbot-agency .env or keys vault)
docker compose build
docker compose up -d
docker logs linkedin-b2b-organic-landing | tail
curl -sI https://linkedin-b2b-organic.prin7r.com   # expect HTTP/2 200, valid LE cert
curl -X POST https://linkedin-b2b-organic.prin7r.com/api/checkout/nowpayments \
     -H 'content-type: application/json' \
     -d '{"plan":"founder"}'                       # expect {"invoice_url":"https://nowpayments.io/payment/?iid=…", …}
```

The `docker compose build` step takes ~95s on a warm cache, ~3 min cold. The container's `nextjs` user runs as UID 1001.
