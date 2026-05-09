/**
 * Bylineship Wave 3 — POST /api/retainers/:id/voice-profile
 *
 * Head writer authors the 12-page voice profile via dashboard form.
 * Generates PDF, uploads to S3, delivers via Telegram to principal.
 *
 * Per docs/12 §3.7 and docs/13 Phase 1 task 5.
 * Auth: head_writer only.
 */

import { NextResponse } from "next/server";
import { auth, hasRole } from "@/lib/auth";
import { createVoiceProfile } from "@/lib/services/voice-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasRole(session.user.role, "head_writer")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: retainerId } = await params;

  let body: {
    intakeRecordingUrl?: string;
    voiceTics?: string[];
    ownedThemes?: string[];
    antiThemes?: string[];
    samplePost?: string;
    podcastBio?: string;
    week1Calendar?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Validate required fields
  if (
    !body.voiceTics ||
    !body.ownedThemes ||
    !body.antiThemes ||
    !body.samplePost ||
    !body.podcastBio
  ) {
    return NextResponse.json(
      {
        error: "missing_fields",
        message: "voiceTics, ownedThemes, antiThemes, samplePost, and podcastBio are required"
      },
      { status: 400 }
    );
  }

  // Validate counts
  if (body.voiceTics.length !== 8) {
    return NextResponse.json(
      { error: "invalid_count", field: "voiceTics", expected: 8, got: body.voiceTics.length },
      { status: 422 }
    );
  }
  if (body.ownedThemes.length !== 12) {
    return NextResponse.json(
      { error: "invalid_count", field: "ownedThemes", expected: 12, got: body.ownedThemes.length },
      { status: 422 }
    );
  }
  if (body.antiThemes.length !== 5) {
    return NextResponse.json(
      { error: "invalid_count", field: "antiThemes", expected: 5, got: body.antiThemes.length },
      { status: 422 }
    );
  }

  const result = await createVoiceProfile(
    {
      retainerId,
      intakeRecordingUrl: body.intakeRecordingUrl,
      voiceTics: body.voiceTics,
      ownedThemes: body.ownedThemes,
      antiThemes: body.antiThemes,
      samplePost: body.samplePost,
      podcastBio: body.podcastBio,
      week1Calendar: body.week1Calendar || []
    },
    session.user.id,
    session.user.role
  );

  if (!result.ok) {
    const status = result.error === "retainer_not_found" ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
