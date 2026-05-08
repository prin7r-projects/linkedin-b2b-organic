# 13 — Implementation Plan

> **Hand-off ready.** This plan is for the Wave 3 implementation agent picking up Bylineship after the Wave 2 marketing landing has shipped at `https://linkedin-b2b-organic.prin7r.com`. You will find: (a) a deployed Next.js 15 + ShadCN landing on `storage-contabo` with NOWPayments hosted-invoice checkout + HMAC-SHA512 IPN webhook; (b) brand identity / personas / journeys / pain / sales / channels / marketing / GTM / pitch in `/docs/01..10-*.md`; (c) the user-story contract in `/docs/11-user-stories-and-scenarios.md`; (d) the technical spec in `/docs/12-technical-specification.md`. Wave 3's job is the **operator dashboard** — voice intake ingest, drafts queue (Telegram-mirrored), comment plan, DM book with intent detection, CRM webhook, monthly accuracy report, craft hand-back package on cancellation. The cohort cap (6 retainers/month, hard ceiling 16-18 under management) is **structural** and must be enforced at the data-layer, not just by Lila's calendar. Read docs 11 + 12 before starting any phase. The brand is editorial and refusal-proud — every dashboard surface should feel like a *manuscript margin*, not a SaaS dashboard.

---

## 1. Phase breakdown

7 phases. Wave 3 takes the system from "landing + checkout shipped" to "Lila can run 12-18 retainers from one dashboard without spreadsheets."

| Phase | Goal | Effort |
|---|---|---|
| **0 — Scaffolding** | Wasp + open-saas + Postgres on Coolify; Telegram bot wired; LinkedIn publisher prototype | M — 2-3d |
| **1 — Cohort + retainer activation** | Intake email triage → cohort cap-enforced retainer creation → IPN-driven activation → voice profile delivery | M — 3-4d |
| **2 — Drafts queue (Telegram-mirrored)** | Senior writer drafts → head writer reviews → principal signs off in Telegram → LinkedIn publish | L — 4-6d |
| **3 — Comment plan + DM book + CRM webhook** | 50 target accounts; hand-drafted comments with sign-off; DM thread tracking; intent detection → HubSpot/Pipedrive | L — 4-6d |
| **4 — Production hardening** | Cohort-cap race conditions, IPN forgery, prompt injection, pod-detection, voice-profile exfil audit | M — 2-3d |
| **5 — Monthly report + craft hand-off + cancellation** | Last-Friday accuracy report; one-line-email cancellation; 24h craft hand-back package | M — 2-3d |
| **6 — Voice refresh + studio tier + cohort analytics** | 6-month voice refresh flow; Studio (4-voice) onboarding; cohort-fill / churn / referral analytics | M — 2-3d |

---

### Phase 0 — Scaffolding

**Goal.** Stand up the Wave 3 stack on Coolify (server `144.91.94.91`) without touching the Wave 2 landing. Prove Telegram + LinkedIn publish end-to-end with a single test retainer (Lila on her own account).

**Tasks.**
1. Provision the Wave 3 app under `apps/app/` — Wasp + open-saas scaffold, magic-link auth, Wasp roles (`principal`, `senior_writer`, `head_writer`, `admin`).
2. Provision Postgres on Coolify (server `144.91.94.91`); apply Drizzle schema from doc 12 §2.2.
3. Provision Redis on Coolify for BullMQ (queue backbone for drafts / intake / monthly-report jobs).
4. Wire Telegram bot (`@bylineship_bot` or similar) — outbound `TelegramOut.send`, inbound webhook for `/ship`, `/edit`, free-text replies.
5. Wire LinkedIn publisher prototype — principal-authorised browser session captured once, stored encrypted (KMS-wrapped DEK), refresh handshake every 7 days. Test publish on Lila's own account with a one-paragraph throwaway post.
6. Wire Postmark / SES inbound for `writers@linkedin-b2b-organic.prin7r.com` → `POST /api/intake/email-ingest`.
7. Set up audit logging (stdout JSON, journalctl on Coolify, eventually Loki Wave 4+).

**Deps.** None. Wave 2 landing keeps shipping unchanged.

**Effort.** M — 80-120 tool-uses, 2-3 days.

