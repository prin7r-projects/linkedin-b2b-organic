/**
 * Bylineship Wave 3 — EditorialCallService.
 *
 * Tracks weekly editorial calls between Lila (head writer) and principals.
 * Captures: story angles discussed, drafts created, missed-call handling.
 *
 * Per docs/13 Phase 1 task 6 and docs/11 Scenario 3 step 1:
 *   - Monday 9am Lisbon: 60-min call (Operator tier)
 *   - 3 story angles from principal's week
 *   - 2 posts drafted by EOD
 *   - Missed calls: flag, drafts pulled from Slack/Granola archive
 *
 * Per docs/11 EC-2: two consecutive missed calls → pause auto-renewal
 */

import { db } from "@/db";
import { editorialCalls, retainers, drafts } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { audit } from "@/lib/audit";

export type EditorialCallInput = {
  retainerId: string;
  weekIso: string;
  heldAt: Date;
  missed?: boolean;
  outcomeNotes?: string;
  draftIds?: string[];  // draft IDs created from this call
};

export type EditorialCallRecord = {
  id: string;
  retainerId: string;
  weekIso: string;
  heldAt: string;
  missed: boolean;
  outcomeNotes?: string;
  draftIds?: string[];
};

/**
 * Record the outcome of an editorial call.
 */
export async function recordEditorialCall(
  input: EditorialCallInput,
  authorId: string,
  authorRole: string
): Promise<EditorialCallRecord> {
  const [call] = await db
    .insert(editorialCalls)
    .values({
      retainerId: input.retainerId,
      weekIso: input.weekIso,
      heldAt: input.heldAt,
      missed: input.missed || false,
      outcomeNotes: input.outcomeNotes || null,
      draftIdsJson: input.draftIds || null
    })
    .returning();

  // If missed, check for consecutive misses (EC-2)
  if (input.missed) {
    await checkConsecutiveMisses(input.retainerId);
  }

  // Audit
  await audit({
    actorId: authorId,
    actorRole: authorRole as "head_writer" | "senior_writer" | "principal" | "admin",
    action: input.missed ? "editorial_call_missed" : "editorial_call_held",
    resourceType: "editorial_call",
    resourceId: call.id,
    metadata: { retainerId: input.retainerId, weekIso: input.weekIso }
  });

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "editorial_call_recorded",
      callId: call.id,
      retainerId: input.retainerId,
      weekIso: input.weekIso,
      missed: input.missed,
      draftCount: input.draftIds?.length || 0
    })
  );

  return {
    id: call.id,
    retainerId: call.retainerId!,
    weekIso: call.weekIso!,
    heldAt: call.heldAt.toISOString(),
    missed: call.missed ?? false,
    outcomeNotes: call.outcomeNotes || undefined,
    draftIds: call.draftIdsJson as string[] | undefined
  };
}

/**
 * Get editorial calls for a retainer, ordered by most recent.
 */
export async function getEditorialCallsForRetainer(
  retainerId: string,
  limit: number = 12
): Promise<EditorialCallRecord[]> {
  const calls = await db
    .select()
    .from(editorialCalls)
    .where(eq(editorialCalls.retainerId, retainerId))
    .orderBy(desc(editorialCalls.heldAt))
    .limit(limit);

  return calls.map((call) => ({
    id: call.id,
    retainerId: call.retainerId!,
    weekIso: call.weekIso!,
    heldAt: call.heldAt.toISOString(),
    missed: call.missed ?? false,
    outcomeNotes: call.outcomeNotes || undefined,
    draftIds: call.draftIdsJson as string[] | undefined
  }));
}

/**
 * Check for two consecutive missed editorial calls (EC-2).
 * If found, pause auto-renewal — requires Lila's attention.
 */
async function checkConsecutiveMisses(retainerId: string): Promise<void> {
  const calls = await db
    .select()
    .from(editorialCalls)
    .where(eq(editorialCalls.retainerId, retainerId))
    .orderBy(desc(editorialCalls.heldAt))
    .limit(3);

  // Check if the last 2 calls were missed
  const lastTwo = calls.slice(0, 2);
  if (lastTwo.length === 2 && lastTwo.every((c) => c.missed)) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "consecutive_missed_calls_detected",
        retainerId,
        message:
          "Two consecutive editorial calls missed. Per EC-2, auto-renewal should be paused at month-end. Lila needs to send a check-in Telegram."
      })
    );

    // Phase 5: auto-pause retainer renewal at month-end
    // For Phase 1: log the warning; Lila handles manually
  }
}

/**
 * Check if a retainer has a completed voice profile.
 * Used in the activation flow to verify onboarding progress.
 */
export async function hasVoiceProfile(retainerId: string): Promise<boolean> {
  const { voiceProfiles } = await import("@/db/schema");
  const [profile] = await db
    .select({ id: voiceProfiles.id })
    .from(voiceProfiles)
    .where(eq(voiceProfiles.retainerId, retainerId))
    .limit(1);

  return !!profile;
}
