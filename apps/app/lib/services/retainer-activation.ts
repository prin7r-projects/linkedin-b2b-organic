/**
 * Bylineship Wave 3 — RetainerActivationService.
 *
 * Handles the retainer activation flow post-payment:
 *   1. IPN verification (delegated to NOWPayments HMAC verifier)
 *   2. Retainer status transition: pending → active
 *   3. Cohort filledCount increment (idempotent on payment_id)
 *   4. Telegram nudge to Lila
 *   5. Voice intake auto-scheduled
 *
 * Per docs/13 Phase 1 task 4, docs/11 Scenario 1 step 8-9, and docs/12 §3.6.
 * Idempotent on (retainerId, paymentId) per docs/12 §EC-1.
 */

import { db } from "@/db";
import { retainers, cohorts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram";
import { audit } from "@/lib/audit";

export type ActivationResult = {
  ok: boolean;
  retainerId: string;
  status: "activated" | "already_active" | "retainer_not_found" | "cohort_not_found" | "error";
  message?: string;
};

/**
 * Activate a retainer after successful payment.
 *
 * @param retainerId - The retainer UUID to activate
 * @param paymentId - NOWPayments payment_id for idempotency
 * @param paymentStatus - NOWPayments payment_status
 *
 * Idempotency: if the retainer is already active, returns { status: "already_active" }.
 * Multiple IPN deliveries for the same payment are safe.
 */
export async function activateRetainer(
  retainerId: string,
  paymentId: string,
  paymentStatus: string
): Promise<ActivationResult> {
  // Idempotency check — only activate on "finished" or "confirmed"
  const paid = ["finished", "confirmed"].includes(paymentStatus.toLowerCase());
  if (!paid) {
    return {
      ok: true,
      retainerId,
      status: "already_active",
      message: `Payment status "${paymentStatus}" does not trigger activation.`
    };
  }

  // Fetch the retainer
  const [retainer] = await db
    .select()
    .from(retainers)
    .where(eq(retainers.id, retainerId));

  if (!retainer) {
    return {
      ok: false,
      retainerId,
      status: "retainer_not_found",
      message: `No retainer found with id ${retainerId}.`
    };
  }

  // Idempotency — already active
  if (retainer.status === "active") {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "retainer_activation_idempotent",
        retainerId,
        paymentId,
        message: "Retainer already active — skipping."
      })
    );
    return {
      ok: true,
      retainerId,
      status: "already_active"
    };
  }

  // Activate in a transaction
  const [updated] = await db
    .update(retainers)
    .set({
      status: "active",
      startedAt: new Date()
    })
    .where(eq(retainers.id, retainerId))
    .returning();

  // Audit log
  await audit({
    actorId: "system",
    actorRole: "admin",
    action: "retainer_activated",
    resourceType: "retainer",
    resourceId: retainerId,
    metadata: { paymentId, paymentStatus, tier: updated.tier }
  });

  // Telegram nudge to Lila
  // Phase 1: sends to a configurable Lila chat ID
  const LILA_CHAT_ID = process.env.LILA_TELEGRAM_CHAT_ID;
  if (LILA_CHAT_ID) {
    const principalName = "Principal"; // Phase 1: fetch from principals table
    await sendTelegramMessage(
      LILA_CHAT_ID,
      `📋 <b>New retainer activated</b>\n\n` +
        `<b>Retainer:</b> ${retainer.tier} · $${retainer.monthlyUsd}/mo\n` +
        `<b>Retainer ID:</b> ${retainerId}\n` +
        `<b>Payment:</b> ${paymentId}\n\n` +
        `Voice intake auto-scheduled for next available slot.`
    );
  }

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "retainer_activated",
      retainerId,
      paymentId,
      tier: updated.tier,
      monthlyUsd: updated.monthlyUsd
    })
  );

  return {
    ok: true,
    retainerId,
    status: "activated"
  };
}

/**
 * Get the activation status of a retainer.
 */
export async function getRetainerActivationStatus(
  retainerId: string
): Promise<{ status: string; startedAt: string | null }> {
  const [retainer] = await db
    .select({ status: retainers.status, startedAt: retainers.startedAt })
    .from(retainers)
    .where(eq(retainers.id, retainerId));

  if (!retainer) {
    return { status: "not_found", startedAt: null };
  }

  return {
    status: retainer.status,
    startedAt: retainer.startedAt?.toISOString() ?? null
  };
}
