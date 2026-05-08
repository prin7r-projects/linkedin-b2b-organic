# apps/app — Voice & Brief

This folder is a placeholder for the Voice & Brief member dashboard — a member-only writers' room where the founder reviews drafts, signs off the comment-engine queue, and inspects the lead-routing log.

The dashboard ships in a later wave. The Wave 2 surface is the marketing landing at [`../landing/`](../landing/) plus the NOWPayments hosted-invoice checkout it triggers.

When the dashboard scaffolds:

- Stack: Wasp + open-saas (per playbook), with shadcn/ui as the primitive baseline.
- Auth: passwordless email magic-link first, Google OAuth second.
- Surfaces: `/inbox` (drafts to sign off), `/queue` (comment plan), `/log` (DMs that became calls), `/settings` (Voice profile, target accounts, CRM mapping).
- Storage: Postgres on Coolify (server `144.91.94.91`); object storage on Contabo S3-compatible.
- Payments: NOWPayments retainer renewal + Plisio backup, both wired to the same order schema as the landing.
