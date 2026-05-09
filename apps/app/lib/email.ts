/**
 * Bylineship Wave 3 — email service (Postmark / SES).
 *
 * Handles:
 *   - Inbound intake emails (writers@linkedin-b2b-organic.prin7r.com)
 *     → POST /api/intake/email-ingest
 *   - Outbound transactional (magic link, email fallback, craft hand-back)
 *
 * Per doc 13 Phase 0 DoD: inbound test email must land in #intake-triage.
 */

export type InboundEmail = {
  from: string;
  subject: string;
  bodyText: string;
  messageId: string;
  timestamp: string;
};

/**
 * Parse an incoming email (SES/Postmark webhook format).
 * Extracts principal name, company, role heuristics from the body.
 */
export function parseIntakeEmail(raw: Record<string, unknown>): InboundEmail {
  return {
    from: String(raw.From || raw.from || ""),
    subject: String(raw.Subject || raw.subject || ""),
    bodyText: String(raw.TextBody || raw.bodyText || raw.body || ""),
    messageId: String(raw.MessageID || raw.messageId || ""),
    timestamp: String(raw.Date || raw.timestamp || new Date().toISOString())
  };
}

/**
 * Score an intake email against the 5 ICP qualifiers.
 * Phase 0: heuristic scoring. Phase 1: Anthropic-Sonnet-4.6 fallback for
 * ambiguous cases.
 *
 * ICP qualifiers from doc 05:
 *   1. B2B SaaS company, $10-40M ARR (or $3-15M for founders)
 *   2. Decision-maker role (VP+ or Founder)
 *   3. 1,200-12,000 LinkedIn followers, lapsed posting
 *   4. Time-deficit admitted in email
 *   5. Two-POV check: has a defensible point of view
 */
export function scoreIcpFit(email: InboundEmail): {
  score: number;
  maxScore: number;
  flags: string[];
} {
  const body = `${email.subject} ${email.bodyText}`.toLowerCase();
  const flags: string[] = [];

  // Heuristic: role keywords
  const roleKeywords = [
    "vp ", "svp ", "evp ", "cfo", "cro", "coo", "ceo", "founder",
    "president", "director", "head of", "chief"
  ];
  if (roleKeywords.some((kw) => body.includes(kw))) {
    flags.push("decision_maker_role");
  }

  // Heuristic: company indicators
  const companyIndicators = ["saas", "b2b", "enterprise", "series a", "series b", "arr"];
  if (companyIndicators.some((kw) => body.includes(kw))) {
    flags.push("b2b_company");
  }

  // Heuristic: time-deficit signals
  const timeDeficitSignals = [
    "no time", "don't have time", "cannot find the time",
    "too busy", "six hours", "hours a week", "don't have the bandwidth"
  ];
  if (timeDeficitSignals.some((kw) => body.includes(kw))) {
    flags.push("time_deficit");
  }

  // Heuristic: LinkedIn presence mentioned
  if (body.includes("linkedin") || body.includes("followers")) {
    flags.push("linkedin_presence");
  }

  // Heuristic: POV signals (mentions specific ideas, stories, or opinions)
  const povSignals = [
    "point of view", "perspective", "opinion", "i believe",
    "my take", "i think", "i noticed", "i learned"
  ];
  if (povSignals.some((kw) => body.includes(kw))) {
    flags.push("has_pov");
  }

  return {
    score: flags.length,
    maxScore: 5,
    flags
  };
}
