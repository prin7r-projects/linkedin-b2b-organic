/**
 * [BYLINESHIP_NOWPAYMENTS] Server-side helpers for the NOWPayments hosted invoice.
 *
 * - `PLANS` maps the three retainer tiers visible on the landing to their
 *   first-month USD price + checkout copy. We charge the first month at
 *   checkout; the recurring renewal is invoiced on the same NOWPayments
 *   account when apps/app ships.
 *
 * - `verifyNowpaymentsIpn` is the canonical HMAC-SHA512 verifier copied from
 *   `/Users/keer/projects/prin7r/payments-prototypes/src/lib/signatures.ts`.
 *   The provider posts a JSON body and signs the JSON of the alphabetically
 *   sorted payload with the IPN secret. We never trust an unverified IPN.
 */

import crypto from "node:crypto";
import { MissingEnvError, optionalEnv } from "@/lib/env";

export type PlanId = "founder" | "operator" | "director";

export type Plan = {
  id: PlanId;
  name: string;
  monthlyUsd: number;
  description: string;
};

export const PLANS: Record<PlanId, Plan> = {
  founder: {
    id: "founder",
    name: "Bylineship — Founder retainer (first month)",
    monthlyUsd: 1490,
    description:
      "Founder retainer, first month. 60-min weekly editorial call. 2 ghostwritten posts/week (8/month) in your voice, signed off before publish. Comment plan on 30 target accounts. DM follow-up draft library. Email + Telegram for the writing room."
  },
  operator: {
    id: "operator",
    name: "Bylineship — Operator retainer (first month)",
    monthlyUsd: 2990,
    description:
      "Operator retainer, first month. Two 45-min editorial calls per week. 3 ghostwritten posts/week (12/month). Comment-engine on 50 target accounts (15 thoughtful comments/week, signed off in advance). DM book with weekly playbook. CRM webhook routing — DMs that become calls land in HubSpot or Pipedrive."
  },
  director: {
    id: "director",
    name: "Bylineship — Director retainer (first month)",
    monthlyUsd: 4990,
    description:
      "Director retainer, first month. Daily editorial slot (15-min check-ins). 5 ghostwritten posts/week (20/month). Comment-engine on 100 target accounts. DM book + a quarterly point-of-view essay (1,500-2,000 words). White-glove CRM integration with sales-ops review. Direct line to the head writer."
  }
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export type CreateInvoiceInput = {
  plan: Plan;
  baseUrl: string;
  retainerId?: string;  // Wave 3: links payment to a pre-created retainer
};

export type NowpaymentsInvoice = {
  id: string;
  invoice_url: string;
  raw: Record<string, unknown>;
};

/**
 * Calls NOWPayments `POST /v1/invoice` to create a hosted invoice and
 * returns the invoice id + redirect URL. Never logs the API key.
 */
export async function createNowpaymentsInvoice(input: CreateInvoiceInput): Promise<NowpaymentsInvoice> {
  const apiKey = optionalEnv("NOWPAYMENTS_API_KEY");
  if (!apiKey) throw new MissingEnvError("NOWPAYMENTS_API_KEY");

  const sandbox = (optionalEnv("NOWPAYMENTS_SANDBOX") ?? "false").toLowerCase() === "true";
  const apiBase = sandbox ? "https://api-sandbox.nowpayments.io" : "https://api.nowpayments.io";

  const orderId = input.retainerId
    ? `bylineship_${input.plan.id}_retainer_${input.retainerId}`
    : `bylineship_${input.plan.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const body = {
    price_amount: input.plan.monthlyUsd,
    price_currency: "usd",
    order_id: orderId,
    order_description: input.plan.description,
    ipn_callback_url: `${input.baseUrl}/api/webhooks/nowpayments`,
    success_url: `${input.baseUrl}/?order=${orderId}&status=paid#hero`,
    cancel_url: `${input.baseUrl}/?order=${orderId}&status=cancelled#hero`,
    is_fee_paid_by_user: false,
    is_fixed_rate: false
  };

  const response = await fetch(`${apiBase}/v1/invoice`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const text = await response.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`NOWPayments returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const invoiceUrl = typeof parsed.invoice_url === "string" ? parsed.invoice_url : "";
  const invoiceId =
    typeof parsed.id === "string" || typeof parsed.id === "number" ? String(parsed.id) : orderId;

  if (!invoiceUrl) {
    throw new Error("NOWPayments response did not include invoice_url");
  }

  return {
    id: invoiceId,
    invoice_url: invoiceUrl,
    raw: parsed
  };
}

/* ------------------------------------------------------------------ */
/* HMAC-SHA512 IPN verification — copied from payments-prototypes.    */
/* ------------------------------------------------------------------ */

function timingSafeEqualHex(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

export function verifyNowpaymentsIpn(payload: unknown, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  return timingSafeEqualHex(expected, signature);
}
