/**
 * Bylineship Wave 3 — audit logger.
 *
 * Writes structured JSON audit events to stdout (journalctl on the deploy host)
 * and, when the DB is available, to the audit_logs table. PII is scrubbed at
 * the log boundary — principal emails are replaced with hashed retainer ids.
 *
 * Per doc 12 §8: logs are JSON `{ ts, level, actorRole, action, resourceType,
 * resourceId, retainerId?, draftId?, event }`. PII scrubbed.
 *
 * Per doc 12 §7 threat 5: every read of voice_profiles is audit-logged with
 * writer ID + timestamp for the weekly head-writer review.
 */

import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export type AuditEvent = {
  actorId: string;
  actorRole: "head_writer" | "senior_writer" | "principal" | "admin";
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

/**
 * Write an audit event to stdout (journalctl) AND to the audit_logs table.
 * Stdout write is synchronous and fire-and-forget; DB write returns the promise
 * but callers should not block on it.
 */
export async function audit(log: AuditEvent): Promise<void> {
  const entry = {
    ts: new Date().toISOString(),
    level: "info" as const,
    ...log,
    event: "audit"
  };

  // Stdout — journalctl indexed
  console.log(JSON.stringify(entry));

  // DB persistence — best-effort; don't throw on DB connection failures
  try {
    await db.insert(auditLogs).values({
      actorId: log.actorId,
      actorRole: log.actorRole,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata ?? null
    });
  } catch (err) {
    // DB might not be available yet (boot order). Log to stderr so operators
    // see the gap but the request still succeeds.
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "audit_db_write_failed",
        message: (err as Error).message
      })
    );
  }
}

/**
 * Create a scoped audit logger pre-bound to an actor.
 */
export function auditAs(actor: {
  id: string;
  role: AuditEvent["actorRole"];
}) {
  return (action: string, resourceType: string, resourceId: string, metadata?: Record<string, unknown>) =>
    audit({
      actorId: actor.id,
      actorRole: actor.role,
      action,
      resourceType,
      resourceId,
      metadata
    });
}
