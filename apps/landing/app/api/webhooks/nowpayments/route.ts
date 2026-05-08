/**
 * [BYLINESHIP_NOWPAYMENTS_IPN] POST /api/webhooks/nowpayments
 *
 * NOWPayments delivers payment status updates here. Body is a JSON payload
 * with payment metadata; the `x-nowpayments-sig` header carries the
 * HMAC-SHA512 signature over the alphabetically sorted JSON.
 *
 * Behaviour:
 *  - HTTP 503 if `NOWPAYMENTS_IPN_SECRET` is not set (operator gap, not auth).
 *  - HTTP 401 if signature verification fails.
 *  - HTTP 200 + `{ ok: true, paid: <bool>, order_id: ... }` on a verified
 *    payload. Order-state persistence is intentionally a no-op stub here —
 *    when `apps/app/` ships, this handler will write to the orders table;
 *    until then we log the verified event so the deploy host's journalctl
 *    captures it.
 *
 * Never trust an unverified payload.
 */

import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";
import { verifyNowpaymentsIpn } from "@/lib/nowpayments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = optionalEnv("NOWPAYMENTS_IPN_SECRET");
  if (!secret) {
    return NextResponse.json(
      {
        error: "missing_env",
        missing: "NOWPAYMENTS_IPN_SECRET",
        message: "Webhook handler is not configured."
      },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_payload", message: "Body was not valid JSON." },
      { status: 400 }
    );
  }

  const signature = request.headers.get("x-nowpayments-sig");
  const verified = verifyNowpaymentsIpn(payload, signature, secret);
  if (!verified) {
    return NextResponse.json({ error: "signature_invalid" }, { status: 401 });
  }

  const status = stringValue(payload.payment_status) ?? "";
  const paid = ["finished", "confirmed"].includes(status.toLowerCase());
  const orderId =
    stringValue(payload.order_id) ?? stringValue(payload.payment_id) ?? "nowpayments_unknown";

  // Stub — when apps/app ships, this becomes a DB write. For now journalctl
  // is the audit trail. We do not log the full payload because it can carry
  // pay_address-style identifiers.
  console.log(
    `[BYLINESHIP_NOWPAYMENTS_IPN] verified=true order_id=${orderId} status=${status} paid=${paid}`
  );

  return NextResponse.json({
    ok: true,
    verified: true,
    paid,
    order_id: orderId,
    status
  });
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return undefined;
}
