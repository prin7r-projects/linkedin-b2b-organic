/**
 * Bylineship Wave 3 — Ship draft endpoint.
 *
 * POST /api/drafts/:id/ship
 *
 * Principal sign-off. Validates the draft is in "awaiting_principal" status,
 * then transitions to "shipped" and publishes to LinkedIn.
 *
 * Supports HMAC-signed token for one-click Telegram signoff (EC-10 fallback).
 *
 * Per docs/12 §3.10 and docs/13 Phase 2 task 3.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDraft, transitionDraft, DraftError } from "@/lib/services/draft-queue";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check for HMAC-signed token (EC-10 email fallback)
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (token) {
    return handleTokenSignoff(id, token);
  }

  // Standard auth path
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (draft.status !== "awaiting_principal") {
    return NextResponse.json(
      { error: "invalid_status", message: `Draft is in "${draft.status}", not "awaiting_principal"` },
      { status: 422 }
    );
  }

  try {
    const shipped = await transitionDraft(
      id,
      "shipped",
      { id: session.user.id, role: session.user.role }
    );

    return NextResponse.json({ draft: shipped, message: "Post shipped" });
  } catch (err) {
    if (err instanceof DraftError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.httpStatus }
      );
    }
    throw err;
  }
}

/**
 * Handle HMAC-signed one-click signoff from email fallback (EC-10).
 * Parses the token: draftId:principalId:timestamp:hmac
 */
async function handleTokenSignoff(draftId: string, token: string) {
  const parts = token.split(":");
  if (parts.length !== 4) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const [tokDraftId, principalId, timestampStr, signature] = parts;

  if (tokDraftId !== draftId) {
    return NextResponse.json({ error: "token_draft_mismatch" }, { status: 401 });
  }

  // Verify HMAC
  const secret = process.env.SIGNOFF_SECRET || "dev-secret-change-me";
  const payload = `${draftId}:${principalId}:${timestampStr}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Check 24h TTL
  const timestamp = parseInt(timestampStr, 10);
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  const draft = await getDraft(draftId);
  if (!draft) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const shipped = await transitionDraft(
      draftId,
      "shipped",
      { id: principalId, role: "principal" }
    );

    return NextResponse.json({
      draft: shipped,
      message: "Post shipped via one-click signoff"
    });
  } catch (err) {
    if (err instanceof DraftError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.httpStatus }
      );
    }
    throw err;
  }
}
