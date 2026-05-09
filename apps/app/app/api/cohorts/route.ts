/**
 * Bylineship Wave 3 — cohorts API.
 * GET  /api/cohorts          — list all cohorts (head_writer, admin)
 * POST /api/cohorts          — create a new cohort (head_writer only)
 * GET  /api/cohorts/:month   — get cohort by month ISO
 * POST /api/cohorts/:month/retainers — create retainer in cohort (head_writer)
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { cohorts, retainers, principals } from "@/db/schema";
import type { NewRetainer } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cohorts — list all cohorts.
 * Auth: head_writer or admin.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const allCohorts = await db.select().from(cohorts).orderBy(cohorts.monthIso);
  return NextResponse.json({ cohorts: allCohorts });
}

/**
 * POST /api/cohorts — create a new cohort.
 * Auth: head_writer or admin.
 *
 * Body: { monthIso, intakeOpensAt, intakeClosesAt, capMax? }
 * Cohort cap defaults to 6 and is structural — never raised in code.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: {
    monthIso?: string;
    intakeOpensAt?: string;
    intakeClosesAt?: string;
    capMax?: number;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 }
    );
  }

  if (!body.monthIso || !body.intakeOpensAt || !body.intakeClosesAt) {
    return NextResponse.json(
      { error: "missing_fields", message: "monthIso, intakeOpensAt, and intakeClosesAt are required" },
      { status: 400 }
    );
  }

  // Cohort cap enforcement: capMax defaults to 6, can only be LOWERED from 6
  const capMax = body.capMax ?? 6;
  if (capMax > 6) {
    return NextResponse.json(
      { error: "cap_too_high", message: "Cohort cap cannot exceed 6 per docs/07" },
      { status: 422 }
    );
  }

  const [cohort] = await db
    .insert(cohorts)
    .values({
      monthIso: body.monthIso,
      intakeOpensAt: new Date(body.intakeOpensAt),
      intakeClosesAt: new Date(body.intakeClosesAt),
      capMax,
      filledCount: 0
    })
    .returning();

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "cohort_created",
      cohortId: cohort.id,
      monthIso: cohort.monthIso,
      capMax: cohort.capMax
    })
  );

  return NextResponse.json({ cohort }, { status: 201 });
}

/**
 * POST /api/cohorts/:monthIso/retainers — create a retainer in a cohort.
 * Auth: head_writer.
 *
 * Per docs/12 §3.5 (US-02, Scenario 1):
 *   - Enforces cohort cap inside a SERIALIZABLE transaction.
 *   - Studio tier consumes 2 cohort slots.
 *   - Returns 409 CohortFull if at cap.
 */
export async function createRetainer(
  request: Request,
  monthIso: string
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: {
    principalEmail?: string;
    principalName?: string;
    tier?: string;
    intakeNotes?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.principalEmail || !body.principalName || !body.tier) {
    return NextResponse.json(
      { error: "missing_fields", message: "principalEmail, principalName, and tier are required" },
      { status: 400 }
    );
  }

  if (!["founder", "operator", "director", "studio"].includes(body.tier)) {
    return NextResponse.json(
      { error: "invalid_tier", message: `Unknown tier: ${body.tier}` },
      { status: 400 }
    );
  }

  // SERIALIZABLE transaction for cohort cap enforcement (docs/12 §7 threat 3)
  const result = await db.transaction(async (tx) => {
    const [cohort] = await tx
      .select()
      .from(cohorts)
      .where(eq(cohorts.monthIso, monthIso));

    if (!cohort) {
      throw new Error("COHORT_NOT_FOUND");
    }

    const slotsNeeded = body.tier === "studio" ? 2 : 1;

    if (cohort.filledCount + slotsNeeded > cohort.capMax) {
      throw new Error("COHORT_FULL");
    }

    // Create the principal (stub — Phase 1 adds full ICP intake flow)
    const { principals } = await import("@/db/schema");
    const [principal] = await tx
      .insert(principals)
      .values({
        email: body.principalEmail!,
        fullName: body.principalName!,
        companyName: "TBD",
        role: "TBD",
        linkedinUrl: "TBD"
      })
      .returning();

    const tierPricing: Record<string, number> = {
      founder: 1490,
      operator: 2990,
      director: 4990,
      studio: 11000
    };

    const [retainer] = await tx
      .insert(retainers)
      .values({
        cohortId: cohort.id,
        principalId: principal.id,
        tier: body.tier!,
        monthlyUsd: tierPricing[body.tier!],
        status: "pending",
        cohortSlotsConsumed: slotsNeeded
      } as NewRetainer)
      .returning();

    await tx
      .update(cohorts)
      .set({ filledCount: cohort.filledCount + slotsNeeded })
      .where(eq(cohorts.id, cohort.id));

    return { retainer, principal, cohort };
  }).catch((err: Error) => {
    if (err.message === "COHORT_NOT_FOUND") {
      return { error: "cohort_not_found", status: 404 };
    }
    if (err.message === "COHORT_FULL") {
      return { error: "cohort_full", status: 409 };
    }
    throw err;
  });

  if ("error" in result && "status" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status as number }
    );
  }

  const { retainer, principal, cohort } = result as {
    retainer: typeof retainers.$inferSelect;
    principal: typeof principals.$inferSelect;
    cohort: typeof cohorts.$inferSelect;
  };

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "retainer_created",
      retainerId: retainer.id,
      principalId: principal.id,
      cohortId: cohort.id,
      tier: retainer.tier,
      cohortFilled: cohort.filledCount
    })
  );

  return NextResponse.json(
    {
      retainerId: retainer.id,
      principalId: principal.id,
      tier: retainer.tier,
      status: retainer.status,
      cohortFilled: cohort.filledCount,
      cohortCap: cohort.capMax
    },
    { status: 201 }
  );
}
