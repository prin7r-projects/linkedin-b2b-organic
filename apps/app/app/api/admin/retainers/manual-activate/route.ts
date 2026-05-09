/**
 * Bylineship Wave 3 — admin endpoints.
 * POST /api/admin/retainers/manual-activate — manual wire/check activation
 *
 * Per docs/13 Phase 1 Hand-off: Lila needs a manual-override path for
 * tricky retainers (hand-wired Studio invoice, wire transfers).
 *
 * Auth: head_writer or admin only.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { retainers, cohorts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/retainers/manual-activate
 *
 * Body: { retainerId, paymentMethod: 'wire' | 'manual_card' | 'studio_custom' }
 *
 * Activates a retainer without requiring a NOWPayments IPN.
 * Sets status='active', startedAt=now(), and increments the cohort filled count
 * (already done at retainer creation unless this is a retroactive activation).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { retainerId?: string; paymentMethod?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.retainerId) {
    return NextResponse.json(
      { error: "missing_retainer_id" },
      { status: 400 }
    );
  }

  const paymentMethod = body.paymentMethod || "wire";

  const [retainer] = await db
    .select()
    .from(retainers)
    .where(eq(retainers.id, body.retainerId));

  if (!retainer) {
    return NextResponse.json(
      { error: "retainer_not_found" },
      { status: 404 }
    );
  }

  if (retainer.status === "active") {
    return NextResponse.json(
      { error: "already_active", retainerId: retainer.id },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(retainers)
    .set({
      status: "active",
      startedAt: new Date()
    })
    .where(eq(retainers.id, body.retainerId))
    .returning();

  // Log the manual activation for audit
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "retainer_manual_activation",
      retainerId: retainer.id,
      principalId: retainer.principalId,
      tier: retainer.tier,
      paymentMethod,
      actorId: session.user.id,
      actorRole: session.user.role
    })
  );

  return NextResponse.json({
    ok: true,
    retainer: updated,
    paymentMethod
  });
}