**DoD.**
- [ ] `apps/app/` boots on `app.linkedin-b2b-organic.prin7r.com` behind Coolify Traefik, valid letsencrypt cert.
- [ ] Postgres schema applies cleanly; `cohorts.capMax=6` is enforced (try inserting a 7th — must fail).
- [ ] Telegram round-trip: `TelegramOut.send` delivers; inbound `/ship` reply is received and routed.
- [ ] LinkedIn publisher publishes a one-line test post on Lila's account; URL captured.
- [ ] Inbound test email to `writers@…` lands in Lila's `#intake-triage` Slack within 60s.

**Hand-off context.** The Wave 2 landing is *the source of customer trust*. Don't refactor it during Wave 3 unless something breaks. Cohort cap = 6 is structural; raising it requires a head-writer-led decision and a doc 07 update — not a feature flag.

---

### Phase 1 — Cohort + retainer activation

**Goal.** From email-in-the-wild to active retainer with voice profile delivered, end-to-end. This is Scenario 1 + Scenario 2 step 2 in doc 11.

**Tasks.**
1. `IntakeTriageService` — parses inbound email, extracts company / role / LinkedIn URL via heuristics + Anthropic-Sonnet-4.6 fallback for ambiguous cases, scores against the 5 ICP qualifiers from doc 05, posts a triage card to Lila's `#intake-triage` channel.
2. `POST /api/cohorts/:monthIso/retainers` — head-writer-authenticated; cohort-cap enforced inside a `SERIALIZABLE` Postgres transaction (see doc 12 §7 threat 3). Studio tier consumes 2 slots, not 4.
3. NOWPayments hosted invoice integration extended to write a pending retainer row before redirecting to invoice (so IPN can match `orderId → retainerId`).
4. `RetainerActivationService` — fired from the IPN handler; idempotent on `(retainerId, paymentStatus='finished')`. Sets `status='active'`, increments `cohorts.filledCount`, fires Lila Telegram nudge.
5. `VoiceProfileService` — head-writer authors via dashboard form (8 voice tics, 12 themes, 5 anti-themes, sample post, podcast bio); generates PDF; stores in S3; delivers via Telegram to principal's channel.
6. `EditorialCallService.recordOutcome` — head writer logs the Monday call outcome (story angles → draft IDs).

**Deps.** Phase 0 complete.

**Effort.** M — 100-160 tool-uses, 3-4 days.

**DoD.**
- [ ] End-to-end demo: Lila sends a test email from her personal Gmail → triage card in Slack → Lila clicks "create retainer" → pending row → test NOWPayments invoice ($1) paid → IPN activates → Lila gets Telegram nudge within 10 min.
- [ ] Cohort cap concurrency: two simultaneous "create retainer" requests against a 5-of-6 filled cohort — exactly one succeeds, the other gets 409 `CohortFull`.
- [ ] Studio retainer creation consumes 2 cohort slots (not 1, not 4).
- [ ] Voice profile end-to-end: form submission → PDF generation → S3 upload → Telegram delivery to principal channel. PDF passes a typography check (EB Garamond + Inter, no Helvetica leak).

**Hand-off context.** Lila *will* short-circuit the dashboard for tricky retainers (e.g. a hand-wired Studio invoice). Build the manual-override path explicitly: `POST /api/admin/retainers/manual-activate` with a `paymentMethod='wire'` flag. Don't make her fight the system to do her job.

---

### Phase 2 — Drafts queue (Telegram-mirrored)

**Goal.** Three posts/week per retainer, drafted by senior + reviewed by head writer + signed off by principal in Telegram, published to LinkedIn under the principal's session. This is the operating loop — Scenario 3 in doc 11.

**Tasks.**
1. `DraftQueue` — workflow state machine: `drafting → senior_review → head_review → awaiting_principal → shipped` (or `killed`). Illegal transitions return 422.
2. Dashboard surfaces:
   - `/app/drafts/upcoming` — senior writer's queue.
   - `/app/drafts/review` — head writer's queue (with diff against senior's draft).
   - `/app/drafts/principal/:retainerId` — principal-only view of their own queue (rarely used; Telegram is the primary surface).
