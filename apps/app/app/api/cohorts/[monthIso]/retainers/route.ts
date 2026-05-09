/**
 * Bylineship Wave 3 — cohorts/:monthIso/retainers route.
 * POST /api/cohorts/:monthIso/retainers — create retainer (see cohorts/route.ts)
 */

import { NextResponse } from "next/server";
import { createRetainer } from "../../route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ monthIso: string }> }
) {
  const { monthIso } = await params;
  return createRetainer(request, monthIso);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ monthIso: string }> }
) {
  const { monthIso } = await params;
  const { db } = await import("@/db");
  const { cohorts } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const { auth } = await import("@/lib/auth");

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [cohort] = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.monthIso, monthIso));

  if (!cohort) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ cohort });
}
