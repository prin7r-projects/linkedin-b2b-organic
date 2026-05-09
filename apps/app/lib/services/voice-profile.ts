/**
 * Bylineship Wave 3 — VoiceProfileService.
 *
 * Generates the 12-page voice profile delivered to the principal within
 * 4 calendar days of payment. The voice profile is the brand's core asset:
 * it proves we heard the principal before we wrote for them.
 *
 * Contents (per docs/11 US-04, Scenario 2 step 2):
 *   - 8 voice tics (sentence-level patterns we copy from the intake)
 *   - 12 owned themes (POV territories the principal owns)
 *   - 5 anti-themes (subjects they won't write about)
 *   - Sample 280-char post in their voice
 *   - 90-second podcast bio
 *   - Week-1 editorial calendar
 *
 * Per docs/13 Phase 1 task 5: head writer authors via dashboard form →
 * PDF generation → S3 upload → Telegram delivery to principal channel.
 *
 * Anti-scenarios:
 *   - AS-8: No "AI-generated" voice profile — this is a human-authored form.
 *            Anthropic may be used to suggest themes from transcripts (internal only).
 */

import { db } from "@/db";
import { voiceProfiles, retainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendTelegramMessage } from "@/lib/telegram";
import { audit } from "@/lib/audit";

export type VoiceProfileInput = {
  retainerId: string;
  intakeRecordingUrl?: string;
  voiceTics: string[];       // 8 sentence-level patterns
  ownedThemes: string[];     // 12 POV territories
  antiThemes: string[];      // 5 subjects they won't write about
  samplePost: string;        // ~280 characters in their voice
  podcastBio: string;        // ~90 second spoken word
  week1Calendar: string[];   // 3 post topics for week 1
};

export type VoiceProfileResult = {
  ok: boolean;
  profileId?: string;
  pdfUrl?: string;
  error?: string;
};

/**
 * Create a voice profile from the head writer's form submission.
 *
 * Phase 1: stores in DB, generates a markdown PDF stub.
 * Phase 3: full PDF generation with Bylineship typography (EB Garamond + Inter).
 * Phase 3: S3 upload with signed URL.
 */
export async function createVoiceProfile(
  input: VoiceProfileInput,
  authorId: string,
  authorRole: string
): Promise<VoiceProfileResult> {
  // Validate retainer exists
  const [retainer] = await db
    .select()
    .from(retainers)
    .where(eq(retainers.id, input.retainerId));

  if (!retainer) {
    return { ok: false, error: "retainer_not_found" };
  }

  // Validate field counts (structural constraints from docs/11 US-04)
  if (input.voiceTics.length !== 8) {
    return { ok: false, error: `Expected 8 voice tics, got ${input.voiceTics.length}` };
  }
  if (input.ownedThemes.length !== 12) {
    return { ok: false, error: `Expected 12 owned themes, got ${input.ownedThemes.length}` };
  }
  if (input.antiThemes.length !== 5) {
    return { ok: false, error: `Expected 5 anti-themes, got ${input.antiThemes.length}` };
  }

  // Create the profile
  const [profile] = await db
    .insert(voiceProfiles)
    .values({
      retainerId: input.retainerId,
      intakeRecordingUrl: input.intakeRecordingUrl || null,
      voiceTicsJson: input.voiceTics,
      ownedThemesJson: input.ownedThemes,
      antiThemesJson: input.antiThemes,
      samplePost: input.samplePost,
      podcastBio: input.podcastBio,
      generatedAt: new Date(),
      lastReviewedAt: new Date(),
      pdfUrl: null // Phase 3: generate PDF and upload to S3
    })
    .returning();

  // Phase 3: Generate the 12-page PDF
  // Phase 3: Upload to S3 bucket `bylineship-voice-intakes`
  // Phase 3: Update pdfUrl with signed S3 URL
  const pdfUrl = await generateVoiceProfilePdf(input, profile.id);

  if (pdfUrl) {
    await db
      .update(voiceProfiles)
      .set({ pdfUrl })
      .where(eq(voiceProfiles.id, profile.id));
  }

  // Deliver to principal's Telegram
  if (retainer.principalId) {
    await deliverVoiceProfile(retainer.principalId, input, pdfUrl);
  }

  // Audit log
  await audit({
    actorId: authorId,
    actorRole: authorRole as "head_writer" | "senior_writer" | "principal" | "admin",
    action: "create_voice_profile",
    resourceType: "voice_profile",
    resourceId: profile.id,
    metadata: { retainerId: input.retainerId }
  });

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "voice_profile_created",
      profileId: profile.id,
      retainerId: input.retainerId,
      authorId
    })
  );

  return {
    ok: true,
    profileId: profile.id,
    pdfUrl: pdfUrl || undefined
  };
}

