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
import { parseIntakeEmail } from "@/lib/email";
import { triageIntakeEmail, checkAntiPersonas } from "@/lib/services/intake-triage";
import { enqueueIntakeTriage } from "@/workers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Phase 2: verify inbound webhook HMAC (Postmark/SES) before processing

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

  // Anti-persona filter (docs/11 §5): reject known bad fits immediately
  const antiPersona = checkAntiPersonas(email);
  if (antiPersona) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "intake_rejected_anti_persona",
        from: email.from,
        reason: antiPersona
      })
    );
    return NextResponse.json({
      ok: true,
      messageId: email.messageId,
      triageDecision: "archive",
      antiPersona
    });
  }

  // Full triage pipeline (heuristic + optional Anthropic analysis)
  const result = await triageIntakeEmail(email);

  // Enqueue for async processing (Slack notification, CRM lookup, etc.)
  if (result.triageDecision !== "archive") {
    await enqueueIntakeTriage(email);
  }

  return NextResponse.json({
    ok: true,
    messageId: email.messageId,
    icpScore: result.icpScore,
    icpFlags: result.icpFlags,
    triageDecision: result.triageDecision,
    anthropicAnalysis: result.anthropicAnalysis
  });
}
