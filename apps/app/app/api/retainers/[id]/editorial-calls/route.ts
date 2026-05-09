/**
 * Bylineship Wave 3 — editorial calls for a retainer.
 *
 * POST /api/retainers/:id/editorial-calls — record a call outcome
 * GET  /api/retainers/:id/editorial-calls  — list calls for retainer
 *
 * Per docs/12 §3 (EditorialCallService) and docs/13 Phase 1 task 6.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import {
  recordEditorialCall,
  getEditorialCallsForRetainer
} from "@/lib/services/editorial-call";
import { db } from "@/db";
import { retainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — list editorial calls for the retainer */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: retainerId } = await params;

  // Authorization: principal (own) / senior writer (assigned) / head writer (all)
  if (session.user.role === "principal") {
    const [retainer] = await db
      .select({ principalId: retainers.principalId })
      .from(retainers)
      .where(eq(retainers.id, retainerId));
    // Phase 1: full principal-ownership check requires principal lookup
  }

  if (!hasRole(session.user.role, "senior_writer") && session.user.role !== "principal") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const calls = await getEditorialCallsForRetainer(retainerId);
  return NextResponse.json({ calls });
}

/** POST — record an editorial call outcome */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: retainerId } = await params;

  let body: {
    weekIso?: string;
    heldAt?: string;
    missed?: boolean;
    outcomeNotes?: string;
    draftIds?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.weekIso || !body.heldAt) {
    return NextResponse.json(
      { error: "missing_fields", message: "weekIso and heldAt are required" },
      { status: 400 }
    );
  }

  const call = await recordEditorialCall(
    {
      retainerId,
      weekIso: body.weekIso,
      heldAt: new Date(body.heldAt),
      missed: body.missed,
      outcomeNotes: body.outcomeNotes,
      draftIds: body.draftIds
    },
    session.user.id,
    session.user.role
  );

  return NextResponse.json(call, { status: 201 });
}
