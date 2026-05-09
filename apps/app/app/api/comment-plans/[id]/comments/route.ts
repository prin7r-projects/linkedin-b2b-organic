/**
 * Bylineship Wave 3 — Comments within a plan.
 *
 * POST /api/comment-plans/:id/comments — add comment to plan
 * POST /api/comment-plans/:id/execute — execute comment run
 * GET  /api/comment-plans/:id/comments — list comments
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import {
  addComment,
  getCommentsForPlan,
  executeCommentRun,
  signOffComment
} from "@/lib/services/comment-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/comment-plans/:id/comments — add a hand-drafted comment */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "senior_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: planId } = await params;

  let body: {
    targetAccountId?: string;
    bodyMarkdown?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.targetAccountId || !body.bodyMarkdown) {
    return NextResponse.json(
      { error: "missing_fields", message: "targetAccountId and bodyMarkdown required" },
      { status: 400 }
    );
  }

  try {
    const comment = await addComment(
      {
        planId,
        targetAccountId: body.targetAccountId,
        bodyMarkdown: body.bodyMarkdown,
        draftedBy: session.user.email || session.user.id
      },
      session.user.id
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", message: (err as Error).message },
      { status: 400 }
    );
  }
}

/** GET /api/comment-plans/:id/comments */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: planId } = await params;
  const comments = await getCommentsForPlan(planId);
  return NextResponse.json({ comments });
}
