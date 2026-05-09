/**
 * Bylineship Wave 3 — GET /api/retainers/:id
 *
 * Returns full retainer details for authorized users:
 *   - Principal: only their own retainer
 *   - Senior writer: only their assigned retainers
 *   - Head writer / admin: any retainer
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { db } from "@/db";
import { retainers, principals } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [retainer] = await db
    .select()
    .from(retainers)
    .where(eq(retainers.id, id));

  if (!retainer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Authorization check
  const isHeadWriter = hasRole(session.user.role, "head_writer");
  const isPrincipal = session.user.role === "principal";
  const isSeniorWriter = session.user.role === "senior_writer";

  if (!isHeadWriter && !isPrincipal && !isSeniorWriter) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Principal: only their own retainer
  if (isPrincipal) {
    const [principal] = await db
      .select()
      .from(principals)
      .where(eq(principals.email, session.user.email!));

    if (!principal || principal.id !== retainer.principalId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  // Senior writer: only their assigned retainers
  if (isSeniorWriter && retainer.assignedSeniorWriter !== session.user.email) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Fetch principal details
  const [principal] = retainer.principalId
    ? await db.select().from(principals).where(eq(principals.id, retainer.principalId))
    : [null];

  return NextResponse.json({
    retainer: {
      ...retainer,
      crmConfigJson: retainer.crmConfigJson ? JSON.stringify(retainer.crmConfigJson) : null
    },
    principal: principal
      ? {
          id: principal.id,
          email: principal.email,
          fullName: principal.fullName,
          companyName: principal.companyName,
          role: principal.role,
          linkedinUrl: principal.linkedinUrl
        }
      : null
  });
}
