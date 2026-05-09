/**
 * Bylineship Wave 3 — IntakeTriageService.
 *
 * Parses inbound intake emails and scores ICP fit using heuristics
 * with optional Anthropic-Sonnet-4.6 fallback for ambiguous cases.
 *
 * Per docs/13 Phase 1 task 1 and docs/11 US-02:
 *   - 5 ICP qualifiers from docs/05 (decision_maker_role, b2b_company,
 *     time_deficit, linkedin_presence, has_pov)
 *   - Score ≥3 passes to triage card for Lila's review
 *   - Anthropic fallback for cases scoring 2-3 (ambiguous)
 *   - Posts triage card to #intake-triage (Phase 1 stub — Phase 2 adds Slack webhook)
 *
 * Anti-scenarios (docs/11 §5):
 *   - AS-5: Not a self-serve signup — this is a human-triage gate
 *   - AS-8: No "AI-powered" copy — Anthropic is internal only
 */

import type { InboundEmail } from "@/lib/email";
import { scoreIcpFit } from "@/lib/email";

export type TriageResult = {
  email: InboundEmail;
  icpScore: number;
  icpFlags: string[];
  triageDecision: "fast_track" | "review" | "archive";
  anthropicAnalysis?: string;
  createdAt: string;
};

/**
 * Run the full intake triage pipeline on an inbound email.
 *
 * Phase 1: heuristic scoring + triage decision.
 * Phase 2: Anthropic-Sonnet-4.6 analysis for ambiguous cases.
 * Phase 2: Slack webhook to #intake-triage.
 */
export async function triageIntakeEmail(
  email: InboundEmail
): Promise<TriageResult> {
  const icp = scoreIcpFit(email);

  // Triage decision matrix (docs/07 §Intake):
  //   score≥4 → fast_track (Lila replies within 2h)
  //   score=3  → review (Lila reads full email, replies within 6h)
  //   score≤2  → archive (no reply unless Lila overrides)
  let triageDecision: TriageResult["triageDecision"];
  if (icp.score >= 4) {
    triageDecision = "fast_track";
  } else if (icp.score >= 3) {
    triageDecision = "review";
  } else {
    triageDecision = "archive";
  }

  // Phase 2: Anthropic-Sonnet-4.6 analysis for ambiguous cases (score 2-3)
  let anthropicAnalysis: string | undefined;
  if (icp.score >= 2 && icp.score <= 3 && process.env.ANTHROPIC_API_KEY) {
    anthropicAnalysis = await analyzeWithAnthropic(email);
  }

  const result: TriageResult = {
    email,
    icpScore: icp.score,
    icpFlags: icp.flags,
    triageDecision,
    anthropicAnalysis,
    createdAt: new Date().toISOString()
  };

  // Audit log
  console.log(
    JSON.stringify({
      ts: result.createdAt,
      level: "info",
      event: "intake_triage_complete",
      from: email.from,
      messageId: email.messageId,
      icpScore: icp.score,
      triageDecision
    })
  );

  return result;
}

/**
 * Analyze an intake email with Anthropic-Sonnet-4.6 for deeper ICP signals.
 * Phase 2: real API call. Phase 1: stub analysis.
 */
async function analyzeWithAnthropic(email: InboundEmail): Promise<string> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return "Anthropic analysis unavailable — API key not configured.";
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system:
          "You are an intake triage assistant for Bylineship, a literary agency for B2B LinkedIn. " +
          "Analyze the inbound email and output a JSON object with: " +
          "{ companyMatch: boolean, roleMatch: boolean, timeDeficit: boolean, pointOfView: boolean, " +
          "recommendation: 'accept'|'review'|'decline', note: string }. " +
          "Be candid — we cap at 6 retainers per cohort and would rather turn someone away than accept a bad fit.",
        messages: [
          {
            role: "user",
            content: `Subject: ${email.subject}\n\nBody: ${email.bodyText}`
          }
        ]
      })
    });

    const json = (await response.json()) as Record<string, unknown>;
    const content = (json.content as Array<Record<string, unknown>>)?.[0];
    const text = (content?.text as string) || "";
    return text || "Anthropic returned empty analysis.";
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "anthropic_analysis_failed",
        message: (err as Error).message
      })
    );
    return `Anthropic analysis failed: ${(err as Error).message}`;
  }
}

/**
 * Anti-persona check: reject known bad-fit patterns before ICP scoring.
 * Returns null if the email passes the anti-persona filter,
 * or a rejection reason string if it fails.
 */
export function checkAntiPersonas(email: InboundEmail): string | null {
  const body = `${email.subject} ${email.bodyText}`.toLowerCase();

  // Solopreneur / pre-PMF check
  if (/\b(solopreneur|freelancer|i run a small|one-person|just me)\b/i.test(body)) {
    return "anti_persona:solopreneur";
  }

  // Influencer / viral hook requests
  if (/\b(viral|hook bait|engagement pod|follower growth|100k followers)\b/i.test(body)) {
    return "anti_persona:influencer";
  }

  // D2C / consumer brand check
  if (/\b(d2c|consumer brand|ecommerce store|shopify)\b/i.test(body)) {
    return "anti_persona:d2c";
  }

  // "Make me go viral"
  if (/\b(make me viral|blow up|trending|viral post)\b/i.test(body)) {
    return "anti_persona:viral_request";
  }

  return null; // passes filter
}
