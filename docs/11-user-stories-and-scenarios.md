# 11 — User Stories and Scenarios

This document is the canonical input contract for Bylineship's Wave 3 (member-facing) implementation. It enumerates personas (lifted from `05-audience-profile.md` plus one cohort-internal operator), primary user stories, end-to-end happy-path scenarios, edge cases, and anti-scenarios. Every API endpoint and worker in `12-technical-specification.md` must trace back to a story here, and every phase in `13-implementation-plan.md` must satisfy a Definition of Done that maps back to a scenario.

Bylineship is a **literary agency for B2B LinkedIn** — six retainers per cohort, six writers, retainer-capped, intake-cohorted. The Wave 2 marketing landing has shipped at `linkedin-b2b-organic.prin7r.com`; the deferred Wave 3 surface is the *operator dashboard* (Voice & Brief, drafts queue, comment plan, DM book, CRM webhook). Doc 11 is written so the next agent can build that surface without re-deriving the brand.

---

## 1. Personas summary

### P1 — Maya, the operations VP (primary; deep dive `05-audience-profile.md` §Persona 1)

36-50, VP/SVP Operations or COO at a 60-200 person B2B SaaS, $10-40M ARR, EU or East-Coast US. Reads Stratechery + Lenny + FT Lex daily. 1,200-3,500 LinkedIn followers, posted 8-20 times in 24 months, stopped 60-180 days ago. Has 1.5 hours/week for LinkedIn. Voice cue: "I have stories. I do not have the six hours/week to write." Buys **Operator** ($2,990/mo).

### P2 — Diego, the second-time founder (secondary; deep dive `05-audience-profile.md` §Persona 2)

38-55, founder/CEO of a Series A or Series B B2B SaaS, $3-15M ARR, 25-90 employees. 3,500-12,000 followers, lapsed. Has tried one LinkedIn coach + one ghostwriter; neither stuck. ICP is enterprise CIOs. Voice cue: "I am not, currently, a known POV. The Series-B clock is ticking." Buys **Director** ($4,990/mo).

### P3 — Jordan, the agency principal (tertiary; deep dive `05-audience-profile.md` §Persona 3)

CRO / Head of GTM / VP Sales running 4-8 named LinkedIn voices in parallel inside a sales-led B2B company. Comes in only via upstream introduction from a Maya- or Diego-shaped principal. Voice cue: "I want one editorial call to cover four voices." Buys custom **Studio** retainer ($9-15k/mo).

### P4 — Lila, the head writer (operator persona, NEW in this doc)

35-45, head writer + agency principal. Runs every intake call. Holds the cohort cap. Reviews every draft before it leaves Telegram. Wakes early Monday to chair editorial calls (90 min slots, 6-12 retainers under management). Voice cue: "If I cannot recognise the principal's voice in the draft, the draft does not ship." She is the second-most-important user of the Wave 3 dashboard — after the principal — and the load-bearing approver in every DoD below.

### Anti-personas (out of scope — see `05-audience-profile.md` §Anti-personas)

Solopreneurs / coaches / creators (no team behind them); pre-PMF startups ($0-500k ARR); influencer-economy / personal-brand crowd; D2C / consumer brand operators; "thought leadership with no thought" intakes; compliance-impossible verticals (primary-care medical advice, securities recommendations, legal-defence content); existing engagement-pod participants; "make me viral" expectations.

---

## 2. Primary user stories

12 stories spanning intake → voice profile → draft queue → comment plan → DM book → CRM routing → cancellation.