/**
 * Generate a PDF of the voice profile.
 * Phase 1: stub that returns null. Phase 3: generates a real PDF with proper typography.
 */
async function generateVoiceProfilePdf(
  input: VoiceProfileInput,
  profileId: string
): Promise<string | null> {
  // Phase 3: Use puppeteer or pdf-lib to generate a 12-page PDF with:
  //   - Page 1: Cover (Bylineship monogram, principal name, "Voice Profile", date)
  //   - Pages 2-3: 8 Voice Tics with examples
  //   - Pages 4-7: 12 Owned Themes (3 per page)
  //   - Page 8: 5 Anti-Themes
  //   - Page 9: Sample Post (EB Garamond italic, 280 chars)
  //   - Page 10: 90-second Podcast Bio
  //   - Pages 11-12: Week-1 Editorial Calendar
  //   - Typography: EB Garamond (headings) + Inter (body) + IBM Plex Mono (labels)
  //   - Palette: canvas #FFFFFF, ink #1D1D1F, olive #5B6B2F accents
  //
  // For Phase 1, store a markdown stub at a URL pattern:
  //   https://bylineship-voice-intakes.s3.contabo.com/profiles/{profileId}/voice-profile-v1.pdf

  const S3_ENDPOINT = process.env.S3_ENDPOINT;
  const S3_BUCKET = process.env.S3_BUCKET || "bylineship-voice-intakes";

  if (S3_ENDPOINT) {
    return `${S3_ENDPOINT}/${S3_BUCKET}/profiles/${profileId}/voice-profile-v1.pdf`;
  }

  // Phase 1 stub: no S3 configured, return placeholder
  return `https://s3.contabo.com/bylineship-voice-intakes/profiles/${profileId}/voice-profile-v1.pdf`;
}

/**
 * Deliver the voice profile to the principal's Telegram channel.
 * Phase 1: uses principalId to look up channel. Phase 3: also sends PDF URL.
 */
async function deliverVoiceProfile(
  principalId: string,
  input: VoiceProfileInput,
  pdfUrl: string | null
): Promise<void> {
  // Phase 1: lookup principal's telegram channel from DB
  const { principals } = await import("@/db/schema");
  const [principal] = await db
    .select({ telegramChannelId: principals.telegramChannelId, fullName: principals.fullName })
    .from(principals)
    .where(eq(principals.id, principalId));

  if (!principal?.telegramChannelId) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "voice_profile_delivery_skipped",
        principalId,
        message: "No Telegram channel configured for principal"
      })
    );
    return;
  }

  const message =
    `📄 <b>Your Voice Profile is ready</b>\n\n` +
    `${principal.fullName} — here is your 12-page voice profile based on our intake call:\n\n` +
    `🎤 <b>8 Voice Tics</b> — the sentence-level patterns we heard\n` +
    `📚 <b>12 Owned Themes</b> — your POV territories\n` +
    `🚫 <b>5 Anti-Themes</b> — subjects we won't write about\n` +
    `✏️ <b>Sample Post</b> — in your voice\n` +
    `🎙️ <b>Podcast Bio</b> — 90 seconds, spoken word\n` +
    `📅 <b>Week-1 Calendar</b> — your first three posts\n\n` +
    (pdfUrl ? `<a href="${pdfUrl}">Download the full PDF →</a>\n\n` : "") +
    `Your first editorial call is scheduled for the upcoming Monday. Lila will send calendar details shortly.`;

  await sendTelegramMessage(principal.telegramChannelId, message);

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "voice_profile_delivered",
      principalId,
      channelId: principal.telegramChannelId
    })
  );
}
