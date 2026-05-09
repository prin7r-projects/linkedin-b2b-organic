/**
 * Bylineship Wave 3 — database seeder for local development.
 *
 * Creates a sample cohort, principal, retainer, and three drafts.
 * Run: `npx tsx db/seed.ts`
 *
 * Only writes if the tables are empty.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { cohorts, principals, retainers, drafts, targetAccounts } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const dbUrl: string = DATABASE_URL;

async function main() {
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  // Check if already seeded
  const existingCohorts = await db.select().from(cohorts);
  if (existingCohorts.length > 0) {
    console.log("Database already seeded. Skipping.");
    await client.end();
    process.exit(0);
  }

  console.log("Seeding database...");

  // Create a cohort
  const [cohort] = await db
    .insert(cohorts)
    .values({
      monthIso: "2026-06",
      intakeOpensAt: new Date("2026-06-01T00:00:00Z"),
      intakeClosesAt: new Date("2026-06-05T23:59:59Z"),
      capMax: 6,
      filledCount: 0
    })
    .returning();
  console.log(`Created cohort: ${cohort.id} (${cohort.monthIso})`);

  // Create a sample principal (Maya, the operations VP)
  const [principal] = await db
    .insert(principals)
    .values({
      email: "maya@example.com",
      fullName: "Maya Rodriguez",
      companyName: "Stackpoint Inc.",
      role: "VP Operations",
      linkedinUrl: "https://linkedin.com/in/mayarodriguez",
      followerCountAtIntake: 2400,
      arrAtIntakeUsd: 25_000_000,
      industry: "B2B SaaS / DevOps"
    })
    .returning();
  console.log(`Created principal: ${principal.id} (${principal.fullName})`);

  // Create a retainer for Maya
  const [retainer] = await db
    .insert(retainers)
    .values({
      cohortId: cohort.id,
      principalId: principal.id,
      tier: "operator",
      monthlyUsd: 2990,
      status: "active",
      startedAt: new Date(),
      assignedHeadWriter: "Lila",
      assignedSeniorWriter: "James",
      cohortSlotsConsumed: 1
    })
    .returning();
  console.log(`Created retainer: ${retainer.id} (${retainer.tier})`);

  // Create three sample drafts
  const draftData = [
    {
      retainerId: retainer.id,
      weekIso: "2026-06-W2",
      scheduledShipAt: new Date("2026-06-09T10:00:00Z"),
      status: "awaiting_principal" as const,
      bodyMarkdown:
        "Last week our CFO asked me how we'd cut renewal-cycle time without hiring.\n\nI gave her the wrong answer.\n\nThe right answer turned out to be one Slack message to the engineering lead and a 15-minute whiteboard session. Not a project. Not a hire. Not a six-month process.\n\nThis is the management pattern I've been chasing for two years: the thing you think needs a process actually needs a conversation.",
      draftedBy: "James"
    },
    {
      retainerId: retainer.id,
      weekIso: "2026-06-W2",
      scheduledShipAt: new Date("2026-06-11T10:00:00Z"),
      status: "drafting" as const,
      bodyMarkdown: "The hardest person to manage is the one who was you five years ago.\n\nDraft in progress...",
      draftedBy: "James"
    },
    {
      retainerId: retainer.id,
      weekIso: "2026-06-W2",
      scheduledShipAt: new Date("2026-06-13T10:00:00Z"),
      status: "drafting" as const,
      bodyMarkdown: "We killed a feature last week that had 47 enterprise customers on it.\n\nZero churned.\n\nDraft in progress...",
      draftedBy: "Lila"
    }
  ];

  for (const draft of draftData) {
    const [created] = await db.insert(drafts).values(draft).returning();
    console.log(`Created draft: ${created.id} (${created.status})`);
  }

  // Create 3 sample target accounts
  const targets = [
    {
      retainerId: retainer.id,
      linkedinUrl: "https://linkedin.com/in/cio-target-1",
      fullName: "Sarah Chen",
      role: "CIO",
      company: "Meridian Health Systems"
    },
    {
      retainerId: retainer.id,
      linkedinUrl: "https://linkedin.com/in/cfo-target-2",
      fullName: "Marcus Webb",
      role: "CFO",
      company: "Apex Manufacturing"
    },
    {
      retainerId: retainer.id,
      linkedinUrl: "https://linkedin.com/in/vp-target-3",
      fullName: "Elena Torres",
      role: "VP Platform Engineering",
      company: "Nova Systems"
    }
  ];

  for (const target of targets) {
    const [created] = await db.insert(targetAccounts).values(target).returning();
    console.log(`Created target account: ${created.id} (${created.fullName})`);
  }

  await db
    .update(cohorts)
    .set({ filledCount: 1 })
    .where(eq(cohorts.id, cohort.id));

  console.log("Seeding complete.");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