3. `TelegramOut.deliverDraft` — when status flips to `awaiting_principal`, draft body markdown lands in principal's Telegram channel with two inline buttons: `Ship` and `Edit`. The `Edit` button opens a one-tap reply-with-text flow.
4. `RevisionService` — when principal types a free-text reply (e.g. "*'embarrassed' should be 'a little embarrassed'*"), the message is stored as a `revisions` row, the senior writer is notified, applies the change, re-delivers.
5. `LinkedInPublisher.publish` — uses the principal's stored session token; on 4xx, falls back to manual-publish queue (Lila gets a Slack ping; she publishes via the principal's authorised browser within the day).
6. EC-10 fallback — Telegram outage → `EmailFallback.send` with HMAC-signed one-click signoff link.

**Deps.** Phase 1 complete; LinkedIn publisher prototype from Phase 0 hardened.

**Effort.** L — 200-300 tool-uses, 4-6 days.

**DoD.**
- [ ] End-to-end: senior writer drafts in dashboard → head writer reviews/edits → status `awaiting_principal` → principal Telegram → principal taps `Ship` → post published to LinkedIn → `linkedinPostUrl` stored. p95 from `awaiting_principal → shipped` < 90s.
- [ ] Free-text revision: principal replies "make it less polished" in Telegram → senior writer gets Slack ping with the request → re-delivers within 60 min during work hours.
- [ ] Telegram outage drill: kill bot for 5 min → `EmailFallback` sends signoff link → principal clicks → post ships → bot recovers, system re-syncs.
- [ ] State machine: attempting `drafting → shipped` directly returns 422; only `awaiting_principal → shipped` is allowed.
- [ ] LinkedIn 4xx drill: simulate 401 from LinkedIn (expired session) → `manual-publish` queue created → Lila notified within 60s.

**Hand-off context.** The Telegram review surface is **the** product moment. Spend disproportionate effort on the buttons, the typography of the draft preview, the diff display when the principal asks for a change. The dashboard is a back-office; Telegram is the polished customer surface.

---

### Phase 3 — Comment plan + DM book + CRM webhook

**Goal.** The other half of the retainer: 50 target accounts, 15 hand-drafted comments/week (signed off by principal), DM book tracking warm threads, intent detection → CRM webhook to HubSpot/Pipedrive. Scenario 3 steps 2-7 + Scenario 5.

**Tasks.**
1. `targetAccounts` CRUD — head writer + senior writer can add / remove / mark stale. Stale-since-21-days surfaced for next Monday call.
2. `CommentPlan.queue(weekId, retainerId)` — generated each Monday, holds 15 candidate comments (one per recently-active target account, ranked by recency + dwell-time history).
3. Senior writer drafts each comment by hand in the dashboard; status flips to `awaiting_principal_signoff`; Telegram delivery to principal in a single batched message (15 comments at once) with one-tap sign-off.
4. `CommentRun.execute` — publishes signed-off comments to LinkedIn under principal session; dwell-time tracked client-side at publish.
5. `DMBook` — surface for senior writer to track threads with target accounts. Each thread has counterparty info + status (`warm | engaged | meeting_booked | closed_lost | closed_won`).
6. `IntentDetector(thread)` — runs on every inbound DM message; matches against `retainer.intentKeywords` (default 5: meeting / 15 minutes / compare notes / discovery / call); fires `IntentEvent` row + `CRMWebhook.fire`.
7. `CRMWebhook.fire(crmConfig, payload)` — routes to HubSpot OAuth flow (Marketplace app; per-retainer install) or Pipedrive webhook URL (per-retainer config). Payload: contact + deal + note. Per doc 03 §Journey 3 step 5.
8. False-positive flagging — `PATCH /api/intent-events/:id/false-positive` (head-writer only); weekly retro surfaces these for keyword retuning.

**Deps.** Phase 2 complete (DM ingest reuses LinkedIn session infrastructure from publisher).

**Effort.** L — 200-300 tool-uses, 4-6 days.

