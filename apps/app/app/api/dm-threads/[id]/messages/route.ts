/**
 * Bylineship Wave 3 — DM Thread messages (triggers intent detection).
 * POST /api/dm-threads/:id/messages
 *
 * Per docs/12 §3.13-3.14 and docs/13 Phase 3 task 6.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { detectIntent, updateDMThreadStatus } from "@/lib/services/dm-book";
import { db } from "@/db";
import { dmThreads } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const { id: threadId } = await params;

  let body: {
    draftedBody?: string;  // Writer's drafted DM for principal
    messageBody?: string;  // Actual message body for intent detection
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const messageBody = body.messageBody || body.draftedBody || "";

  // Update thread's last message timestamp
  await db
    .update(dmThreads)
    .set({ lastMessageAt: new Date() })
    .where(eq(dmThreads.id, threadId));

  // Run intent detection on the message
  const detection = await detectIntent(threadId, messageBody);

  // If intent detected, update thread status to engaged
  if (detection.triggered) {
    await updateDMThreadStatus(threadId, "engaged");
  }

  return NextResponse.json({
    ok: true,
    intent: detection.triggered
      ? { triggered: true, keyword: detection.keyword, eventId: detection.eventId }
      : { triggered: false }
  });
}
