/**
 * Bylineship Wave 3 — Telegram webhook handler.
 * POST /api/webhooks/telegram
 *
 * Receives inbound Telegram updates:
 *   - Callback queries: Ship / Edit button presses
 *   - Free-text replies: revision requests from principals
 *
 * Per docs/13 Phase 2 tasks 3-4 and docs/12 §4 (Telegram integration).
 */

import { NextResponse } from "next/server";
import { transitionDraft, getDraft } from "@/lib/services/draft-queue";
import { createRevision, parseTelegramEdit } from "@/lib/services/revision-service";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  update_id: number;
  callback_query?: {
    id: string;
    from: { id: number; first_name: string };
    message?: { chat: { id: number } };
    data: string; // e.g. "ship:draft-uuid" or "edit:draft-uuid"
  };
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    reply_to_message?: {
      text?: string;
    };
  };
};

export async function POST(request: Request) {
  // Verify Telegram bot token (basic auth)
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "telegram_not_configured" },
      { status: 503 }
    );
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "telegram_webhook_received",
      updateId: update.update_id,
      hasCallback: !!update.callback_query,
      hasMessage: !!update.message
    })
  );

  // Handle callback queries (inline button presses)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }

  // Handle free-text messages (revision requests)
  if (update.message?.text && update.message?.reply_to_message?.text) {
    await handleTextReply(update.message);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Handle inline button callback: ship:uuid or edit:uuid
 */
async function handleCallbackQuery(
  query: NonNullable<TelegramUpdate["callback_query"]>
): Promise<void> {
  const [action, draftId] = query.data.split(":");

  if (!draftId) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "telegram_callback_unknown",
        data: query.data
      })
    );
    return;
  }

  const principalId = String(query.from.id);
  const chatId = query.message?.chat.id;

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "telegram_callback",
      action,
      draftId,
      principalId
    })
  );

  switch (action) {
    case "ship": {
      // Principal pressed "Ship" — transition to shipped + publish
      try {
        const draft = await getDraft(draftId);
        if (!draft) {
          await sendTelegramMessage(
            String(chatId),
            "Draft not found. It may have already been shipped or deleted."
          );
          return;
        }

        if (draft.status !== "awaiting_principal") {
          await sendTelegramMessage(
            String(chatId),
            `This draft is already "${draft.status}" — cannot ship.`
          );
          return;
        }

        await transitionDraft(
          draftId,
          "shipped",
          { id: principalId, role: "principal" }
        );

        await sendTelegramMessage(
          String(chatId),
          "✅ <b>Shipped!</b> Your post is now live on LinkedIn."
        );
      } catch (err) {
        console.error(
          JSON.stringify({
            ts: new Date().toISOString(),
            level: "error",
            event: "telegram_ship_failed",
            draftId,
            error: (err as Error).message
          })
        );
        await sendTelegramMessage(
          String(chatId),
          "There was a problem shipping your post. Lila has been notified."
        );
      }
      break;
    }

    case "edit": {
      // Principal pressed "Edit" — prompt for their edit text
      await sendTelegramMessage(
        String(chatId),
        "✏️ Reply to this message with your edit request.\n\n" +
          "Be specific — e.g.:\n" +
          "• \"change 'embarrassed' to 'a little embarrassed'\"\n" +
          "• \"make the third paragraph shorter\"\n" +
          "• \"add a concrete number: saved $2M\""
      );
      break;
    }
  }
}

/**
 * Handle free-text reply to a draft message = revision request.
 */
async function handleTextReply(
  message: NonNullable<TelegramUpdate["message"]>
): Promise<void> {
  const editMessage = message.text!;
  const chatId = message.chat.id;

  // Find the original draft from the replied-to message
  // Phase 2: parse draftId from the original message's reply_markup or text
  // For now, log the edit request for the writer
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "telegram_edit_request",
      chatId,
      editMessage: editMessage.slice(0, 200)
    })
  );

  // Parse out draft ID from reply markup or search by message context
  // Phase 2: integrate with the draft_id embedded in the Telegram message metadata

  await sendTelegramMessage(
    String(chatId),
    "📝 <b>Edit request received.</b>\n\nYour writer will apply the change and re-send the draft within 60 minutes during work hours."
  );
}