**DoD.**
- [ ] Comment-plan end-to-end: 50 target accounts seeded → Monday plan generated with 15 candidate comments → senior writer drafts all 15 (or kills some) → batched Telegram sign-off → publish run → dwell-time recorded average ≥9 min on a sample week.
- [ ] DM book: a target-account DM containing "*Yes — 15 minutes next week*" triggers `IntentEvent` → HubSpot deal created in `Inbound · LinkedIn` pipeline within 60s.
- [ ] False-positive: a non-intent DM ("*15 minutes left in my day, anyway*") triggers `IntentEvent` → Lila tags it false-positive → row updated; weekly retro surfaces it.
- [ ] CRM toggling: switch a retainer's CRM config from HubSpot to Pipedrive without dropping any in-flight events.
- [ ] No-LLM-comments invariant: try to add a "draft this comment with AI" button — code review rejects (per doc 11 AS-3).

**Hand-off context.** The intent classifier (Wave 4 deferred) will replace the keyword regex with an Anthropic-backed binary classifier trained on Lila's false-positive ledger. Build the data structure now (`intent_events.falsePositive`, `intent_events.rawMessageBody`) so the classifier has training data day 1 of Wave 4.

---

### Phase 4 — Production hardening

**Goal.** System survives concurrent cohort intake, IPN forgery attempts, prompt injection in voice profiles, engagement-pod participation by retainers, voice-profile exfiltration attempts, and Telegram/LinkedIn outages.

**Tasks.**
1. Cohort-cap race condition test suite (load test: 100 concurrent retainer-create requests at a 5/6 filled cohort → exactly 1 succeeds).
2. IPN forgery test suite — mismatched HMAC, replayed body, mutated body — all return 401 / are 200-acked-without-side-effects per idempotency.
3. LLM prompt-injection test suite — voice-profile form payloads with `SYSTEM:`, `IGNORE PREVIOUS`, role-leak attempts must fail validation before reaching Anthropic.
4. Pod-detection job — weekly cron; for each retainer, checks for clusters of comments-from-known-pod-accounts within 6h windows on the principal's posts; raises `monthly_reports.podDetectionFlag=true`.
5. Voice-profile audit — every read of `voice_profiles` is logged with writer ID + timestamp; weekly head-writer review query: "*who read voice profiles for retainers they are not assigned to?*"
6. Telegram + LinkedIn circuit breakers — if LinkedIn 4xx >2 per retainer per day, auto-pause the principal's draft queue and alert.
7. Backup + restore drill — restore the Postgres from yesterday's pg_dump on a staging Coolify; verify schema + data integrity; document RTO.
8. Takedown runbook at `/docs/runbooks/takedowns.md` — what to do if a retainer publishes content we need to retract (rare; covered for compliance per doc 05 §Anti-personas).

**Deps.** Phases 1-3 complete.

**Effort.** M — 100-150 tool-uses, 2-3 days.

**DoD.**
- [ ] Concurrent retainer-create at full cohort: exactly 1 of N succeeds; others get 409.
- [ ] IPN forgery cases (5 different attack patterns) all return 401.
- [ ] Prompt-injection test cases (10 patterns) all rejected at form validation.
- [ ] Pod-detection demo: synthetic cluster of pod-comments → `podDetectionFlag=true` on next monthly report.
- [ ] Voice-profile audit: cross-retainer read attempt by senior writer → audit row created → weekly review query surfaces it.
- [ ] Backup-restore drill: full restore <30 min RTO.

**Hand-off context.** The hardest threat is voice-profile exfiltration by an insider (doc 12 §7 threat 5). The technical mitigation is audit-only; the contract + culture are load-bearing. Don't over-engineer the technical controls beyond audit logging — instead, ensure the senior-writer NDA and the weekly audit-review ritual are in place.

---

### Phase 5 — Monthly report + craft hand-off + cancellation

**Goal.** End-of-month and end-of-retainer flows polished. The exit clause has teeth (one-line email cancels, hand-back within 24h, in-flight refund if no first post yet). Scenario 6 in doc 11.

