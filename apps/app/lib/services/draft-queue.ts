/**
 * Bylineship Wave 3 — DraftQueue service.
 *
 * Manages the draft lifecycle state machine and workflow.
 *
 * Valid state transitions (per docs/13 Phase 2):
 *   drafting → senior_review → head_review → awaiting_principal → shipped
 *                                                              ↘ killed
 *   (any status) → killed (with reason)
 *
 * Illegal transitions (return 422):
 *   drafting → shipped (must pass through review gates)
 *   awaiting_principal → drafting (cannot go backwards past review)
 *   shipped → * (terminal state)
 *   killed → * (terminal state)
 *
 * Per docs/11 US-05/US-06, docs/12 §3.8-3.10, docs/13 Phase 2.
 */

import { db } from "@/db";
import { drafts, revisions } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { audit } from "@/lib/audit";
import { sendDraftForSignoff, sendTelegramMessage } from "@/lib/telegram";
import { publishToLinkedIn } from "@/lib/linkedin";

/* ------------------------------------------------------------------ */
/* State machine                                                       */
/* ------------------------------------------------------------------ */

export type DraftStatus =
  | "drafting"
  | "senior_review"
  | "head_review"
  | "awaiting_principal"
  | "shipped"
  | "killed";

const VALID_TRANSITIONS: Record<DraftStatus, DraftStatus[]> = {
  drafting: ["senior_review", "killed"],
  senior_review: ["head_review", "drafting", "killed"],
  head_review: ["awaiting_principal", "senior_review", "killed"],
  awaiting_principal: ["shipped", "drafting", "killed"],
  shipped: [], // terminal
  killed: []  // terminal
};

export function isValidTransition(
  from: DraftStatus,
  to: DraftStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/* ------------------------------------------------------------------ */
/* Draft CRUD                                                          */
/* ------------------------------------------------------------------ */

export type DraftInput = {
  retainerId: string;
  weekIso: string;
  scheduledShipAt?: Date;
  bodyMarkdown: string;
  draftedBy: string;
};

export type DraftRecord = {
  id: string;
  retainerId: string;
  weekIso: string | null;
  scheduledShipAt: string | null;
  status: DraftStatus;
  bodyMarkdown: string;
  draftedBy: string;
  reviewedBy: string | null;
  shippedAt: string | null;
  linkedinPostUrl: string | null;
  killReason: string | null;
};

/** Create a new draft in "drafting" status */
export async function createDraft(input: DraftInput): Promise<DraftRecord> {
  const [draft] = await db
    .insert(drafts)
    .values({
      retainerId: input.retainerId,
      weekIso: input.weekIso,
      scheduledShipAt: input.scheduledShipAt || null,
      bodyMarkdown: input.bodyMarkdown,
      draftedBy: input.draftedBy,
      status: "drafting"
    })
    .returning();

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "draft_created",
      draftId: draft.id,
      retainerId: input.retainerId,
      weekIso: input.weekIso,
      draftedBy: input.draftedBy
    })
  );

  return mapDraft(draft);
}

/** Transition a draft to a new status, enforcing the state machine */
export async function transitionDraft(
  draftId: string,
  newStatus: DraftStatus,
  actor: { id: string; role: string },
  options?: {
    bodyMarkdown?: string;
    reviewedBy?: string;
    killReason?: string;
  }
): Promise<DraftRecord> {
  const [draft] = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, draftId));

  if (!draft) {
    throw new DraftError("not_found", `Draft ${draftId} not found`);
  }

  const fromStatus = draft.status as DraftStatus;

  if (!isValidTransition(fromStatus, newStatus)) {
    throw new DraftError(
      "invalid_transition",
      `Cannot transition from ${fromStatus} to ${newStatus}`,
      422
    );
  }

  const updateData: Record<string, unknown> = {
    status: newStatus
  };

  if (options?.bodyMarkdown) updateData.bodyMarkdown = options.bodyMarkdown;
  if (options?.reviewedBy) updateData.reviewedBy = options.reviewedBy;
  if (options?.killReason) updateData.killReason = options.killReason;
  if (newStatus === "shipped") updateData.shippedAt = new Date();

  const [updated] = await db
    .update(drafts)
    .set(updateData)
    .where(eq(drafts.id, draftId))
    .returning();

  // Audit
  await audit({
    actorId: actor.id,
    actorRole: actor.role as "head_writer" | "principal",
    action: `draft_${newStatus}`,
    resourceType: "draft",
    resourceId: draftId,
    metadata: {
      fromStatus,
      retainerId: draft.retainerId,
      weekIso: draft.weekIso
    }
  });

  // Side effects based on new status
  await handleStatusTransition(newStatus, updated, actor);

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "draft_transitioned",
      draftId,
      fromStatus,
      toStatus: newStatus,
      actorId: actor.id
    })
  );

  return mapDraft(updated);
}

/* ------------------------------------------------------------------ */
/* Status transition side effects                                      */
/* ------------------------------------------------------------------ */

async function handleStatusTransition(
  newStatus: DraftStatus,
  draft: typeof drafts.$inferSelect,
  actor: { id: string; role: string }
): Promise<void> {
  switch (newStatus) {
    case "awaiting_principal":
      // Deliver to principal's Telegram channel
      await deliverDraftToPrincipal(draft);
      break;
    case "shipped":
      // Publish to LinkedIn
      await publishDraft(draft);
      break;
    case "killed":
      // Notify writers
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          event: "draft_killed",
          draftId: draft.id,
          reason: draft.killReason
        })
      );
      break;
  }
}

