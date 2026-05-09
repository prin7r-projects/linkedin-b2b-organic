/**
 * Bylineship Wave 3 — Drizzle ORM schema.
 *
 * Canonical data model sourced from docs/12-technical-specification.md §2.2.
 * Every table here traces back to a story in doc 11 or a scenario in doc 11 §3.
 *
 * Entity relationship:
 *   Cohort → Retainer → Principal (ghostwrites_for)
 *   Retainer → VoiceProfile, EditorialCall, Draft, CommentPlan, DMBook, MonthlyReport, CraftHandoff
 *   Draft → Revision, Publication
 *   CommentPlan → TargetAccount → Comment
 *   DMBook → DMThread → IntentEvent → CRMSync
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Cohorts                                                            */
/* ------------------------------------------------------------------ */

export const cohorts = pgTable(
  "cohorts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monthIso: text("month_iso").notNull().unique(), // '2026-06'
    intakeOpensAt: timestamp("intake_opens_at").notNull(),
    intakeClosesAt: timestamp("intake_closes_at").notNull(),
    capMax: integer("cap_max").default(6).notNull(), // structural — never raised in code
    filledCount: integer("filled_count").default(0).notNull()
  },
  (table) => ({
    monthIdx: uniqueIndex("cohort_month_idx").on(table.monthIso)
  })
);

/* ------------------------------------------------------------------ */
/* Principals                                                         */
/* ------------------------------------------------------------------ */

export const principals = pgTable(
  "principals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    companyName: text("company_name").notNull(),
    role: text("role").notNull(), // 'VP Operations', 'Founder/CEO', etc.
    linkedinUrl: text("linkedin_url").notNull(),
    followerCountAtIntake: integer("follower_count_at_intake"),
    arrAtIntakeUsd: integer("arr_at_intake_usd"),
    industry: text("industry"),
    telegramChannelId: text("telegram_channel_id")
  },
  (table) => ({
    emailIdx: uniqueIndex("principal_email_idx").on(table.email)
  })
);

/* ------------------------------------------------------------------ */
/* Retainers                                                          */
/* ------------------------------------------------------------------ */

export const retainers = pgTable(
  "retainers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cohortId: uuid("cohort_id").references(() => cohorts.id),
    principalId: uuid("principal_id").references(() => principals.id),
    tier: text("tier").notNull(), // 'founder' | 'operator' | 'director' | 'studio'
    monthlyUsd: integer("monthly_usd").notNull(), // 1490 | 2990 | 4990 | custom
    status: text("status").default("pending").notNull(), // 'pending'|'active'|'paused'|'cancelled'
    startedAt: timestamp("started_at"),
    cancelledAt: timestamp("cancelled_at"),
    annualPrepay: boolean("annual_prepay").default(false),
    cohortSlotsConsumed: integer("cohort_slots_consumed").default(1).notNull(), // Studio = 2
    assignedHeadWriter: text("assigned_head_writer").default("Lila"),
    assignedSeniorWriter: text("assigned_senior_writer"),
    crmConfigJson: jsonb("crm_config_json"), // {provider:'hubspot'|'pipedrive', webhookUrl, fieldMap}
    intentKeywords: text("intent_keywords")
      .array()
      .default([
        "meeting",
        "15 minutes",
        "compare notes",
        "discovery",
        "call"
      ])
  },
  (table) => ({
    cohortStatusIdx: index("retainer_cohort_status_idx").on(
      table.cohortId,
      table.status
    )
  })
);

/* ------------------------------------------------------------------ */
/* Voice Profiles                                                     */
/* ------------------------------------------------------------------ */

export const voiceProfiles = pgTable("voice_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  intakeRecordingUrl: text("intake_recording_url"),
  voiceTicsJson: jsonb("voice_tics_json"), // 8 patterns
  ownedThemesJson: jsonb("owned_themes_json"), // 12 themes
  antiThemesJson: jsonb("anti_themes_json"), // 5 anti-themes
  samplePost: text("sample_post"),
  podcastBio: text("podcast_bio"),
  pdfUrl: text("pdf_url"),
  generatedAt: timestamp("generated_at"),
  lastReviewedAt: timestamp("last_reviewed_at")
});

