/**
 * Bylineship Wave 3 — DM Threads API.
 *
 * GET   /api/dm-threads?retainerId=... — list threads
 * POST  /api/dm-threads — create a DM thread
 * PATCH /api/dm-threads/:id — update thread status
 * POST  /api/dm-threads/:id/messages — add a message (triggers intent detection)
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import {
  createDMThread,
  updateDMThreadStatus,
  getDMThreads,
  detectIntent
} from "@/lib/services/dm-book";

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
    return NextResponse.json({ error: "missing_retainerId" }, { status: 400 });
  }

  const threads = await getDMThreads(retainerId);
  return NextResponse.json({ threads });
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
    counterpartyLinkedinUrl?: string;
    counterpartyName?: string;
    counterpartyRole?: string;
    counterpartyCompany?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.retainerId || !body.counterpartyLinkedinUrl) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const thread = await createDMThread({
    retainerId: body.retainerId,
    counterpartyLinkedinUrl: body.counterpartyLinkedinUrl,
    counterpartyName: body.counterpartyName,
    counterpartyRole: body.counterpartyRole,
    counterpartyCompany: body.counterpartyCompany
  });

  return NextResponse.json({ thread }, { status: 201 });
}
