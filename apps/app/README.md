# Bylineship — Writers' Room (Wave 3)

The operator dashboard for Bylineship, the literary agency for B2B LinkedIn.

- **Stack:** Next.js 15 (App Router), Drizzle ORM, Postgres, NextAuth v5
- **Deploy:** Coolify on server `144.91.94.91`
- **Landing:** [`apps/landing/`](../landing/) — Wave 2, shipped
- **Docs:** [`docs/`](../../docs/) — brand, architecture, user stories, tech spec

## Development

```bash
# From repo root
cd apps/app
cp .env.example .env
# Edit .env with real DATABASE_URL, AUTH_SECRET, etc.
pnpm install
pnpm dev        # starts on port 3001
```

## Database

```bash
pnpm db:push    # push schema to dev DB
pnpm db:generate # generate migrations
pnpm db:migrate  # apply migrations
pnpm db:studio   # open Drizzle Studio
```

## Deployment

```bash
cd apps/app
docker build -f Dockerfile -t linkedin-b2b-organic-app:latest .
docker run -p 3001:3001 --env-file .env linkedin-b2b-organic-app:latest
```

## Phase status

- [x] Phase 0 — Scaffolding (in progress)
- [ ] Phase 1 — Cohort + retainer activation
- [ ] Phase 2 — Drafts queue (Telegram-mirrored)
- [ ] Phase 3 — Comment plan + DM book + CRM webhook
- [ ] Phase 4 — Production hardening
- [ ] Phase 5 — Monthly report + craft hand-off + cancellation
- [ ] Phase 6 — Voice refresh + Studio tier + cohort analytics