/* ------------------------------------------------------------------ */
/* Editorial Calls                                                    */
/* ------------------------------------------------------------------ */

export const editorialCalls = pgTable("editorial_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  weekIso: text("week_iso"), // '2026-06-W2'
  heldAt: timestamp("held_at").notNull(),
  missed: boolean("missed").default(false),
  outcomeNotes: text("outcome_notes"),
  draftIdsJson: jsonb("draft_ids_json") // array of draft IDs
});

/* ------------------------------------------------------------------ */
/* Drafts                                                             */
/* ------------------------------------------------------------------ */

export const drafts = pgTable(
  "drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    retainerId: uuid("retainer_id").references(() => retainers.id),
    weekIso: text("week_iso"), // '2026-06-W2'
    scheduledShipAt: timestamp("scheduled_ship_at"),
    status: text("status").default("drafting").notNull(), // 'drafting'|'senior_review'|'head_review'|'awaiting_principal'|'shipped'|'killed'
    bodyMarkdown: text("body_markdown").notNull(),
    draftedBy: text("drafted_by").notNull(), // writer id
    reviewedBy: text("reviewed_by"),
    shippedAt: timestamp("shipped_at"),
    linkedinPostUrl: text("linkedin_post_url"),
    killReason: text("kill_reason")
  },
  (table) => ({
    retainerWeekStatusIdx: index("draft_retainer_week_status_idx").on(
      table.retainerId,
      table.weekIso,
      table.status
    )
  })
);

/* ------------------------------------------------------------------ */
/* Revisions                                                          */
/* ------------------------------------------------------------------ */

export const revisions = pgTable("revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  draftId: uuid("draft_id").references(() => drafts.id),
  fromBody: text("from_body").notNull(),
  toBody: text("to_body").notNull(),
  initiatedBy: text("initiated_by").notNull(), // 'principal' | 'senior_writer' | 'head_writer'
  rationale: text("rationale"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

/* ------------------------------------------------------------------ */
/* Comment Plans                                                      */
/* ------------------------------------------------------------------ */

export const commentPlans = pgTable("comment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  weekIso: text("week_iso"),
  targetAccountCount: integer("target_account_count").notNull(),
  commentsQueued: integer("comments_queued").default(0).notNull(),
  commentsShipped: integer("comments_shipped").default(0).notNull()
});

/* ------------------------------------------------------------------ */
/* Target Accounts                                                    */
/* ------------------------------------------------------------------ */

export const targetAccounts = pgTable("target_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  linkedinUrl: text("linkedin_url").notNull(),
  fullName: text("full_name"),
  role: text("role"),
  company: text("company"),
  addedAt: timestamp("added_at").defaultNow(),
  staleSinceDays: integer("stale_since_days").default(0)
});

/* ------------------------------------------------------------------ */
/* Comments                                                           */
/* ------------------------------------------------------------------ */

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").references(() => commentPlans.id),
    targetAccountId: uuid("target_account_id").references(
      () => targetAccounts.id
    ),
    bodyMarkdown: text("body_markdown").notNull(),
    draftedBy: text("drafted_by").notNull(),
    signedOffBy: text("signed_off_by"), // principal
    shippedAt: timestamp("shipped_at"),
    dwellTimeSec: integer("dwell_time_sec") // tracked client-side at publish
  },
  (table) => ({
    planShippedIdx: index("comment_plan_shipped_idx").on(
      table.planId,
      table.shippedAt
    )
  })
);

/* ------------------------------------------------------------------ */
/* DM Threads                                                         */
/* ------------------------------------------------------------------ */

export const dmThreads = pgTable("dm_threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  counterpartyLinkedinUrl: text("counterparty_linkedin_url").notNull(),
  counterpartyName: text("counterparty_name"),
  counterpartyRole: text("counterparty_role"),
  counterpartyCompany: text("counterparty_company"),
  status: text("status").default("warm").notNull(), // 'warm'|'engaged'|'meeting_booked'|'closed_lost'|'closed_won'
  lastMessageAt: timestamp("last_message_at")
});

/* ------------------------------------------------------------------ */
/* Intent Events                                                      */
/* ------------------------------------------------------------------ */

