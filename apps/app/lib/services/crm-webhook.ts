/**
 * Bylineship Wave 3 — CRM Webhook Router.
 *
 * Routes intent-detected DM messages to the retainer's configured CRM:
 *   - HubSpot: creates contact + deal in "Inbound · LinkedIn" pipeline
 *   - Pipedrive: creates person + deal via webhook URL
 *
 * Per docs/11 US-09 (Scenario 3 step 6) and docs/13 Phase 3 task 7.
 *
 * Config per retainer (retainers.crmConfigJson):
 *   { provider: "hubspot" | "pipedrive", webhookUrl?: string,
 *     hubspotPortalId?: string, fieldMap?: Record<string, string> }
 */

import { db } from "@/db";
import { retainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CRMPayload = {
  threadId: string;
  keyword: string;
  messageBody: string;
  counterpartyName: string | null;
  counterpartyRole: string | null;
  counterpartyCompany: string | null;
  detectedAt: string;
};

/**
 * Fire the CRM webhook for a retainer when intent is detected.
 * HubSpot: creates a deal in "Inbound · LinkedIn" pipeline.
 * Pipedrive: POSTs to the retainer's webhook URL.
 */
export async function fireCrmWebhook(
  retainerId: string,
  payload: CRMPayload
): Promise<void> {
  const [retainer] = await db
    .select({ crmConfigJson: retainers.crmConfigJson })
    .from(retainers)
    .where(eq(retainers.id, retainerId));

  if (!retainer?.crmConfigJson) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "crm_webhook_skipped",
        retainerId,
        reason: "no_crm_config"
      })
    );
    return;
  }

  const config = retainer.crmConfigJson as {
    provider?: string;
    webhookUrl?: string;
    hubspotPortalId?: string;
    fieldMap?: Record<string, string>;
  };

  switch (config.provider) {
    case "hubspot":
      await fireHubspotWebhook(config, payload);
      break;
    case "pipedrive":
      await firePipedriveWebhook(config, payload);
      break;
    default:
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "warn",
          event: "crm_webhook_unknown_provider",
          retainerId,
          provider: config.provider
        })
      );
  }
}

async function fireHubspotWebhook(
  config: { hubspotPortalId?: string; webhookUrl?: string },
  payload: CRMPayload
): Promise<void> {
  const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "crm_hubspot_not_configured",
        message: "HUBSPOT_ACCESS_TOKEN not set"
      })
    );
    return;
  }

  try {
    // Create or update contact
    const contactPayload = {
      properties: {
        firstname: payload.counterpartyName?.split(" ")[0] || "Unknown",
        lastname: payload.counterpartyName?.split(" ").slice(1).join(" ") || "",
        jobtitle: payload.counterpartyRole || "",
        company: payload.counterpartyCompany || ""
      }
    };

    const contactRes = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        },
        body: JSON.stringify(contactPayload)
      }
    );

    const contact = (await contactRes.json()) as { id?: string };

    // Create deal in "Inbound · LinkedIn" pipeline
    if (contact.id) {
      const dealPayload = {
        properties: {
          dealname: `LinkedIn DM — ${payload.counterpartyName} (${payload.keyword})`,
          pipeline: "inbound_linkedin",
          dealstage: "discovery_booked",
          amount: "0",
          closedate: new Date().toISOString().split("T")[0]
        },
        associations: [
          {
            to: { id: contact.id },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }]
          }
        ]
      };

      await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        },
        body: JSON.stringify(dealPayload)
      });
    }

    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "crm_hubspot_webhook_fired",
        contactId: contact.id,
        keyword: payload.keyword
      })
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "crm_hubspot_webhook_failed",
        error: (err as Error).message
      })
    );
  }
}

async function firePipedriveWebhook(
  config: { webhookUrl?: string },
  payload: CRMPayload
): Promise<void> {
  if (!config.webhookUrl) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "crm_pipedrive_no_url",
        message: "Pipedrive webhook URL not configured"
      })
    );
    return;
  }

  try {
    await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "linkedin_intent_detected",
        counterparty: {
          name: payload.counterpartyName,
          role: payload.counterpartyRole,
          company: payload.counterpartyCompany
        },
        keyword: payload.keyword,
        messagePreview: payload.messageBody.slice(0, 200),
        detectedAt: payload.detectedAt
      })
    });

    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "crm_pipedrive_webhook_fired",
        keyword: payload.keyword
      })
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "crm_pipedrive_webhook_failed",
        error: (err as Error).message
      })
    );
  }
}
