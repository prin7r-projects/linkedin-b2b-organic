/**
 * Bylineship Wave 3 — POST /api/retainers/:id/activate
 *
 * Internal endpoint — fired from the NOWPayments IPN handler after
 * HMAC-SHA512 verification. Activates the retainer.
 *
 * Per docs/12 §3.6 and docs/13 Phase 1 task 4.
 * Idempotent on (retainerId, paymentStatus).
 */

import { NextResponse } from "next/server";
import { activateRetainer } from "@/lib/services/retainer-activation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { paymentId?: string; paymentStatus?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.paymentId || !body.paymentStatus) {
    return NextResponse.json(
      { error: "missing_fields", message: "paymentId and paymentStatus are required" },
      { status: 400 }
    );
  }

  const result = await activateRetainer(id, body.paymentId, body.paymentStatus);

  if (result.status === "retainer_not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
