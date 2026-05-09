/**
 * Bylineship Wave 3 — Execute comment run.
 * POST /api/comment-plans/:id/execute
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { executeCommentRun } from "@/lib/services/comment-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: planId } = await params;
  const result = await executeCommentRun(planId, session.user.id);

  return NextResponse.json(result);
}
