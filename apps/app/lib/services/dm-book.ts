/**
 * Bylineship Wave 3 — DM Book + Intent Detector.
 *
 * Tracks DM threads with target accounts, detects intent keywords
 * in inbound messages, and creates IntentEvents for CRM routing.
 *
 * Per docs/11 US-08/US-09 (Scenario 3 steps 5-6) and docs/13 Phase 3 tasks 5-8.
 *
 * Intent keywords (per docs/12 §2.2 retainers table):
 *   Default: meeting, 15 minutes, compare notes, discovery, call
 *   Per-retainer overridable via retainers.intentKeywords
 *
 * Security (docs/12 §7 threat 4):
 *   IntentDetector requires the counterparty to be a verified target account
 *   for that retainer. Random LinkedIn DMs cannot trigger the CRM webhook.
 */

import { db } from "@/db";
import {
  dmThreads,
  intentEvents,
  retainers,
  targetAccounts
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { audit } from "@/lib/audit";
import { fireCrmWebhook } from "@/lib/services/crm-webhook";

/* ------------------------------------------------------------------ */
/* DM Thread CRUD                                                      */
/* ------------------------------------------------------------------ */

export type DMThreadInput = {
  retainerId: string;
  counterpartyLinkedinUrl: string;
  counterpartyName?: string;
  counterpartyRole?: string;
  counterpartyCompany?: string;
};

export type DMThreadRecord = {
  id: string;
  retainerId: string;
  counterpartyLinkedinUrl: string;
  counterpartyName: string | null;
  counterpartyRole: string | null;
  counterpartyCompany: string | null;
  status: "warm" | "engaged" | "meeting_booked" | "closed_lost" | "closed_won";
  lastMessageAt: string | null;
};

export async function createDMThread(
  input: DMThreadInput
): Promise<DMThreadRecord> {
  const [thread] = await db
    .insert(dmThreads)
    .values({
      retainerId: input.retainerId,
      counterpartyLinkedinUrl: input.counterpartyLinkedinUrl,
      counterpartyName: input.counterpartyName || null,
      counterpartyRole: input.counterpartyRole || null,
      counterpartyCompany: input.counterpartyCompany || null,
      status: "warm"
    })
    .returning();

  return mapDMThread(thread);
}

export async function updateDMThreadStatus(
  threadId: string,
  status: DMThreadRecord["status"]
): Promise<DMThreadRecord> {
  const [thread] = await db
    .update(dmThreads)
    .set({ status })
    .where(eq(dmThreads.id, threadId))
    .returning();

  return mapDMThread(thread);
}

export async function getDMThreads(
  retainerId: string
): Promise<DMThreadRecord[]> {
  const result = await db
    .select()
    .from(dmThreads)
    .where(eq(dmThreads.retainerId, retainerId));

  return result.map(mapDMThread);
}

function mapDMThread(t: typeof dmThreads.$inferSelect): DMThreadRecord {
  return {
    id: t.id,
    retainerId: t.retainerId!,
    counterpartyLinkedinUrl: t.counterpartyLinkedinUrl,
    counterpartyName: t.counterpartyName,
    counterpartyRole: t.counterpartyRole,
    counterpartyCompany: t.counterpartyCompany,
    status: t.status as DMThreadRecord["status"],
    lastMessageAt: t.lastMessageAt?.toISOString() ?? null
  };
}

/* ------------------------------------------------------------------ */
/* Intent Detector                                                     */
/* ------------------------------------------------------------------ */

export type IntentDetection = {
  triggered: boolean;
  keyword?: string;
  threadId: string;
  retainerId: string;
  eventId?: string;
};

/**
 * Scan an inbound DM message for intent keywords.
 *
 * Security (docs/12 §7 threat 4):
 *   Only scans messages from verified target accounts. Random LinkedIn DMs
 *   cannot trigger CRM webhook — counterparty must exist in targetAccounts.
 */
export async function detectIntent(
  threadId: string,
  messageBody: string
): Promise<IntentDetection> {
  // Fetch the DM thread
  const [thread] = await db
    .select()
    .from(dmThreads)
    .where(eq(dmThreads.id, threadId));

  if (!thread) {
    return { triggered: false, threadId, retainerId: "" };
  }

  // Security check: counterparty must be a verified target account
  const [target] = await db
    .select()
    .from(targetAccounts)
    .where(
      and(
        eq(targetAccounts.retainerId, thread.retainerId!),
        eq(targetAccounts.linkedinUrl, thread.counterpartyLinkedinUrl)
      )
    );

  if (!target) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "intent_blocked_unverified_sender",
        threadId,
        counterparty: thread.counterpartyLinkedinUrl,
        message: "Sender not in target accounts — intent detection skipped"
      })
    );
    return { triggered: false, threadId, retainerId: thread.retainerId! };
  }

  // Get retainer's intent keywords (default or custom)
  const [retainer] = await db
    .select({ intentKeywords: retainers.intentKeywords })
    .from(retainers)
    .where(eq(retainers.id, thread.retainerId!));

  const keywords = retainer?.intentKeywords ?? [
    "meeting",
    "15 minutes",
    "compare notes",
    "discovery",
    "call"
  ];

  // Match keywords case-insensitively
  const lowerBody = messageBody.toLowerCase();
  const matchedKeyword = keywords.find((kw) =>
    lowerBody.includes(kw.toLowerCase())
  );

  if (!matchedKeyword) {
    return { triggered: false, threadId, retainerId: thread.retainerId! };
  }

  // Create an IntentEvent
  const [event] = await db
    .insert(intentEvents)
    .values({
      threadId,
      triggeredBy: matchedKeyword,
      rawMessageBody: messageBody.slice(0, 2000)
    })
    .returning();

  // Fire CRM webhook
  await fireCrmWebhook(thread.retainerId!, {
    threadId,
    keyword: matchedKeyword,
    messageBody: messageBody.slice(0, 500),
    counterpartyName: thread.counterpartyName,
    counterpartyRole: thread.counterpartyRole,
    counterpartyCompany: thread.counterpartyCompany,
    detectedAt: new Date().toISOString()
  });

  await audit({
    actorId: "system",
    actorRole: "admin",
    action: "intent_detected",
    resourceType: "intent_event",
    resourceId: event.id,
    metadata: {
      threadId,
      retainerId: thread.retainerId,
      keyword: matchedKeyword
    }
  });

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "intent_detected",
      eventId: event.id,
      threadId,
      retainerId: thread.retainerId,
      keyword: matchedKeyword
    })
  );

  return {
    triggered: true,
    keyword: matchedKeyword,
    threadId,
    retainerId: thread.retainerId!,
    eventId: event.id
  };
}

