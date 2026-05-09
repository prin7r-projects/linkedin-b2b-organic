/**
 * Bylineship Wave 3 — BullMQ worker bootstrap.
 *
 * Queue backbone for all async work (drafts, intake, monthly reports, etc.)
 * Per docs/13 Phase 0 task 3: provision Redis + BullMQ for the queue system.
 *
 * Workers:
 *   - intake-triage:     POST /api/intake/email-ingest → ICP scoring
 *   - voice-profile:     generates 12-page voice profile PDF (Phase 1)
 *   - retainer-activation: IPN handler side effects (Phase 1)
 *   - draft-delivery:    Telegram delivery of drafts (Phase 2)
 *   - comment-plan:      weekly comment plan generation (Phase 3)
 *   - monthly-report:    last-Friday reports (Phase 5)
 *   - craft-handoff:     cancellation package assembly (Phase 5)
 *
 * Phase 0: stub — workers register but don't process until their phase.
 */

import { Queue, Worker, type ConnectionOptions } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection: ConnectionOptions = {
  url: REDIS_URL,
  connectTimeout: 5000
};

/* ------------------------------------------------------------------ */
/* Queue definitions                                                   */
/* ------------------------------------------------------------------ */

export const intakeTriageQueue = new Queue("intake-triage", { connection });
export const voiceProfileQueue = new Queue("voice-profile", { connection });
export const retainerActivationQueue = new Queue("retainer-activation", { connection });
export const draftDeliveryQueue = new Queue("draft-delivery", { connection });
export const commentPlanQueue = new Queue("comment-plan", { connection });
export const monthlyReportQueue = new Queue("monthly-report", { connection });
export const craftHandoffQueue = new Queue("craft-handoff", { connection });

/* ------------------------------------------------------------------ */
/* Worker stubs (Phase 0 — no-op processors)                           */
/* ------------------------------------------------------------------ */

export function bootstrapWorkers(): void {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "workers_not_started",
        message: "REDIS_URL not configured — BullMQ workers are inactive"
      })
    );
    return;
  }

  // Intake triage worker — Phase 1
  new Worker(
    "intake-triage",
    async (job) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          event: "intake_triage_job",
          jobId: job.id,
          data: job.data
        })
      );
    },
    { connection }
  );

  // Voice profile worker — Phase 1
  new Worker(
    "voice-profile",
    async (job) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          event: "voice_profile_job",
          jobId: job.id
        })
      );
    },
    { connection }
  );

  // Draft delivery worker — Phase 2
  new Worker(
    "draft-delivery",
    async (job) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          event: "draft_delivery_job",
          jobId: job.id
        })
      );
    },
    { connection }
  );

  // Monthly report worker — Phase 5
  new Worker(
    "monthly-report",
    async (job) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          event: "monthly_report_job",
          jobId: job.id
        })
      );
    },
    { connection }
  );

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "workers_bootstrapped",
      queues: [
        "intake-triage",
        "voice-profile",
        "retainer-activation",
        "draft-delivery",
        "comment-plan",
        "monthly-report",
        "craft-handoff"
      ],
      message: "Phase 0 — workers registered with no-op processors"
    })
  );
}

/**
 * Enqueue an intake triage job (Phase 1+).
 */
export async function enqueueIntakeTriage(
  email: { from: string; subject: string; bodyText: string; messageId: string }
) {
  await intakeTriageQueue.add("intake-triage", email, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }
  });
}

/**
 * Enqueue a voice profile generation job (Phase 1+).
 */
export async function enqueueVoiceProfile(retainerId: string) {
  await voiceProfileQueue.add("voice-profile", { retainerId }, {
    attempts: 2,
    backoff: { type: "fixed", delay: 30000 }
  });
}

/**
 * Enqueue a draft delivery job (Phase 2+).
 */
export async function enqueueDraftDelivery(draftId: string, retainerId: string) {
  await draftDeliveryQueue.add("draft-delivery", { draftId, retainerId }, {
    attempts: 5,
    backoff: { type: "exponential", delay: 10000 }
  });
}

/**
 * Enqueue a monthly report job (Phase 5+).
 */
export async function enqueueMonthlyReport(retainerId: string, monthIso: string) {
  await monthlyReportQueue.add("monthly-report", { retainerId, monthIso }, {
    attempts: 3,
    backoff: { type: "fixed", delay: 60000 }
  });
}
