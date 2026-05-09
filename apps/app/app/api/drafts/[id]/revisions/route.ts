/**
 * Bylineship Wave 3 — Draft revisions endpoints.
 *
 * GET   /api/drafts/:id/revisions — get revision history
 * POST  /api/drafts/:id/revisions — create a revision
 *
 * Per docs/12 (RevisionService) and docs/13 Phase 2 task 4.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDraft } from "@/lib/services/draft-queue";
import {
  createRevision,
  getRevisionsForDraft,
  parseTelegramEdit
} from "@/lib/services/revision-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/drafts/:id/revisions */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const revisions = await getRevisionsForDraft(id);
  return NextResponse.json({ revisions });
}

/** POST /api/drafts/:id/revisions */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: draftId } = await params;

  let body: {
    editMessage?: string;    // Free-text edit request (Telegram reply)
    toBody?: string;         // Direct body replacement
    rationale?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Get current draft
  const draft = await getDraft(draftId);
  if (!draft) {
    return NextResponse.json({ error: "draft_not_found" }, { status: 404 });
  }

  let toBody: string;
  let rationale: string;

  if (body.editMessage) {
    // Parse free-text edit from Telegram reply
    const parsed = parseTelegramEdit(draft.bodyMarkdown, body.editMessage);
    toBody = parsed.toBody;
    rationale = parsed.rationale;
  } else if (body.toBody) {
    toBody = body.toBody;
    rationale = body.rationale || "Direct edit";
  } else {
    return NextResponse.json(
      { error: "missing_fields", message: "Provide editMessage or toBody" },
      { status: 400 }
    );
  }

  const initiatedBy =
    session.user.role === "principal" ? "principal" as const : "senior_writer" as const;

  const revision = await createRevision({
    draftId,
    fromBody: draft.bodyMarkdown,
    toBody,
    initiatedBy,
    rationale
  });

  return NextResponse.json({ revision }, { status: 201 });
}
