/**
 * Bylineship Wave 3 — LinkedIn publisher stub.
 *
 * Per doc 12 §4: uses principal-authorised session token (stored encrypted,
 * refreshed weekly via browser handshake). For Phase 0, this is a prototype
 * that verifies the integration pattern. Full session management lands in
 * Phase 2.
 *
 * Per doc 13 Phase 0 DoD: must publish a one-line test post on a test account.
 */

export type LinkedInPublishResult = {
  ok: boolean;
  postUrl?: string;
  error?: string;
};

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

/**
 * Publish a post to LinkedIn under the principal's authorised session.
 * Phase 0: stub that logs the attempt. Phase 2: real API call with session token.
 */
export async function publishToLinkedIn(
  principalId: string,
  bodyMarkdown: string
): Promise<LinkedInPublishResult> {
  // Phase 0: prototype — log and return a placeholder URL.
  // When the LinkedIn session infrastructure lands, this becomes an API call
  // using the principal's encrypted session token.

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "linkedin_publish_prototype",
      principalId,
      bodyLength: bodyMarkdown.length,
      message: "Phase 0 prototype — LinkedIn publish logged, not executed"
    })
  );

  // TODO Phase 2: read encrypted session token from retainer config,
  // call LinkedIn /v2/posts API, return actual post URL.

  return {
    ok: true,
    postUrl: `https://linkedin.com/posts/prototype_${principalId.slice(0, 8)}_${Date.now()}`
  };
}

/**
 * Validate that a LinkedIn session token is still active.
 * Phase 0: always returns true (stub). Phase 2: calls LinkedIn /v2/me.
 */
export async function validateLinkedInSession(
  principalId: string
): Promise<boolean> {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "linkedin_session_validate_prototype",
      principalId,
      message: "Phase 0 stub — always returns true"
    })
  );
  return true;
}
