/**
 * Bylineship Wave 3 — Target Accounts API.
 *
 * GET    /api/target-accounts?retainerId=... — list target accounts
 * POST   /api/target-accounts — add a target account
 * DELETE /api/target-accounts/:id — remove a target account
 *
 * Per docs/13 Phase 3 task 1.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import {
  addTargetAccount,
  getTargetAccounts,
  removeTargetAccount,
  markTargetAccountStale
} from "@/lib/services/comment-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const retainerId = url.searchParams.get("retainerId");
  if (!retainerId) {
    return NextResponse.json(
      { error: "missing_retainerId" },
      { status: 400 }
    );
  }

  const accounts = await getTargetAccounts(retainerId);
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "senior_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: {
    retainerId?: string;
    linkedinUrl?: string;
    fullName?: string;
    role?: string;
    company?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.retainerId || !body.linkedinUrl) {
    return NextResponse.json(
      { error: "missing_fields" },
      { status: 400 }
    );
  }

  const account = await addTargetAccount(
    {
      retainerId: body.retainerId,
      linkedinUrl: body.linkedinUrl,
      fullName: body.fullName,
      role: body.role,
      company: body.company
    },
    session.user.id
  );

  return NextResponse.json({ account }, { status: 201 });
}