**Tasks.**
1. `MonthlyReportService` — runs last Friday of each month for each active retainer; pulls follower deltas (LinkedIn API where available, manual fallback), comment relationships started, DMs sent, DMs that became meetings; writes `monthly_reports` row; delivers one-page Telegram message.
2. Cancellation handler — `POST /api/retainers/:id/cancel` (principal JWT) or one-line-email handler (Lila replies with cancel confirmation). Sets `status='cancelled'`, disables next-cycle invoice.
3. `CraftHandoffPackage.assemble(retainerId)` — generates a zip containing voice profile PDF, all editorial-call transcripts (markdown bundle), full editorial calendar (CSV), comment list with target-account history (CSV), DM book (markdown). Uploads to S3 with 7-day signed URL.
4. In-flight-month refund — if `cancellation.firstPostShipped=false`, NOWPayments refund flow triggered (manual on Wave 3; automated on Wave 4 if NOWPayments ships partial-refund API).
5. 30-day post-cancellation Telegram nudge — Lila's one-line "*if you ever come back, you don't re-do the voice intake. Three days notice and we re-open.*"
6. Cohort accounting — cancelled retainer frees a cohort slot for the *next* cohort (current cohort is locked once intake closes).

**Deps.** Phases 1-3 complete.

**Effort.** M — 80-120 tool-uses, 2-3 days.

**DoD.**
- [ ] Monthly report end-to-end: last-Friday cron fires → reports delivered to all active retainers' Telegrams within 30 min.
- [ ] Cancellation by email: Lila replies "*cancellation confirmed*" → handler triggers `cancellation` flow → next-cycle invoice disabled → retainer in `cancelled` status.
- [ ] Craft hand-back: zip generated <20 min from cancellation → S3 7-day URL emailed to principal.
- [ ] In-flight refund: cancellation before first-post-shipped → NOWPayments refund queued → Lila notified to confirm refund manually (Wave 3) within 24h.
- [ ] No win-back drip: assert no email/Telegram outbound to cancelled retainer except the one 30-day nudge.

**Hand-off context.** The cancellation flow is a *brand statement*, not a UX optimisation. The 24h hand-back package and the absence of a save-attempt are explicitly load-bearing per doc 04 §Cross-cutting and doc 07 §Cancellation. Resist any product/growth temptation to add a cancellation survey, a save-flow, or a discount offer.

---

### Phase 6 — Voice refresh + Studio tier + cohort analytics

**Goal.** Long-term retainer health features: 6-month voice refresh; Studio (4-voice) onboarding flow; cohort-level analytics for Lila and Keer.

**Tasks.**
1. Voice-refresh flow — at month 6 of any retainer, Lila gets a Slack ping; offers 30-min call; on confirmation, re-runs partial voice intake (3 of the 6 prompts from doc 03 §Journey 2); updates `voice_profiles.lastReviewedAt` and amends voice tics + themes.
2. Studio (4-voice) onboarding — single retainer record with `tier='studio'` + 4 child principals; one editorial call covers all four (45 min weekly); Studio consumes 2 cohort slots; custom-invoice flow (`paymentMethod='wire'` or `'manual_card'`).
3. Cohort analytics dashboard for head writer + admin:
   - Cohort fill rate over time (target 100%).
   - Time-to-cohort-full (target <5 working days; days 1-2 are the action).
   - Month-1 churn rate per cohort (target <17%).
   - Annual prepay conversion rate (target ~25% by month 4).
   - Referral-conversion ratio (warm referrals → retainer; target 70%).
4. Wait-list management — cohort closes at 6/6 → wait-list opens for next month; 48h heads-up email to wait-list before next cohort opens.
5. Pavilion/GTM/Reforge participation tracker — Lila logs participation count per channel per month (per doc 06 §KPIs).

**Deps.** Phases 1-5 complete.

**Effort.** M — 100-150 tool-uses, 2-3 days.

**DoD.**
- [ ] Voice refresh: month-6 trigger fires → Lila Slack ping → call logged → updated voice profile delivered to principal Telegram.
- [ ] Studio onboarding: 4-voice retainer created via admin path → 2 cohort slots consumed → 4 voice intakes scheduled → 4 voice profiles delivered → all four shipping by week 4.
- [ ] Cohort analytics: dashboard displays last 6 cohorts with fill rate, time-to-full, month-1 churn.
- [ ] Wait-list: cohort 5/6 → 6/6 → wait-list opens → 48h heads-up email sent at next cohort -2d.