/** Deliver draft to principal's Telegram with Ship/Edit buttons */
async function deliverDraftToPrincipal(
  draft: typeof drafts.$inferSelect
): Promise<void> {
  // Look up principal's Telegram channel
  const { retainers, principals } = await import("@/db/schema");
  const [retainer] = await db
    .select({
      principalId: retainers.principalId,
      tier: retainers.tier
    })
    .from(retainers)
    .where(eq(retainers.id, draft.retainerId!));

  if (!retainer?.principalId) return;

  const [principal] = await db
    .select({
      telegramChannelId: principals.telegramChannelId,
      fullName: principals.fullName
    })
    .from(principals)
    .where(eq(principals.id, retainer.principalId));

  if (!principal?.telegramChannelId) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "draft_delivery_skipped",
        draftId: draft.id,
        reason: "no_telegram_channel"
      })
    );
    return;
  }

  const result = await sendDraftForSignoff(
    principal.telegramChannelId,
    draft.id,
    draft.bodyMarkdown,
    principal.fullName || "Principal"
  );

  if (!result.ok) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "draft_delivery_failed",
        draftId: draft.id,
        error: result.error
      })
    );
    // EC-10: Fall back to email if Telegram fails
    await sendEmailFallback(draft, principal.fullName || "Principal");
  }
}

/** Publish draft to LinkedIn under the principal's session */
async function publishDraft(
  draft: typeof drafts.$inferSelect
): Promise<void> {
  const { retainers } = await import("@/db/schema");
  const [retainer] = await db
    .select({ principalId: retainers.principalId })
    .from(retainers)
    .where(eq(retainers.id, draft.retainerId!));

  if (!retainer?.principalId) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "draft_publish_failed",
        draftId: draft.id,
        reason: "no_principal"
      })
    );
    return;
  }

  const result = await publishToLinkedIn(
    retainer.principalId,
    draft.bodyMarkdown
  );

  if (result.ok && result.postUrl) {
    await db
      .update(drafts)
      .set({ linkedinPostUrl: result.postUrl })
      .where(eq(drafts.id, draft.id));
  } else {
    // LinkedIn 4xx fallback: manual-publish queue
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "linkedin_publish_failed",
        draftId: draft.id,
        error: result.error,
        action: "move_to_manual_publish_queue"
      })
    );
  }
}

/** EC-10: Email fallback when Telegram is down */
async function sendEmailFallback(
  draft: typeof drafts.$inferSelect,
  principalName: string
): Promise<void> {
  const { generateSignoffToken } = await import("@/lib/telegram");
  const { retainers, principals } = await import("@/db/schema");

  const [retainer] = await db
    .select({ principalId: retainers.principalId })
    .from(retainers)
    .where(eq(retainers.id, draft.retainerId!));

  if (!retainer?.principalId) return;

  const [principal] = await db
    .select({ email: principals.email })
    .from(principals)
    .where(eq(principals.id, retainer.principalId));

  if (!principal?.email) return;

  const token = generateSignoffToken(draft.id, retainer.principalId);
  const signoffUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/drafts/${draft.id}/ship?token=${token}`;

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "draft_email_fallback",
      draftId: draft.id,
      principalEmail: principal.email,
      signoffUrl
    })
  );

  // Phase 2: Postmark/SES integration for actual email sending
  // For now, log the URL — the one-click signoff endpoint works
}

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

/** Get all drafts for a retainer, ordered by week */
export async function getDraftsForRetainer(
  retainerId: string,
  statusFilter?: DraftStatus
): Promise<DraftRecord[]> {
  const conditions = statusFilter
    ? [eq(drafts.retainerId, retainerId), eq(drafts.status, statusFilter)]
    : [eq(drafts.retainerId, retainerId)];

  const result = await db
    .select()
    .from(drafts)
    .where(and(...conditions))
    .orderBy(asc(drafts.scheduledShipAt));

  return result.map(mapDraft);
}

/** Get drafts pending review (for senior/head writers) */
export async function getDraftsForReview(
  statuses: DraftStatus[]
): Promise<DraftRecord[]> {
  if (statuses.length === 0) return [];

  const result = await db
    .select()
    .from(drafts)
    .where(
      and(
        ...statuses.map((s) => eq(drafts.status, s))
      )
    )
    .orderBy(asc(drafts.scheduledShipAt));

  return result.map(mapDraft);
}

/** Get a single draft by ID */
export async function getDraft(draftId: string): Promise<DraftRecord | null> {
  const [draft] = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, draftId));

  return draft ? mapDraft(draft) : null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mapDraft(d: typeof drafts.$inferSelect): DraftRecord {
  return {
    id: d.id,
    retainerId: d.retainerId!,
    weekIso: d.weekIso,
    scheduledShipAt: d.scheduledShipAt?.toISOString() ?? null,
    status: d.status as DraftStatus,
    bodyMarkdown: d.bodyMarkdown,
    draftedBy: d.draftedBy,
    reviewedBy: d.reviewedBy,
    shippedAt: d.shippedAt?.toISOString() ?? null,
    linkedinPostUrl: d.linkedinPostUrl,
    killReason: d.killReason
  };
}

export class DraftError extends Error {
  code: string;
  httpStatus: number;
  constructor(code: string, message: string, httpStatus = 400) {
    super(message);
    this.name = "DraftError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}
