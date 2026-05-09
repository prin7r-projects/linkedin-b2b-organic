/**
 * Bylineship Wave 3 — intake email ingest endpoint.
 * POST /api/intake/email-ingest
 *
 * Receives inbound emails from Postmark/SES (HMAC-verified webhook),
 * parses and scores ICP fit, posts triage card to #intake-triage.
 *
 * Per docs/12 §3.4 (US-01, US-02) and docs/13 Phase 0 task 6.
 */

import { NextResponse } from "next/server";
import { parseIntakeEmail, scoreIcpFit } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Phase 0: HMAC verification stub (Postmark/SES not yet configured)
  // TODO Phase 1: verify inbound webhook HMAC before processing

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body was not valid JSON." },
      { status: 400 }
    );
  }

  const email = parseIntakeEmail(raw);
  const icpScore = scoreIcpFit(email);

  // Log the intake for audit
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "intake_email_received",
      from: email.from,
      subject: email.subject,
      messageId: email.messageId,
      icpScore: icpScore.score,
      icpFlags: icpScore.flags
    })
  );

  // Phase 1: post triage card to Lila's Slack #intake-triage
  // Phase 2: Anthropic-Sonnet-4.6 fallback for ambiguous ICP scoring

  return NextResponse.json({
    ok: true,
    messageId: email.messageId,
    icpScore
  });
}
