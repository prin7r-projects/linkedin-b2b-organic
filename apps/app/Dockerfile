# syntax=docker/dockerfile:1
# Bylineship Wave 3 — operator dashboard Dockerfile.
#
# Multistage build: deps → build → standalone runtime.
# Matches the pattern from Dockerfile.landing.
#
# Build:  docker build -f apps/app/Dockerfile -t linkedin-b2b-organic-app:latest .
# Run:    docker run -p 3001:3001 --env-file apps/app/.env linkedin-b2b-organic-app:latest

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY apps/app/package.json apps/app/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/app/ ./
RUN npx next build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3001

CMD ["node", "server.js"]
