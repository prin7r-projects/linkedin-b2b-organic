/**
 * Bylineship Wave 3 — Comment Plans API.
 *
 * POST /api/comment-plans — generate a weekly comment plan
 * GET  /api/comment-plans?retainerId=... — list plans for retainer
 * POST /api/comment-plans/:id/comments — add comment to plan
 * POST /api/comment-plans/:id/execute — execute comment run
 *
 * Per docs/13 Phase 3 tasks 2-4.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import {
  generateCommentPlan,
  addComment,
  getCommentsForPlan,
  executeCommentRun
} from "@/lib/services/comment-plan";
import { db } from "@/db";
import { commentPlans } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/comment-plans — generate a weekly comment plan */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { retainerId?: string; weekIso?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.retainerId || !body.weekIso) {
    return NextResponse.json(
      { error: "missing_fields" },
      { status: 400 }
    );
  }

  const plan = await generateCommentPlan(
    body.retainerId,
    body.weekIso,
    session.user.id
  );

  return NextResponse.json({ plan }, { status: 201 });
}

/** GET /api/comment-plans?retainerId=... */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const retainerId = url.searchParams.get("retainerId");

  if (!retainerId) {
    return NextResponse.json({ error: "missing_retainerId" }, { status: 400 });
  }

  const plans = await db
    .select()
    .from(commentPlans)
    .where(eq(commentPlans.retainerId, retainerId));

  return NextResponse.json({ plans });
}
