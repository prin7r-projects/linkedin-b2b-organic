/**
 * Bylineship Wave 3 — Drafts API routes.
 *
 * POST /api/drafts       — create a new draft (writer)
 * GET  /api/drafts       — list drafts (filter by retainerId, status)
 *
 * Per docs/12 §3.8 and docs/13 Phase 2.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { createDraft, getDraftsForRetainer, getDraftsForReview, DraftError } from "@/lib/services/draft-queue";
import type { DraftStatus } from "@/lib/services/draft-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/drafts?retainerId=...&status=... */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const retainerId = url.searchParams.get("retainerId");
  const statusParam = url.searchParams.get("status");

  if (retainerId) {
    // Get drafts for a specific retainer
    const draftStatus = statusParam as DraftStatus | undefined;
    const result = await getDraftsForRetainer(retainerId, draftStatus);
    return NextResponse.json({ drafts: result });
  }

  if (statusParam) {
    // Get drafts by status for writers (review queue)
    const statuses = statusParam.split(",") as DraftStatus[];
    const result = await getDraftsForReview(statuses);
    return NextResponse.json({ drafts: result });
  }

  // Default: return nothing without a filter
  return NextResponse.json({ drafts: [], message: "Provide ?retainerId= or ?status= to filter" });
}

/** POST /api/drafts — create a new draft */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "senior_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: {
    retainerId?: string;
    weekIso?: string;
    scheduledShipAt?: string;
    bodyMarkdown?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.retainerId || !body.weekIso || !body.bodyMarkdown) {
    return NextResponse.json(
      { error: "missing_fields", message: "retainerId, weekIso, and bodyMarkdown are required" },
      { status: 400 }
    );
  }

  try {
    const draft = await createDraft({
      retainerId: body.retainerId,
      weekIso: body.weekIso,
      scheduledShipAt: body.scheduledShipAt ? new Date(body.scheduledShipAt) : undefined,
      bodyMarkdown: body.bodyMarkdown,
      draftedBy: session.user.email || session.user.id
    });

    return NextResponse.json({ draft }, { status: 201 });
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