1. **As Maya (prospect), I want to email `writers@linkedin-b2b-organic.prin7r.com` from the landing's mailto with a 5-sentence intro, so that I avoid filling out a 14-field form to talk to a writer.** *(US-01)*
2. **As Lila (head writer), I want a single inbox that triages incoming voice-intake emails by ICP fit (stage / audience size / time-deficit / decision-maker / two-POV check), so that I can run the intake call confidently and close the cohort cleanly.** *(US-02)*
3. **As Maya (paying retainer), I want to pay $1,490 / $2,990 / $4,990 via NOWPayments USDT/USDC hosted invoice, so that the contract activates without card-merchant onboarding and stays under most CFO expense thresholds.** *(US-03)*
4. **As Maya, I want a 12-page voice profile in my Telegram within 4 days of payment (8 voice tics, 12 owned themes, 5 anti-themes, sample 280-char post, 90-sec podcast bio, week-1 editorial calendar), so that I can recognise myself in the writing before the first post ships.** *(US-04)*
5. **As Maya, I want each draft to land in my Telegram channel by 6:08 am Tuesday/Thursday/Friday with one-tap "ship" or "edit" buttons, so that I can review on my phone over coffee in under 90 seconds.** *(US-05)*
6. **As Lila, I want a drafts queue that shows draft → senior-writer review → head-writer review → sign-off, so that nothing ships without two pairs of eyes.** *(US-06)*
7. **As Maya, I want a comment plan I can scan once a week (50 target accounts; 15 hand-written comments queued for sign-off; average 9-min dwell time; no LLM filler), so that the engine runs at human pace under my name.** *(US-07)*
8. **As Maya, I want a DM book with three drafted DMs per week (lead-investor warm intros, target-account responses, follow-ups) where only I press send, so that the DM channel stays mine without me writing the drafts.** *(US-08)*
9. **As Maya (Operator+ tier), I want a CRM webhook that opens a new HubSpot/Pipedrive deal when a target-account DM contains intent keywords ({"meeting", "15 minutes", "compare notes", "discovery", "call"}), so that inbound LinkedIn-sourced pipeline becomes auditable to my CRO without me copy-pasting threads.** *(US-09)*
10. **As Diego (Director tier), I want a 24-hour head-writer SLA on questions and rewrites, so that a board-week post does not fall to a senior writer's calendar.** *(US-10)*
11. **As Maya, I want a one-page monthly accuracy report (followers, comment-engine relationships started, DMs sent, DMs that became meetings) in my Telegram on the last Friday, so that I can hand the report to my CEO without a dashboard tour.** *(US-11)*
12. **As Maya (cancelling), I want to cancel by emailing one line, get my voice profile + transcripts + editorial calendar + comment list + DM book handed back the same day, and have the in-flight month refunded if I haven't received my first post yet, so that the exit clause has teeth and my craft work stays mine.** *(US-12)*

Trace map — every endpoint in doc 12 §3 services US-01..US-12. Orphan endpoints are forbidden.

---

## 3. Main scenarios (happy paths)

### Scenario 1 — Maya finds Bylineship in the wild, books an intake call, signs the Operator retainer

**Trigger.** Tuesday 7:08 am Lisbon. Maya scrolls LinkedIn before her standup. A senior writer she follows (Bylineship-ghostwritten without her knowing) has posted on renewal-cycle time. The comment thread surfaces a substantive Bylineship-signed reply.

**Steps.**
1. Maya clicks the Bylineship profile, lands on `linkedin-b2b-organic.prin7r.com`. Reads the hero (manuscript-framed sample post). Notices the blinking olive cursor for 0.4s. *Frontend: `Hero`, `SamplePostFrame`, `ManuscriptCursor` on `apps/landing/app/page.tsx`.*
2. Scrolls to `#service` (six-numbered ledger). Reads the anti-manifesto ("We will not write hook bait"). Closes tab, opens her Notion. *(Discovery moment — no API call.)*
3. Two days later, returns via direct URL she emailed herself. Reads the FAQ top to bottom. Clicks `Book a voice call` (mailto). *Frontend: `FAQ`, `MailtoCTA`.*
4. Her email opens prefilled with `Voice intake call` subject. She edits it to `Voice intake — Maya R., VP Ops at <her company>`, types five sentences about why now, hits send. *No API call yet — email only.*
5. Lila's intake-triage inbox surfaces the email within 2 working hours. Lila replies with three intake-call options for the next 8 days. *Wave 3 backend: `IntakeTriageService` — see doc 12 §3.*
6. Day 5 (Thursday Lisbon): 30-min intake call. Lila runs the qualifying-criteria checklist (`05-audience-profile.md` §ICP) plus the two-POV check. Maya passes both. Cohort: 4 of 6 filled.
7. Day 6: Maya pays $2,990 Operator via NOWPayments hosted invoice (USDC). *Frontend: `PricingTier` → `POST /api/checkout/nowpayments`. Backend: NOWPayments hosted invoice page.*
8. NOWPayments IPN fires. *Backend: `POST /api/webhooks/nowpayments` (HMAC-SHA512 verified) activates the retainer. `[BYLINESHIP_NOWPAYMENTS_IPN]` audit log line written.*
9. Within 10 minutes of IPN, Lila gets a Telegram nudge. Voice intake (90 min) auto-scheduled for the following Wednesday 11 am Lisbon.

