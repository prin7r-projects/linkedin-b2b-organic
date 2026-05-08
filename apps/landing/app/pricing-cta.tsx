"use client";

/**
 * [BYLINESHIP_PRICING_CTA] Client island for each pricing-tier "Take retainer" button.
 *
 * Posts to /api/checkout/nowpayments and redirects to the hosted invoice URL.
 * Falls back to a mailto when JS is disabled (the partner-CTA in
 * the footer covers that audience).
 */

import * as React from "react";
import type { PlanId } from "@/lib/nowpayments";

type Props = {
  plan: PlanId;
  label: string;
  variant?: "default" | "ghost";
  fullWidth?: boolean;
};

type State =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "error"; message: string };

export function PricingCta({ plan, label, variant = "default", fullWidth = false }: Props) {
  const [state, setState] = React.useState<State>({ kind: "idle" });

  async function takeTier() {
    if (state.kind === "pending") return;
    setState({ kind: "pending" });
    try {
      const response = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = (await response.json()) as { invoice_url?: string; message?: string };
      if (response.ok && data.invoice_url) {
        window.location.assign(data.invoice_url);
        return;
      }
      const message =
        data?.message ??
        "We couldn't open the invoice. Email writers@linkedin-b2b-organic.prin7r.com and the head writer will hand-wire it.";
      setState({ kind: "error", message });
    } catch {
      setState({
        kind: "error",
        message:
          "Network error. Try once more, or email writers@linkedin-b2b-organic.prin7r.com and the head writer will hand-wire it."
      });
    }
  }

  const baseClass =
    variant === "ghost"
      ? "inline-flex items-center justify-center gap-2 h-12 px-6 text-[16px] font-medium border border-silver-mist text-ink bg-transparent hover:bg-fog hover:border-graphite transition-opacity duration-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-azure rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      : "inline-flex items-center justify-center gap-2 h-12 px-6 text-[16px] font-medium border border-obsidian bg-obsidian text-snow hover:opacity-88 transition-opacity duration-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-azure rounded-full disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <button
        type="button"
        onClick={takeTier}
        disabled={state.kind === "pending"}
        aria-label={`${label} — pay first month via NOWPayments hosted invoice`}
        className={`${baseClass} ${fullWidth ? "w-full" : ""}`}
      >
        {state.kind === "pending" ? "Opening invoice…" : label}
      </button>
      {state.kind === "error" ? (
        <p className="mt-3 text-[13px] text-rust">
          {state.message}{" "}
          <a className="underline decoration-1 underline-offset-2" href="mailto:writers@linkedin-b2b-organic.prin7r.com">
            Email the head writer.
          </a>
        </p>
      ) : null}
    </div>
  );
}
