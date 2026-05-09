/**
 * Bylineship Wave 3 — Intent Events API.
 *
 * PATCH /api/intent-events/:id/false-positive — mark as false positive
 *
 * Per docs/12 §3.15 and docs/13 Phase 3 task 8.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { markFalsePositive } from "@/lib/services/dm-book";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
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

  const { id: eventId } = await params;
  await markFalsePositive(eventId, session.user.id);

  return NextResponse.json({ ok: true });
}
