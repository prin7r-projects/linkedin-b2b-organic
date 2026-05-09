/**
 * Bylineship Wave 3 — Draft by ID routes.
 *
 * GET    /api/drafts/:id — get single draft
 * PATCH  /api/drafts/:id — transition status (state machine enforced)
 *
 * Per docs/12 §3.9 and docs/13 Phase 2 task 1.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { getDraft, transitionDraft, DraftError } from "@/lib/services/draft-queue";
import type { DraftStatus } from "@/lib/services/draft-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/drafts/:id */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const draft = await getDraft(id);

  if (!draft) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

/** PATCH /api/drafts/:id — transition draft status */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: {
    status?: string;
    bodyMarkdown?: string;
    killReason?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json(
      { error: "missing_status", message: "status is required" },
      { status: 400 }
    );
  }

  try {
    const draft = await transitionDraft(
      id,
      body.status as DraftStatus,
      { id: session.user.id, role: session.user.role },
      {
        bodyMarkdown: body.bodyMarkdown,
        reviewedBy: session.user.email || session.user.id,
        killReason: body.killReason
      }
    );

    return NextResponse.json({ draft });
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