/**
 * Mark an intent event as a false positive (Lila's weekly retro).
 */
export async function markFalsePositive(
  eventId: string,
  actorId: string
): Promise<void> {
  await db
    .update(intentEvents)
    .set({ falsePositive: true })
    .where(eq(intentEvents.id, eventId));

  await audit({
    actorId,
    actorRole: "head_writer",
    action: "intent_false_positive",
    resourceType: "intent_event",
    resourceId: eventId
  });

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "intent_marked_false_positive",
      eventId
    })
  );
}

/**
 * Get false-positive ratio for a retainer (weekly retro).
 */
export async function getFalsePositiveRatio(
  retainerId: string,
  since: Date
): Promise<{ total: number; falsePositives: number; ratio: number }> {
  // This query needs a join with dm_threads to filter by retainer
  // Simplified for Phase 2 — full implementation in Phase 4

  // Get threads for this retainer
  const threads = await db
    .select({ id: dmThreads.id })
    .from(dmThreads)
    .where(eq(dmThreads.retainerId, retainerId));

  const threadIds = threads.map((t) => t.id);
  if (threadIds.length === 0) return { total: 0, falsePositives: 0, ratio: 0 };

  // Just count all events for Phase 2
  const all = await db
    .select()
    .from(intentEvents);

  const filtered = all.filter(
    (e) => threadIds.includes(e.threadId!) && new Date(e.detectedAt) >= since
  );

  const total = filtered.length;
  const falsePositives = filtered.filter((e) => e.falsePositive).length;

  return {
    total,
    falsePositives,
    ratio: total > 0 ? falsePositives / total : 0
  };
}
