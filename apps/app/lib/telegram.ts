/**
 * Bylineship Wave 3 — Telegram bot client.
 *
 * Outbound: sends draft previews, sign-off prompts, monthly reports.
 * Inbound: receives /ship, /edit, and free-text revision replies from
 *   the principal's Telegram channel.
 *
 * Per doc 12 §4: Telegram Bot API with optional email fallback (EC-10).
 * Per doc 13 Phase 0 DoD: Telegram round-trip must deliver and receive.
 */

export type TelegramSendResult = {
  ok: boolean;
  messageId?: number;
  error?: string;
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = "https://api.telegram.org";

async function telegramApi(
  method: string,
  body: Record<string, unknown>
): Promise<Response> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  const url = `${TELEGRAM_API_BASE}/bot${TELEGRAM_BOT_TOKEN}/${method}`;
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });
}

/**
 * Send a markdown message to a principal's Telegram channel.
 * Includes inline keyboard buttons for Ship and Edit actions.
 */
export async function sendDraftForSignoff(
  channelId: string,
  draftId: string,
  bodyMarkdown: string,
  retainerName: string
): Promise<TelegramSendResult> {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Ship", callback_data: `ship:${draftId}` },
        { text: "✏️ Edit", callback_data: `edit:${draftId}` }
      ]
    ]
  };

  try {
    const res = await telegramApi("sendMessage", {
      chat_id: channelId,
      text: `*${retainerName} — draft for your review*\n\n${bodyMarkdown}`,
      parse_mode: "Markdown",
      reply_markup: keyboard,
      disable_web_page_preview: true
    });

    const json = await res.json() as Record<string, unknown>;
    if (!json.ok) {
      return { ok: false, error: (json.description as string) || "unknown" };
    }
    return {
      ok: true,
      messageId: (json.result as Record<string, unknown>)?.message_id as number
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Send a plain message to a principal's Telegram channel.
 */
export async function sendTelegramMessage(
  channelId: string,
  text: string
): Promise<TelegramSendResult> {
  try {
    const res = await telegramApi("sendMessage", {
      chat_id: channelId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    });

    const json = await res.json() as Record<string, unknown>;
    if (!json.ok) {
      return { ok: false, error: (json.description as string) || "unknown" };
    }
    return {
      ok: true,
      messageId: (json.result as Record<string, unknown>)?.message_id as number
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Generate an HMAC-signed one-click signoff link (EC-10 fallback).
 * 24h TTL. Used when Telegram is down >30 min.
 */
export function generateSignoffToken(draftId: string, principalId: string): string {
  const crypto = require("node:crypto");
  const secret = process.env.SIGNOFF_SECRET || "dev-secret-change-me";
  const payload = `${draftId}:${principalId}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}
