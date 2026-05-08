# 03 — User journeys

> Three journeys covering discovery, first value, and the recurring-use loop. Underline is high-touch; every journey assumes a human reads at least one email and joins at least one call.

## Journey 1 — Discovery → first call (a Maya-shaped operations VP)

**Entry** — Maya scrolls LinkedIn at 7:08 am on a Tuesday. A senior writer she follows (Underline-ghostwritten without her knowing it) has posted a thoughtful piece on renewal-cycle time. The comment thread features substantive responses — including one from "Underline" signed by the head writer.

**Step 1 (zero-cost)** — She clicks the Underline profile, lands on `linkedin-b2b-organic.prin7r.com`. The hero shows a sample ghostwritten post that reads exactly like a Stratechery email — first sentence is a CFO conversation, not a hook. The blinking olive cursor at the end of the last line catches her eye for 0.4s.

**Step 2 (low friction)** — She scrolls to the service ledger (`#service`). She reads "We will not write hook bait" in the anti-manifesto. She closes the tab and opens her Notion to look at her calendar.

**Step 3 (return)** — Two days later, she comes back via a direct URL she emailed herself. She reads the FAQ ("Will my voice actually sound like me?") top to bottom. She clicks `Book a voice call` (mailto). Her email opens prefilled with `Voice intake call`.

**Step 4 (commit)** — She edits the subject line to "*Voice intake — Maya R., VP Ops at <her company>*", types five sentences about why now, and sends. She gets a same-day reply (within 4 hours during EU work hours) from the head writer with three intake-call options for the next 8 days.

**Pain points solved** — She didn't have to fill out a 14-field intake form. She didn't have to "book a call" through Calendly that asked her industry, ARR, and HubSpot ID. She wrote five sentences to a person.

**Failure modes prevented** — No retargeting pixel chases her around LinkedIn. No drip-email sequence simulates personal interest. No "limited spots, claim yours" pressure copy.

## Journey 2 — Onboarding → first ghostwritten post live (week one)

**Day 0 (Monday)** — Maya pays via NOWPayments hosted invoice ($2,990 in USDC). Within 10 minutes of NOWPayments confirming, the IPN webhook fires and the head writer gets a Telegram nudge. A 90-minute Voice intake call is scheduled for Wednesday 11 am Lisbon time.

**Day 2 (Wednesday — Voice intake)** — The head writer joins the call. The transcript is recorded. They cover:
1. The five most common conversations Maya has with her CEO.
2. Two stories she's told at industry dinners that landed.
3. Three POVs she'd defend in a board meeting.
4. The five LinkedIn posts (from anyone) she'd defend as "this is the right way to write."
5. The single biggest mistake of her career — and what she learned.
6. Her last fifty Slack messages (forwarded as text, scrubbed of names).

**Day 4 (Friday — voice profile)** — A 12-page voice profile lands in her Telegram. It includes: 8 voice tics ("She uses 'finally' when admitting embarrassment"), 12 themes she owns, 5 anti-themes (topics she shouldn't write about), a sample 280-character post in her voice, a 90-second sample for a podcast bio, and a one-page editorial calendar for week one.

**Day 7 (Monday — first editorial call)** — 60 minutes. The head writer brings three story angles pulled from Maya's week. Maya pushes back on one ("that's actually a private story"), sharpens a second, kills the third. They leave the call with two posts in draft and a comment plan against the first 50 target accounts.

**Day 8 (Tuesday — first post live)** — Draft lands in Maya's Telegram channel at 6:08 am. She reviews on her phone over coffee, suggests one wording change ("'embarrassed' should be 'a little embarrassed'"). It ships at 7:14 am Lisbon time = 1:14 am Pacific. By the end of the day: 47 likes, 9 comments — three of them from her CEO and two CFO friends.

**First-value moment** — Her CEO Slacks her at 11 am: *"That post was good. Was that you?"* She types: "Yes."

**Failure modes prevented** — The post wasn't "viral" (87 likes is fine for week one). The post sounded like her. Nobody asked "who wrote this for you?"

## Journey 3 — Recurring use → DM that becomes a discovery call (week six)

**Steady state (Mon-Fri)** —
- **Monday** — 60-min editorial call. Three story angles pulled from her week. Two posts drafted by end-of-day.
- **Tuesday** — Post #1 ships at 7 am. Comment-engine queue lands at 4 pm — 15 substantive comments cued for tomorrow.
- **Wednesday** — Senior writer works the comment plan, signed off in her name. Average dwell time on a comment: 9 minutes.
- **Thursday** — Post #2 ships. DM book updated.
- **Friday** — Post #3 ships. Maya sends 4 DMs the writers drafted (only Maya presses send). A reply from a Series-C CIO who saw her Tuesday post asks for "15 minutes next week to compare notes on renewal cadence."

**The webhook fires** — The CIO's reply contains `>= 1 of {"meeting", "15 minutes", "compare notes", "discovery", "call"}` — the threshold for "intent". The Underline DM router writes a webhook to Maya's HubSpot:
- New contact: name + LinkedIn URL + role + company.
- New deal in `Inbound · LinkedIn` pipeline, $0 expected, source = LinkedIn DM.
- Note attached: the LinkedIn permalink + the last 3 messages in the thread.

**Maya's reaction** — At 5 pm Friday she opens HubSpot. The deal is there. She moves it to "Discovery booked" and replies to the CIO from her phone with three time options.

**End-of-month report (last Friday)** — One page lands in her Telegram. Four numbers, no charts:
- Followers: 1,420 → 1,847 (+30%).
- Comment-engine relationships started: 41 (target accounts who replied substantively).
- DMs sent (drafted by Underline, signed off by Maya): 16.
- DMs that became a meeting: 3.

**Recurring loop** — She doesn't think about LinkedIn between Mondays. She presses send on Friday DMs. She reads the monthly report on the last Friday. The retainer auto-renews; she stays for thirteen months on average.

**Failure modes prevented** — She isn't doom-scrolling LinkedIn. She isn't writing posts at 11 pm on a Sunday. Her CEO doesn't have to remind her again. The cadence carries the discipline.