**Success criteria.** Intake email → reply <6 working hours; intake call → retainer 70%+ for warm referrals, 35% for cold inbound (per doc 07 funnel target); IPN → Lila Telegram nudge p95 <10 min.

**Frontend touch-points.** `Hero`, `SamplePostFrame`, `ServiceLedger`, `AntiManifesto`, `FAQ`, `MailtoCTA`, `PricingTier`.
**Backend touch-points (Wave 2 shipped).** `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`.
**Backend touch-points (Wave 3 deferred).** `IntakeTriageService`, `CohortGate`, `RetainerActivationService`, `TelegramNudge`.

### Scenario 2 — Voice intake → 12-page voice profile → first post ships

**Trigger.** Maya's retainer is active. Voice intake call scheduled for Wednesday 11 am Lisbon.

**Steps.**
1. **Wednesday — Voice intake call (90 min, recorded).** Lila joins. Covers six prompts (per doc 03 §Journey 2): five most common CEO conversations; two industry-dinner stories that landed; three board-meeting POVs; five LinkedIn posts she'd defend as "right way to write"; the single biggest career mistake; her last 50 Slack messages forwarded as text (scrubbed of names).
2. **Friday — voice profile lands in Maya's Telegram.** 12 pages: 8 voice tics, 12 owned themes, 5 anti-themes, sample 280-char post in her voice, 90-second podcast bio, week-1 editorial calendar. *Wave 3 backend: `VoiceProfileService.generate(intakeRecordingId)`. Hand-drafted by Lila + senior writer; the dashboard is the delivery surface, not the author.*
3. **Monday following — first editorial call (60 min).** Lila brings three story angles pulled from Maya's week. Maya pushes back on one ("private story"), sharpens a second, kills the third. They leave the call with two posts in draft and a 50-account comment plan.
4. **Tuesday 6:08 am — first post draft lands in Maya's Telegram.** *Wave 3 backend: `DraftQueue.publish(draftId, 'awaiting_principal_signoff')` → `TelegramOut.send(channelId, draftMarkdown)`.*
5. **Tuesday 6:32 am — Maya replies in Telegram.** "'embarrassed' should be 'a little embarrassed'." *Wave 3 backend: `TelegramIn` parses reply, opens `RevisionThread(draftId)`, notifies senior writer.*
6. **Tuesday 7:14 am — senior writer applies the wording change, re-posts to Telegram, Maya taps `Ship`.** Post auto-publishes to LinkedIn via the principal's session-token (Wave 3 backend: `LinkedInPublisher` — the principal authorises the session at retainer activation).
7. **End of day Tuesday.** 47 likes, 9 comments — three from Maya's CEO and two CFO friends. Her CEO Slacks her at 11 am: "*That post was good. Was that you?*" She types: "*Yes.*"

**Success criteria.** Voice profile ships within 4 calendar days of intake. First post ships within 8 calendar days of payment. Maya recognises herself in week-1 drafts (binary self-report on Friday review). No "viral" outcome (target: 30-90 likes, 5-15 comments — *not* 500+).

**Frontend touch-points (Wave 3).** `MyDrafts` (Telegram-mirror view), `RevisionThread`, `ShipButton`.
**Backend touch-points (Wave 3).** `VoiceProfileService`, `DraftQueue`, `TelegramOut`, `TelegramIn`, `RevisionService`, `LinkedInPublisher`.

### Scenario 3 — Steady-state week (the recurring loop)