export const intentEvents = pgTable(
  "intent_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id").references(() => dmThreads.id),
    triggeredBy: text("triggered_by").notNull(), // matched keyword
    rawMessageBody: text("raw_message_body").notNull(),
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
    falsePositive: boolean("false_positive"), // Lila weekly retro flag
    crmSyncedAt: timestamp("crm_synced_at")
  },
  (table) => ({
    detectedFpIdx: index("intent_detected_fp_idx").on(
      table.detectedAt,
      table.falsePositive
    )
  })
);

/* ------------------------------------------------------------------ */
/* Monthly Reports                                                    */
/* ------------------------------------------------------------------ */

export const monthlyReports = pgTable(
  "monthly_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    retainerId: uuid("retainer_id").references(() => retainers.id),
    monthIso: text("month_iso"),
    followersStart: integer("followers_start"),
    followersEnd: integer("followers_end"),
    relationshipsStarted: integer("relationships_started"),
    dmsSent: integer("dms_sent"),
    dmsBecameMeeting: integer("dms_became_meeting"),
    podDetectionFlag: boolean("pod_detection_flag").default(false),
    shippedAt: timestamp("shipped_at")
  },
  (table) => ({
    retainerMonthIdx: index("report_retainer_month_idx").on(
      table.retainerId,
      table.monthIso
    )
  })
);

/* ------------------------------------------------------------------ */
/* Craft Handoffs                                                     */
/* ------------------------------------------------------------------ */

export const craftHandoffs = pgTable("craft_handoffs", {
  id: uuid("id").primaryKey().defaultRandom(),
  retainerId: uuid("retainer_id").references(() => retainers.id),
  packageS3Url: text("package_s3_url"),
  expiresAt: timestamp("expires_at"), // 7-day signed
  shippedAt: timestamp("shipped_at")
});

/* ------------------------------------------------------------------ */
/* Wait List                                                          */
/* ------------------------------------------------------------------ */

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  role: text("role"),
  linkedinUrl: text("linkedin_url"),
  cohortMonthIso: text("cohort_month_iso").notNull(), // which cohort they're waitlisted for
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notified48h: boolean("notified_48h").default(false)
});

/* ------------------------------------------------------------------ */
/* Audit Log                                                          */
/* ------------------------------------------------------------------ */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").notNull(), // writer or principal id
    actorRole: text("actor_role").notNull(), // 'head_writer' | 'senior_writer' | 'principal' | 'admin'
    action: text("action").notNull(), // 'read_voice_profile' | 'create_draft' | 'cancel_retainer' | ...
    resourceType: text("resource_type").notNull(), // 'voice_profile' | 'draft' | 'retainer' | ...
    resourceId: uuid("resource_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    actorTimeIdx: index("audit_actor_time_idx").on(table.actorId, table.createdAt),
    resourceTypeIdx: index("audit_resource_type_idx").on(
      table.resourceType,
      table.createdAt
    )
  })
);

/* ------------------------------------------------------------------ */
/* Auth (NextAuth v5)                                                  */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("principal").notNull(), // 'admin' | 'head_writer' | 'senior_writer' | 'principal'
  emailVerified: timestamp("email_verified"),
  image: text("image")
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state")
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId]
    })
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull()
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull()
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.identifier, table.token] })
  })
);

/* ------------------------------------------------------------------ */
/* Type exports                                                       */
/* ------------------------------------------------------------------ */

export type Cohort = typeof cohorts.$inferSelect;
export type NewCohort = typeof cohorts.$inferInsert;
export type Principal = typeof principals.$inferSelect;
export type NewPrincipal = typeof principals.$inferInsert;
export type Retainer = typeof retainers.$inferSelect;
export type NewRetainer = typeof retainers.$inferInsert;
export type VoiceProfile = typeof voiceProfiles.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type NewDraft = typeof drafts.$inferInsert;
export type Revision = typeof revisions.$inferSelect;
export type CommentPlan = typeof commentPlans.$inferSelect;
export type TargetAccount = typeof targetAccounts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type DMThread = typeof dmThreads.$inferSelect;
export type IntentEvent = typeof intentEvents.$inferSelect;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type CraftHandoff = typeof craftHandoffs.$inferSelect;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type User = typeof users.$inferSelect;