**Hand-off context.** The wait-list page (doc 09 §Week 1) is currently a single sentence on the landing. Don't over-engineer this in Wave 3 — keep it a single sentence; the constraint is the brand, not the engineering.

---

## 2. Cross-cutting concerns

| Concern | First addressed | Notes |
|---|---|---|
| Accessibility | Phase 2 | Lighthouse a11y >= 95 on dashboard + Telegram output (markdown only) |
| i18n | Out of scope through Wave 5 | Audience is English-fluent B2B; the brand is editorial-English-first |
| Mobile | Phase 2 | Responsive web; Telegram is the principal mobile surface |
| Telemetry | Phase 4 | Stdout JSON; Loki Wave 4+ |
| GDPR / DSAR | Phase 4 | Email-only PII; voice intake recordings + transcripts are sensitive — DSAR runbook required |
| SOC 2 | Out of scope through Wave 5 | Single-customer NDAs do the load-bearing work today |
| Brand consistency review | Every phase | Designer (or Keer) reviews each new dashboard surface against `01-brand-identity.md` palette + typography before merge |

---

## 3. Risk register

| # | Risk | Owner phase | Mitigation |
|---|---|---|---|
| R1 | NOWPayments outage / KYC pause | Phase 4 | Plisio backup stubbed (~2h to bring online); manual USD wire flow already proven (~10% of retainers) |
| R2 | Forged IPN | Phase 4 | HMAC-SHA512 + timing-safe-equal; idempotent on `(orderId, paymentStatus)` |
| R3 | Cohort cap bypass | Phase 1 + 4 | `SERIALIZABLE` Postgres txn around cap check; concurrent test suite |
| R4 | Voice profile leak by senior writer | Phase 4 | Audit log + weekly review + NDA + culture |
| R5 | LinkedIn session token expiry / IP block | Phase 0 + 2 | Weekly refresh handshake; manual-publish fallback via Lila's calendar |
| R6 | Engagement-pod participation by an existing retainer | Phase 4 | Pod-detection cron raises monthly report flag; one-call conversation; cancellation if not resolved |
| R7 | False-positive intent events spam customer's CRM | Phase 3 | Verified-target-account requirement; weekly false-positive retro; classifier upgrade Wave 4 |
| R8 | Head-writer over-extension (>16-18 retainers under management) | Phase 6 | Cohort-cap analytics surface this; intake closes early next cohort; hire third senior writer triggered |
| R9 | A retainer publishes content we need to retract | Phase 4 | Takedown runbook; LinkedIn delete via session; communication template ready |
| R10 | Backup/restore failure | Phase 4 | Monthly drill; documented RTO <30 min |

---

## 4. References

- Doc 01 — `/docs/01-brand-identity.md` — brand pyramid, palette, typography, anti-rules.
- Doc 02 — `/docs/02-architecture.md` — Wave 2 shipped surface + deferred Wave 3 surface.
- Doc 03 — `/docs/03-user-journeys.md` — discovery, onboarding, recurring-use loops.
- Doc 04 — `/docs/04-pain-points.md` — five alternatives' specific failure modes.
- Doc 05 — `/docs/05-audience-profile.md` — ICP qualifying criteria + 3 personas + anti-personas.
- Doc 06 — `/docs/06-sales-channels.md` — 40/30/20/8/2 channel mix.
- Doc 07 — `/docs/07-sales-strategy.md` — pricing, intake cohort, objection handling.
- Doc 08 — `/docs/08-marketing-strategy.md` — positioning, content pillars, tone.
- Doc 09 — `/docs/09-go-to-market.md` — 90-day cadence.
- Doc 10 — `/docs/10-pitch-deck.md` — investor-style summary.
- Doc 11 — `/docs/11-user-stories-and-scenarios.md` — input contract for this plan.
- Doc 12 — `/docs/12-technical-specification.md` — data model, contracts, security, observability, performance budgets.
- DESIGN.md — `/DESIGN.md` — manuscript-margin visual contract.
- Wave 2 playbook — `/Users/keer/projects/prin7r/wave2-playbook.md` — the build pipeline that shipped the landing.
- Payments prototypes — `/Users/keer/projects/prin7r/payments-prototypes/` — NOWPayments + Plisio + Reown reference.