**Trigger.** Maya is in month 2 of her Operator retainer.

**Steps.**
1. **Monday 9 am Lisbon — editorial call (60 min).** Lila + Maya, three story angles from Maya's week (the principal forwards Slack-message excerpts and Granola transcripts the night before). Two posts drafted by EOD. *Backend: `EditorialCallService.recordOutcome(callId, draftIds[])`.*
2. **Tuesday 7 am — Post #1 ships.** Telegram review → Maya `Ship` → LinkedIn publish. Comment-engine queue lands at 4 pm: 15 substantive comments cued for tomorrow. *Backend: `CommentPlan.queue(weekId, principalId)`.*
3. **Wednesday — senior writer works the comment plan, signed off in Maya's name.** Average dwell time: 9 minutes. *Backend: `CommentRun.execute(commentPlanId, signoffMode='principal-name')`.*
4. **Thursday — Post #2 ships.** DM book updated with three new threads.
5. **Friday — Post #3 ships.** Maya sends 4 DMs the writers drafted (only Maya presses send). One reply from a Series-C CIO who saw her Tuesday post: "15 minutes next week to compare notes on renewal cadence."
6. **Friday 4 pm — CRM webhook fires.** The reply contains `meeting`, `15 minutes`, `compare notes` — three of the five intent triggers. *Backend: `IntentDetector(thread)` returns `intent=meeting`. `CRMWebhook.fire(maya.crmConfig, payload)` writes to HubSpot.*
7. **HubSpot side.** New contact (name + LinkedIn URL + role + company). New deal in `Inbound · LinkedIn` pipeline, $0 expected, source=LinkedIn DM. Note attached: LinkedIn permalink + last 3 messages.
8. **Friday 5 pm — Maya opens HubSpot.** Deal is there. She moves it to `Discovery booked` and replies to the CIO from her phone with three time options.

**Success criteria.** Three posts/week. Comment dwell time ≥9 min average. CRM webhook fires within 60s of intent detection. Zero false-positive intent triggers across the cohort per month (Lila reviews the false-positive ledger weekly).

### Scenario 4 — Diego (Director tier) writes during a board week

**Trigger.** Diego has a Tuesday board meeting. He cancels Monday's editorial call.

**Steps.**
1. **Sunday — Diego Telegrams Lila.** "*Board Tue, need a post Wed about the renewal-pricing experiment. 24h SLA?*"
2. **Monday — Lila pulls the experiment story from Diego's last 30 days of Granola transcripts (auto-archived in his retainer dashboard).** Drafts the post herself (24h head-writer SLA — Director tier feature). *Backend: `HeadWriterDraft.create(principalId, briefText, slaDeadlineISO)`.*
3. **Monday EOD — draft in Diego's Telegram.** Diego replies "*good — ship Wednesday morning.*"
4. **Wednesday 6:08 am — post ships.**
5. **Wednesday afternoon — Diego is in his board meeting; the post does its work without him.**

**Success criteria.** 24h SLA met (Director tier). The post sounded like Diego, not like Lila. Board-week churn averted.

### Scenario 5 — Jordan (Studio tier) signs four-voice retainer

**Trigger.** Maya's retainer is in month 5. Maya's CRO Jordan saw three of Maya's posts and Slacks her: "*Who writes for you? My CEO + two VPs need this.*" Maya forwards Lila.

