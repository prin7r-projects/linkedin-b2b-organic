import Link from "next/link";
import { ButtonAnchor } from "@/app/components/ui/button";
import { PricingCta } from "@/app/pricing-cta";

/**
 * [UNDERLINE_LANDING] Single-page literary-agency landing for Underline.
 *
 * Sections:
 *   #masthead → #hero → #service → #process → #anti → #pricing
 *   → #faq → #footer
 *
 * Copy is sourced from /docs/08-marketing-strategy.md and /docs/07-sales-strategy.md.
 * Visual tokens are sourced from /DESIGN.md sections 4-6.
 * NOWPayments wiring lives in /apps/landing/lib/nowpayments.ts and the two
 * API routes under /api/checkout and /api/webhooks.
 */

export default function Page() {
  return (
    <main className="bg-bone text-ink">
      <Masthead />
      <Hero />
      <Service />
      <Process />
      <AntiManifesto />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Masthead                                                                   */
/* -------------------------------------------------------------------------- */

function Masthead() {
  return (
    <header
      id="masthead"
      className="border-b border-ink/10 bg-bone sticky top-0 z-30 shadow-masthead"
    >
      <div className="mx-auto max-w-prose px-6 md:px-10 py-4 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7" aria-label="primary">
          <a href="#service" className="marginalia hover:text-ink transition-colors">The work</a>
          <a href="#process" className="marginalia hover:text-ink transition-colors">The week</a>
          <a href="#pricing" className="marginalia hover:text-ink transition-colors">Retainer</a>
          <a href="#faq" className="marginalia hover:text-ink transition-colors">FAQ</a>
          <ButtonAnchor href="#pricing" className="ml-2">Take a retainer →</ButtonAnchor>
        </nav>
        <div className="md:hidden">
          <ButtonAnchor href="#pricing" size="sm">Retainer →</ButtonAnchor>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <a href="#hero" className="flex items-center gap-3" aria-label="Underline — home">
      <span aria-hidden="true" className="inline-block">
        <svg width="34" height="34" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="64" height="64" rx="2" fill="#0B1A2A" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="EB Garamond, Georgia, serif"
            fontWeight="800"
            fontSize="36"
            fill="#FBF7EE"
          >
            U
          </text>
          <rect x="14" y="49" width="36" height="2" fill="#5B6B2F" />
        </svg>
      </span>
      <span className="font-display text-[20px] font-semibold tracking-tightest text-ink">
        Underline<span className="text-olive">.</span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero — a real-looking ghostwritten LinkedIn post in the brand frame        */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="hero" className="grain section">
      <div className="mx-auto max-w-prose px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-24">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
          {/* Left: editorial intro */}
          <div className="md:col-span-5">
            <p className="marginalia">A literary agency for B2B LinkedIn · est. 2026</p>
            <span className="eyebrow-rule" aria-hidden="true" />
            <h1 className="font-display font-semibold text-[56px] md:text-[88px] lg:text-[112px] leading-[0.95] tracking-tightest text-ink">
              You should
              <br />
              <span className="italic font-normal text-graphite">be</span> writing.
              <br />
              We&rsquo;ll do it.
            </h1>
            <p className="mt-8 max-w-md font-display text-[22px] md:text-[24px] text-graphite leading-snug">
              Three ghostwritten posts a week, in your voice. An editorial comment plan on
              fifty target accounts. A DM book that lands meetings. No engagement pods,
              no bots, no clickbait hooks.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 items-center">
              <ButtonAnchor href="#pricing" size="lg" aria-label="See retainer tiers and pricing">
                Take a retainer →
              </ButtonAnchor>
              <ButtonAnchor
                href="mailto:writers@linkedin-b2b-organic.prin7r.com?subject=Voice%20intake%20call"
                size="lg"
                variant="ghost"
                aria-label="Book a 30-minute voice intake call"
              >
                Book a voice call
              </ButtonAnchor>
            </div>
            <p className="mt-7 marginalia max-w-xs">
              Six client retainers per cohort. We close intake the first Monday of every month.
            </p>
          </div>

          {/* Right: a sample post in the manuscript frame */}
          <div className="md:col-span-7">
            <SamplePost />
          </div>
        </div>
      </div>
    </section>
  );
}

function SamplePost() {
  return (
    <figure
      className="manuscript p-7 md:p-10 max-w-column md:ml-auto"
      aria-label="A sample ghostwritten LinkedIn post drafted by Underline for an operations VP at a B2B SaaS company"
    >
      <header className="flex items-start gap-3 pb-4 border-b border-ink/10">
        <div
          aria-hidden="true"
          className="h-12 w-12 shrink-0 bg-ink-2 text-manuscript font-display font-semibold text-[20px] flex items-center justify-center"
        >
          MR
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[15px] font-semibold text-ink leading-tight">Maya Rao</p>
          <p className="font-sans text-[13px] text-graphite leading-tight mt-0.5">
            VP, Operations · A 60-person B2B SaaS company
          </p>
          <p className="marginalia mt-2">Tuesday · 7:14 am · 1,420 followers</p>
        </div>
      </header>

      <div className="pt-5 pb-4 font-sans text-[15.5px] leading-[1.65] text-graphite space-y-4">
        <p>
          Last week our CFO asked me how we&rsquo;d cut renewal-cycle time without hiring.
          I gave her the wrong answer.
        </p>
        <p>
          I said: better tooling. We&rsquo;d sized a $34k/year renewals platform; the demos
          had been good; the data flows were tidy.
        </p>
        <p>
          What I didn&rsquo;t say is that our renewals were slow because nobody on my team
          knew which customer was up for renewal until thirty days out. The data was in
          Salesforce. The dashboard was beautiful. Nobody opened it.
        </p>
        <p>
          We didn&rsquo;t need a tool. We needed a Friday morning ritual: one CSM reads the
          renewal queue out loud, the team picks who calls whom, calendars get blocked.
          Twenty-five minutes. No software.
        </p>
        <p>
          Three weeks in, our cycle is down 19 days. The renewals platform is back in the
          drawer. The CFO is happy. I am, finally, a little embarrassed.
        </p>
        <p className="text-ink">
          The dashboard you stare at is not the system you run.
          <span className="cursor-bar" aria-hidden="true" />
        </p>
      </div>

      <footer className="pt-4 border-t border-ink/10 flex items-center justify-between gap-4 flex-wrap">
        <p className="byline">
          <span className="dot" aria-hidden="true" />
          <span>Ghostwritten by Underline · signed off by Maya · Tuesday 6:48 am</span>
        </p>
        <p className="marginalia">drafted in 38 min · two revisions</p>
      </footer>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Service block — what you actually get                                      */
/* -------------------------------------------------------------------------- */

function Service() {
  type Item = { num: string; title: string; body: string };
  const items: Item[] = [
    {
      num: "01",
      title: "Three posts a week, in your voice.",
      body:
        "We start with a 90-minute Voice intake — recorded, transcribed, and turned into a 12-page voice profile. Then a writer drafts in your register, your sentence length, your tics. You sign off in a Telegram channel before anything ships. Average draft-to-publish: 38 minutes."
    },
    {
      num: "02",
      title: "An editorial comment plan, not a pod.",
      body:
        "A senior writer (not a VA) reads fifty target accounts every weekday and queues fifteen comments per week — substantive responses, contrasts, citations. You skim and approve. Result: your name on the right posts, written like you wrote it. We don't comment on people we wouldn't take a meeting with."
    },
    {
      num: "03",
      title: "A DM book that becomes a calendar.",
      body:
        "We maintain a living DM playbook for the four conversations that matter — pitch, intro, follow-up, post-meeting. You stay in control of the first send. We draft, you press the button. DMs that get a reply with intent flow through a webhook into HubSpot or Pipedrive as a lead, with the LinkedIn permalink stapled to the contact."
    },
    {
      num: "04",
      title: "A weekly editorial call.",
      body:
        "Sixty minutes on Mondays. We come with three story angles pulled from your week, you push back, we leave with a finished schedule and the posts in draft. The call doubles as your only newsletter recording — we transcribe and turn out a quarterly POV essay from it on the higher tiers."
    },
    {
      num: "05",
      title: "A monthly accuracy & health report.",
      body:
        "Last Friday of the month. One page. Reach, save rate, comment quality, DM-to-meeting conversion, the three best posts and why, the three thinnest and why. Numbered. No vanity dashboard. We tell you when to slow down before we tell you to speed up."
    },
    {
      num: "06",
      title: "A house style we'll never break for you.",
      body:
        "No engagement-pod buying. No bot comments. No \"agree?\" hooks, no founder-flexing, no fake humility. If you want LinkedIn-bro polish, we won't take the retainer. The audience we win for you is the audience that already respected you. We just make them see you, in writing, every week."
    }
  ];

  return (
    <section id="service" className="section bg-bone-2/40">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="What the retainer gets you"
          title="A writers' room with you in the chair."
          lede="Underline is a service business dressed as a literary agency. The product is a working studio — the cadence, the artifacts, the editor on the other end. The LLM is a tool we hold."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-w-4xl">
          {items.map((item) => (
            <article key={item.num} className="ledger" aria-label={`Service item ${item.num}`}>
              <div className="num">{item.num}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Process — a typical week                                                   */
/* -------------------------------------------------------------------------- */

function Process() {
  type Day = { day: string; label: string; body: string };
  const days: Day[] = [
    {
      day: "Mon",
      label: "Editorial",
      body:
        "60-min call. We bring three story angles pulled from your week. You push back, sharpen, kill. We leave with a finished schedule and the next three posts in draft."
    },
    {
      day: "Tue",
      label: "Draft I",
      body:
        "First post drafts in your Telegram channel by 6 am, marked-up with the angle and source. You sign off; we ship at 7 am. Comment-engine queue lands at 4 pm — fifteen comments lined up for tomorrow."
    },
    {
      day: "Wed",
      label: "Comment",
      body:
        "A senior writer works the comment plan, signed off in your name. We do it once, slowly, by hand. Average dwell time on a comment: nine minutes. Yes — nine minutes for a comment."
    },
    {
      day: "Thu",
      label: "Draft II",
      body:
        "Second post ships. DM book gets refreshed: who reached out, who needs a follow-up, which thread became a meeting. We draft the four DMs you'll send Friday morning."
    },
    {
      day: "Fri",
      label: "Send",
      body:
        "You press send on the DMs we drafted. The third post ships. Replies with intent flow into your CRM. The week's writing is done. The next week's brief is in your inbox by 6 pm."
    }
  ];

  return (
    <section id="process" className="section">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="The week"
          title="A typical Monday-to-Friday."
          lede="The retainer is a calendar, not a tool. We work the same way every week. You stay in your business; we stay in our writers' room."
        />
        <ol
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-ink/12 border border-ink/12"
          aria-label="A typical week of the Underline retainer"
        >
          {days.map((day, i) => (
            <li key={day.day} className="bg-bone p-6 flex flex-col gap-3 min-h-[260px]">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-bold text-[58px] leading-none tracking-tightest text-olive">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] tracking-marginalia uppercase text-smoke">
                  {day.day}
                </span>
              </div>
              <h3 className="font-display font-semibold text-[22px] tracking-tightest text-ink leading-tight">
                {day.label}
              </h3>
              <p className="text-[14.5px] text-graphite leading-snug">{day.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Anti-feature manifesto                                                     */
/* -------------------------------------------------------------------------- */

function AntiManifesto() {
  type Anti = { title: string; body: string };
  const antis: Anti[] = [
    {
      title: "We won't buy you engagement pods.",
      body:
        "Reciprocal-like rings make a feed that performs and a reputation that decays. We've seen the back-of-house numbers — pod-fueled accounts lose 18-22% of their organic reach within six months as the algorithm flags the pattern. We won't put your name on that."
    },
    {
      title: "We won't run bot comments.",
      body:
        "There's a market for AI comments at $0.04 each. We don't compete with it. The whole point of a comment is that someone read the post and thought about it. If we can automate the comment, the comment is worthless. So we don't."
    },
    {
      title: "We won't write hook bait.",
      body:
        "No \"I just did the thing nobody expected — here's what happened.\" No \"Unpopular opinion:\" pretending to be unpopular. No fake numbered lists pretending to be insight. Stratechery doesn't open with a hook. Your posts won't either."
    },
    {
      title: "We won't ghostwrite a thought you don't hold.",
      body:
        "Voice profiles get rejected when the Voice intake reveals a strategic thesis the founder isn't actually willing to defend in a board meeting. We send the deposit back. Twice in the last cohort."
    },
    {
      title: "We won't \"build a personal brand.\"",
      body:
        "We build a writing practice that converts the audience you already have. \"Personal brand\" is a frame that makes people perform. We make them write."
    },
    {
      title: "We won't take six retainers from one industry.",
      body:
        "Two operators in the same vertical get a heads-up; three is a no. We can't represent both sides of a category and protect your distinctive POV. The competing-operators clause is in every contract."
    }
  ];

  return (
    <section id="anti" className="section bg-ink text-bone">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <div className="max-w-3xl">
          <p className="marginalia text-bone-2/85">House style</p>
          <span className="block w-9 h-[1.5px] bg-olive-2 my-4" aria-hidden="true" />
          <h2 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.05] tracking-tightest text-bone">
            Six things we won&rsquo;t do.
          </h2>
          <p className="mt-5 text-[17px] md:text-[19px] text-bone-2 leading-snug max-w-2xl">
            Productized services drift. The drift is always toward what scales — engagement
            tricks, automation, manufactured controversy. Underline is staffed thin and priced
            high so we don&rsquo;t need to drift. Here is the list, signed by the head writer
            and printed in every contract.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {antis.map((a, i) => (
            <div
              key={a.title}
              className="bg-ink-2 border border-bone/12 p-6 flex flex-col gap-3"
            >
              <p className="font-mono text-[11px] tracking-marginalia uppercase text-bone-2/70">
                {String(i + 1).padStart(2, "0")} · No
              </p>
              <h3 className="font-display font-semibold text-[24px] tracking-tightest leading-tight text-bone">
                <span
                  style={{
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(156,62,31,.85)",
                    textDecorationThickness: "1.5px",
                    textUnderlineOffset: 2
                  }}
                >
                  {a.title}
                </span>
              </h3>
              <p className="text-[14.5px] text-bone-2/90 leading-snug">{a.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-2xl border-l-[3px] border-rust pl-5 font-display italic text-[20px] md:text-[22px] text-bone leading-snug">
          A literary agency that won&rsquo;t take an embarrassing client is the one whose name
          on a manuscript still means something.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

type Tier = {
  id: "founder" | "operator" | "director";
  name: string;
  monthly: number;
  blurb: string;
  features: string[];
  featured?: boolean;
};

function Pricing() {
  const tiers: Tier[] = [
    {
      id: "founder",
      name: "Founder",
      monthly: 1490,
      blurb: "For the founder who has been meaning to write since the seed round.",
      features: [
        "60-min weekly editorial call",
        "2 ghostwritten posts/week (8/month) — your voice, your sign-off",
        "Comment plan on 30 target accounts (10 comments/week)",
        "DM follow-up draft library — you press send",
        "Monthly accuracy & health report"
      ]
    },
    {
      id: "operator",
      name: "Operator",
      monthly: 2990,
      blurb: "Most retainers settle here. Two calls, three posts, fifty accounts.",
      features: [
        "Two 45-min editorial calls/week",
        "3 ghostwritten posts/week (12/month) in your voice",
        "Comment-engine on 50 target accounts (15 comments/week)",
        "Living DM book + weekly playbook for the four conversations that matter",
        "CRM webhook routing — DMs become HubSpot or Pipedrive leads"
      ],
      featured: true
    },
    {
      id: "director",
      name: "Director",
      monthly: 4990,
      blurb: "Daily editorial slot, a quarterly POV essay, a direct line to the head writer.",
      features: [
        "Daily 15-min editorial check-ins · Mon-Fri",
        "5 ghostwritten posts/week (20/month) plus a quarterly POV essay (1,500-2,000 words)",
        "Comment-engine on 100 target accounts",
        "DM book + sales-ops review of CRM-routed leads",
        "Direct line to the head writer · 24h response window"
      ]
    }
  ];

  return (
    <section id="pricing" className="section">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="Three retainers"
          title="Monthly. Cancel any month. We&rsquo;d rather you stay because the writing is good."
          lede="No setup fee — the first month is the test. Pay in USDT or USDC via NOWPayments at checkout. Annual prepay (two months free) is the only discount we offer."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <article
              key={tier.id}
              className={`tier ${tier.featured ? "featured" : ""}`}
              aria-label={`${tier.name} retainer`}
            >
              {tier.featured ? (
                <span className="inline-flex w-fit border border-olive bg-bone px-2.5 py-1 font-mono text-[10px] tracking-marginalia uppercase text-olive">
                  Most retainers settle here
                </span>
              ) : (
                <span className="inline-flex w-fit font-mono text-[10px] tracking-marginalia uppercase text-smoke">
                  Tier{" "}
                  {tier.id === "founder" ? "01" : tier.id === "operator" ? "02" : "03"}
                </span>
              )}
              <h3 className="tier-name">{tier.name}</h3>
              <p className="text-[14.5px] text-graphite leading-snug">{tier.blurb}</p>

              <div>
                <div className="tier-price">
                  ${tier.monthly.toLocaleString()}{" "}
                  <span className="font-sans font-normal text-[14px] uppercase tracking-marginalia text-smoke">
                    / month
                  </span>
                </div>
                <div className="tier-mo">
                  <span className="text-graphite">First month at checkout · cancel any month</span>
                </div>
              </div>

              <ul className="tier-features">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <PricingCta
                  plan={tier.id}
                  label={`Take ${tier.name} →`}
                  fullWidth
                  variant={tier.featured ? "default" : "default"}
                />
                <p className="mt-3 text-[12px] font-mono tracking-marginalia uppercase text-smoke">
                  Pay first month via NOWPayments · USDT / USDC
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl font-display italic text-[19px] md:text-[22px] text-ink border-l-[3px] border-olive pl-5">
          We close intake the first Monday of every month. Six retainers per cohort. If we&rsquo;re
          full, we&rsquo;ll wait-list you and tell you when the next slot opens — usually within
          eight weeks.
        </p>

        <div className="mt-12 manuscript p-7 max-w-2xl">
          <p className="marginalia">Agencies &amp; sales-led teams</p>
          <h3 className="mt-3 font-display font-semibold text-[22px] tracking-tightest text-ink">
            Two-team retainer · enquire by email.
          </h3>
          <p className="mt-2 text-[15px] text-graphite leading-snug">
            For sales-led B2B teams running 4-8 LinkedIn voices in parallel — a CEO, two VPs,
            a head of growth. We assemble a senior writer dedicated to your room and run all
            voices through one editorial call. Custom retainer, custom comment plan, custom
            CRM mapping. Quarterly review with your CRO.
          </p>
          <a
            className="inline-block mt-4 font-mono text-[12px] tracking-marginalia uppercase text-ink underline decoration-1 underline-offset-4 decoration-olive hover:text-olive"
            href="mailto:writers@linkedin-b2b-organic.prin7r.com?subject=Two-team%20retainer%20enquiry"
          >
            writers@linkedin-b2b-organic.prin7r.com →
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

function Faq() {
  const items: Array<{ q: string; a: string }> = [
    {
      q: "Will my voice actually sound like me?",
      a: "Yes — that's the whole work. We run a 90-minute Voice intake (recorded), pull your last fifty Slack messages and emails, transcribe two of your podcast or talk appearances, and turn the lot into a 12-page voice profile your writer reads before they touch a draft. Every post sits in a Telegram channel for sign-off. If after the first month you don't recognise yourself in the writing, we refund the month."
    },
    {
      q: "Why crypto checkout instead of a card?",
      a: "Most of our founders move money internationally and we work with a small intake on every continent. NOWPayments lets you pay in USDT or USDC the same way regardless of geography, with zero card-processing drag (3-5% adds up at four-figure retainers). If a wire or Wise is genuinely simpler for you, ask the head writer — we hand-wire payment for two or three retainers per cohort."
    },
    {
      q: "How is this different from a LinkedIn coach or a fractional CMO?",
      a: "A coach teaches you to write; we write. A fractional CMO designs your funnel; we operate the top of it. We are not strategy and not training. We are the writer's room and the comment desk. If you've already tried a coach and you still aren't posting, that's the gap Underline is built for."
    },
    {
      q: "What happens to my following if we stop?",
      a: "It belongs to you. We don't run the account, we don't hold the password, we don't manage the inbox. Every draft is sent to your Telegram first. Every comment is signed off in your name. If you cancel, you keep the voice profile and the voice-intake transcript so the next writer (or you) starts from where we left off."
    },
    {
      q: "How fast do I see results?",
      a: "Reach moves in week three. Comment-engine relationships move in week four to six. The first DM that becomes a discovery call usually lands in week five for an Operator retainer, week eight for Founder. We tell you the slow truth in the monthly accuracy report — including when the writing is good but your audience is wrong, and we should redirect."
    },
    {
      q: "Who actually writes the posts?",
      a: "Two senior writers (ex-tech-journalism, both based in Lisbon) handle drafting and editing. The head writer reviews every post before it goes to your Telegram for sign-off. We are six people; we take twelve to eighteen retainers at a time. There is no junior offshore desk."
    },
    {
      q: "I'm in finance / healthcare / a regulated space. Can you still write?",
      a: "Often, yes — about 30% of current retainers are in regulated spaces. We pre-clear topics with your compliance officer once at intake, then operate inside the cleared list. We don't write recommendations, we don't write specific numbers, we do write strategic POV. Two passes through your compliance review per quarter, included."
    }
  ];

  return (
    <section id="faq" className="section bg-bone-2/30">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader eyebrow="FAQ" title="Seven questions, answered straight." />
        <div className="mt-12 max-w-2xl">
          {items.map((item) => (
            <details key={item.q} className="faq">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer id="footer" className="bg-bone-2/50">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-14 md:py-16 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-6 flex flex-col gap-4">
          <Logo />
          <p className="max-w-md text-[14.5px] text-graphite leading-snug">
            Underline is a literary agency for B2B LinkedIn — three ghostwritten posts a week
            in your voice, an editorial comment plan on your target accounts, and a DM book
            that lands meetings. Six writers, six retainers per cohort. Built in 2026 by the
            prin7r-projects studio.
          </p>
        </div>
        <nav className="md:col-span-3 flex flex-col gap-3" aria-label="footer">
          <p className="marginalia">The desk</p>
          <a
            className="text-[14px] text-ink hover:text-olive transition-colors"
            href="mailto:writers@linkedin-b2b-organic.prin7r.com"
          >
            writers@linkedin-b2b-organic.prin7r.com
          </a>
          <a
            className="text-[14px] text-ink hover:text-olive transition-colors"
            href="mailto:agencies@linkedin-b2b-organic.prin7r.com"
          >
            agencies@linkedin-b2b-organic.prin7r.com
          </a>
        </nav>
        <nav className="md:col-span-3 flex flex-col gap-3" aria-label="resources">
          <p className="marginalia">Repo · docs</p>
          <Link
            className="text-[14px] text-ink hover:text-olive transition-colors"
            href="https://github.com/prin7r-projects/linkedin-b2b-organic"
          >
            github.com/prin7r-projects/linkedin-b2b-organic
          </Link>
          <Link
            className="text-[14px] text-ink hover:text-olive transition-colors"
            href="https://github.com/prin7r-projects/linkedin-b2b-organic/tree/main/docs"
          >
            10 strategy docs
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-prose px-6 md:px-10 pb-10 flex flex-col md:flex-row justify-between gap-3 border-t border-ink/12 pt-6">
        <p className="font-mono text-[11px] tracking-marginalia uppercase text-smoke">
          © 2026 prin7r-projects · MIT
        </p>
        <p className="font-mono text-[11px] tracking-marginalia uppercase text-smoke">
          A literary agency · written by hand
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Section header helper                                                      */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  lede
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="marginalia">{eyebrow}</p>
      <span className="eyebrow-rule" aria-hidden="true" />
      <h2 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.05] tracking-tightest text-ink">
        {title}
      </h2>
      {lede ? <p className="mt-5 text-[17px] md:text-[19px] text-graphite leading-snug">{lede}</p> : null}
    </div>
  );
}
