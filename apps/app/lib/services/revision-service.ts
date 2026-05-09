/**
 * Bylineship Wave 3 — RevisionService.
 *
 * Tracks draft revisions when the principal requests edits via Telegram.
 * Each revision captures: from → to body, who initiated, why.
 *
 * Per docs/11 US-05 step 5, docs/13 Phase 2 task 4:
 *   Principal types free-text reply → stored as revision → senior writer
 *   notified → applies change → re-delivers to principal.
 */

import { db } from "@/db";
import { revisions, drafts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { audit } from "@/lib/audit";

export type RevisionInput = {
  draftId: string;
  fromBody: string;
  toBody: string;
  initiatedBy: "principal" | "senior_writer" | "head_writer";
  rationale?: string;
};

export type RevisionRecord = {
  id: string;
  draftId: string;
  fromBody: string;
  toBody: string;
  initiatedBy: string;
  rationale: string | null;
  createdAt: string;
};

/**
 * Record a revision to a draft.
 * Also updates the draft's body to the new version.
 */
export async function createRevision(
  input: RevisionInput
): Promise<RevisionRecord> {
  const [revision] = await db
    .insert(revisions)
    .values({
      draftId: input.draftId,
      fromBody: input.fromBody,
      toBody: input.toBody,
      initiatedBy: input.initiatedBy,
      rationale: input.rationale || null
    })
    .returning();

  // Update the draft body to the new version
  await db
    .update(drafts)
    .set({ bodyMarkdown: input.toBody })
    .where(eq(drafts.id, input.draftId));

  // If initiated by principal, transition back to drafting for writer review
  if (input.initiatedBy === "principal") {
    await db
      .update(drafts)
      .set({ status: "drafting" })
      .where(eq(drafts.id, input.draftId));
  }

  // Audit
  await audit({
    actorId: "system",
    actorRole: "head_writer",
    action: "revision_created",
    resourceType: "draft",
    resourceId: input.draftId,
    metadata: {
      initiatedBy: input.initiatedBy,
      rationale: input.rationale
    }
  });

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "revision_created",
      revisionId: revision.id,
      draftId: input.draftId,
      initiatedBy: input.initiatedBy
    })
  );

  return {
    id: revision.id,
    draftId: revision.draftId!,
    fromBody: revision.fromBody,
    toBody: revision.toBody,
    initiatedBy: revision.initiatedBy,
    rationale: revision.rationale,
    createdAt: revision.createdAt.toISOString()
  };
}

/**
 * Get revision history for a draft.
 */
export async function getRevisionsForDraft(
  draftId: string
): Promise<RevisionRecord[]> {
  const result = await db
    .select()
    .from(revisions)
    .where(eq(revisions.draftId, draftId))
    .orderBy(desc(revisions.createdAt));

  return result.map((r) => ({
    id: r.id,
    draftId: r.draftId!,
    fromBody: r.fromBody,
    toBody: r.toBody,
    initiatedBy: r.initiatedBy,
    rationale: r.rationale,
    createdAt: r.createdAt.toISOString()
  }));
}

/**
 * Parse a principal's free-text Telegram reply into a revision request.
 * Extracts the edit intent from natural language.
 *
 * Example inputs:
 *   "'embarrassed' should be 'a little embarrassed'"
 *   "make it less polished"
 *   "remove the third paragraph"
 *   "add a concrete number: we saved $2M"
 */
export function parseTelegramEdit(
  currentBody: string,
  editMessage: string
): { toBody: string; rationale: string } {
  // Phase 2: simple heuristic parsing. Phase 3: could use Anthropic for
  // more sophisticated natural-language edit application.

  const rationale = editMessage.trim();

  // Try to detect specific word replacements: "'old' should be 'new'"
  const wordSwapMatch = rationale.match(/'([^']+)' should be '([^']+)'/);
  if (wordSwapMatch) {
    const [, oldWord, newWord] = wordSwapMatch;
    return {
      toBody: currentBody.replace(new RegExp(oldWord, "g"), newWord),
      rationale
    };
  }

  // "less polished" → add a note for the writer
  // For Phase 2, append the edit request as a comment at the top
  if (/less polished|too formal|too casual|shorter|longer/i.test(rationale)) {
    return {
      toBody: `<!-- Editor note: ${rationale} -->\n\n${currentBody}`,
      rationale
    };
  }

  // Default: append the edit request as a comment
  return {
    toBody: `<!-- Editor note: ${rationale} -->\n\n${currentBody}`,
    rationale
  };
}