**Steps.**
1. Lila replies to Jordan within 6 working hours with a 30-min Studio intake call slot.
2. **Studio intake (Lila + Jordan + Jordan's 4 principals on the call).** Lila runs the qualifying checklist for each principal. All four pass. Lila scopes Studio at $11k/mo (custom; not on the public landing).
3. Jordan pays via wire (no NOWPayments — custom-invoice flow); IPN does not apply. *Backend: `CustomInvoice.activate(retainerId, paidAt, paymentMethod='wire')`.*
4. Four voice intakes scheduled across the next 14 days. Lila + 2 senior writers split the workload. One editorial call covers all four voices weekly (45 min).
5. Cohort cap accounting: Studio counts as 2 retainer slots, not 4 (Lila's calendar is the real cap, not the dashboard).

**Success criteria.** Studio onboarding ≤21 days from intake to all-four-voices first-post-shipped. Editorial call covers all four voices within 45 min weekly. Jordan's CFO sees one line item ($11k), not four.

### Scenario 6 — Cancellation + craft hand-back (the exit clause has teeth)

**Trigger.** Maya, month 13. Her CEO promotes her to COO; she's reorganising her week and cutting non-essential commitments.

**Steps.**
1. Maya emails `writers@…` one line: "*Cancelling end of month. Thanks for everything.*"
2. **Same day — Lila replies.** No exit interview, no save attempt. Confirms cancellation. *Backend: `CancellationService.queue(retainerId, lastBilledMonthEnd)`.*
3. **Within 24 hours — craft hand-back package lands in Maya's email.** Voice profile (PDF), all editorial-call transcripts (markdown bundle), full editorial calendar (CSV), comment list with target-account history (CSV), DM book (markdown). *Backend: `CraftHandoffPackage.assemble(retainerId, format='zip')` → S3-signed URL with 7-day TTL.*
4. **First of the following month — NOWPayments next-cycle invoice is NOT issued.** Backend confirms `nextInvoice=null` for cancelled retainers.
5. **30 days post-cancellation — Lila Telegrams Maya once.** "*If you ever come back, you don't re-do the voice intake. Three days notice and we re-open.*"

**Success criteria.** Cancellation processed same day. Hand-back package <24h. No "win-back" sequence. No drip emails. Maya keeps her craft work forever.

---

## 4. Edge case scenarios

### EC-1 — IPN replay (NOWPayments retransmits a webhook)

`RetainerActivationService` is idempotent on `(orderId, paymentStatus)`. Second IPN with the same payload is logged and 200'd, no duplicate activation. Same idempotency pattern as `landing-pages-on-demand` doc 12 §EC-1.

### EC-2 — Principal misses the Monday editorial call

Lila's `EditorialCallService` flags `missed=true`. Drafts that week are pulled from the principal's last 14 days of Slack/Granola archive (auto-ingested if the principal opted in). If two consecutive editorial calls are missed, the auto-renewal is paused at month-end (per doc 07 §pricing — "*we don't auto-renew if you missed the previous month's editorial call.*"). Lila sends a single Telegram check-in.

### EC-3 — Comment-plan target account stops engaging back

After 21 days of no reciprocity from a target account, `CommentPlan.flagStale(accountId)` surfaces it for the next Monday call. Maya can replace the account or the senior writer drops it from the queue.

### EC-4 — DM intent false-positive (CRM webhook fires for a non-intent reply)

A target-account DM containing "*15 minutes left in my day, anyway —*" trips the `15 minutes` keyword. Lila's weekly false-positive ledger surfaces this; she retunes the regex (or replaces with a small classifier — Wave 4 deferred). Maya can also tap `Not intent` in HubSpot and the deal auto-closes-lost; that closed-lost row is fed back to the classifier weekly.

### EC-5 — NOWPayments rate-limits during a cohort intake spike

`POST /api/checkout/nowpayments` returns 429. The `Plisio` backup (stubbed in `.env.example`) is brought online by Lila within 2 hours (per doc 09 §Risks). Customers waiting for invoice get a one-line email: "*invoice in 2 hours; cohort still open.*" No customer churns over a 2-hour delay.

### EC-6 — Principal's voice mutates mid-retainer (e.g. founder transitions to public-company CEO)

After month 6 of any retainer, Lila offers a 30-min "voice refresh" call. If the principal's role/scope changed materially, a partial re-intake updates the voice profile. The dashboard surfaces a `voice_profile.lastReviewedAt` field; Lila reviews quarterly.

### EC-7 — A Bylineship-ghostwritten post performs unexpectedly viral

A Maya post hits 18,000 likes (vs. typical 60-90). Lila reviews the post and the comment thread for "we got pulled into hook-bait" patterns; if found, the next post's tone deliberately steps back. Virality is not the promise; brand-decay risk is real.

### EC-8 — Compliance-flag content from a regulated-industry retainer

A fintech retainer's post mentions a specific regulator action. The pre-publish guard (`ComplianceFilter.scan(draft)`) flags it. Senior writer routes to the principal's in-house counsel for sign-off. If counsel says no, the post is killed and the editorial calendar pulls a replacement angle from the bench.

### EC-9 — Engagement-pod participation discovered on existing retainer

Lila's monthly accuracy report includes a `cohort_health.podDetection` flag — looks for clustered comments-from-known-pod-accounts within a 6-hour window on the principal's posts. If detected, Lila has a one-call conversation with the principal: leave the pod or we end the retainer at month-end. Per doc 05 §Anti-personas, this is non-negotiable.

### EC-10 — Telegram outage during a Tuesday post window

Telegram down >30 min Tuesday morning. `TelegramOut.send` retries to 3x, then `EmailFallback.send(principalEmail, draftMarkdown, signoffLink)` — a one-click signoff link with HMAC token. Post still ships within a 90-minute window. The principal's preferred channel returns post-outage.

---

## 5. Anti-scenarios

### AS-1 — No engagement pods, ever

Implementation MUST NOT include any feature that runs comments-from-our-other-retainers on a principal's posts. Cross-retainer comment activity is prohibited at the data layer (`CommentPlan` cannot reference another retainer's principal as a commenter).

### AS-2 — No "viral hook" templates in the dashboard

Implementation MUST NOT ship a UI surface that suggests "hooks" or "engagement-bait openers" to writers. The brand frame (per doc 08 §Tone) explicitly forbids it.

### AS-3 — No LLM-generated comments

Comments are 100% human-drafted. Implementation MUST NOT add a "draft this comment with AI" button to the comment-plan workflow. Writers may use AI to *summarise* the target-account post for context, but never to draft the comment itself.

### AS-4 — No follower-count optimisation dashboard

The monthly accuracy report (`MonthlyReportService`) shows four numbers: followers, comment-engine relationships started, DMs sent, DMs that became meetings. It does NOT show: engagement rate, viral-coefficient, follower-growth-velocity. Per doc 05 §Anti-personas, customers who judge us on virality will fail us — we don't show them the metric to judge.

### AS-5 — No multi-tenant SaaS pivot ("self-serve LinkedIn ghostwriter")

Bylineship is a literary agency. The Wave 3 dashboard is for our 6-12-18 retainers and our 6-writer team — not a free-tier signup flow, not a "Lite" plan, not an open-marketplace of writers. The cohort cap is structural; the technology cannot route around it.

### AS-6 — No referral fees / no kickback codes / no affiliate panel

Per doc 06 §Channel 1, referral fees damage the referral signal. Implementation MUST NOT include a `RetainerCredit` table, an "invite a friend" page, or a referral-link generator. Referrals happen by the principal forwarding a one-line intro Lila sends — that's it.

### AS-7 — No public case studies with logos

Implementation MUST NOT include a `/case-studies` page. The proof is the principals' own posts on LinkedIn (audience-discoverable; not aggregated). Per doc 08 §Marketing assets we won't ship.

### AS-8 — No "AI-powered" anything in product copy

The landing has zero "AI" mentions. The dashboard has zero "AI" mentions. We use AI internally (drafting outlines from transcripts, scoring DM intent) but the brand-facing copy never mentions it. Per doc 07 §Objection-handling — "we use AI to draft outlines and pull from transcripts. Final drafts are written by a human."

---

## 6. Cross-references

- §2 stories US-01..US-12 → doc 12 §3 endpoints + §2 entities.
- §3 scenarios → doc 12 §1 architecture services + doc 13 phase Definitions of Done.
- §4 edge cases → doc 12 §7 (security threats) and doc 13 phase 4.
- §5 anti-scenarios → doc 12 §10 non-goals.
- Persona definitions → `05-audience-profile.md`.
- Pricing-tier features → `07-sales-strategy.md` §Pricing.
- Channel-mix assumptions → `06-sales-channels.md`.
- 90-day cohort cadence → `09-go-to-market.md`.

Every endpoint, worker, table, and phase in docs 12-13 must trace to a story or scenario above. Orphan implementation is forbidden.
