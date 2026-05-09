/**
 * Bylineship Wave 3 — New draft page (writers).
 *
 * /dashboard/drafts/new
 *
 * Simple form to create a draft for a specific retainer.
 */

import { auth, hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewDraftPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasRole(session.user.role, "senior_writer")) {
    return (
      <div className="mx-auto max-w-column px-6 py-32 text-center">
        <h1 className="font-inter font-bold text-2xl text-ink mb-2">Access Denied</h1>
        <p className="text-slate">Only writers can create drafts.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-prose px-6 py-16">
      <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink mb-8">
        New Draft
      </h1>

      <form className="space-y-6">
        {/* Retainer selector — Phase 2: populated from API */}
        <div>
          <label className="block text-sm font-medium text-slate mb-1">
            Retainer
          </label>
          <select
            name="retainerId"
            className="w-full px-4 py-3 border border-silver-mist bg-canvas text-ink focus:border-ink focus:outline-none text-base"
          >
            <option value="">Select a retainer...</option>
            <option value="placeholder" disabled>— populated from GET /api/retainers —</option>
          </select>
        </div>

        {/* Week selector */}
        <div>
          <label className="block text-sm font-medium text-slate mb-1">
            Week
          </label>
          <input
            name="weekIso"
            type="text"
            placeholder="2026-06-W2"
            className="w-full px-4 py-3 border border-silver-mist bg-canvas text-ink placeholder:text-ash focus:border-ink focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Ship date */}
        <div>
          <label className="block text-sm font-medium text-slate mb-1">
            Scheduled Ship Date
          </label>
          <input
            name="scheduledShipAt"
            type="datetime-local"
            className="w-full px-4 py-3 border border-silver-mist bg-canvas text-ink focus:border-ink focus:outline-none"
          />
        </div>

        {/* Draft body */}
        <div>
          <label className="block text-sm font-medium text-slate mb-1">
            Draft Body (Markdown)
          </label>
          <textarea
            name="bodyMarkdown"
            rows={12}
            placeholder="Write the draft here. Markdown formatting is supported. The post should open with a concrete artifact — a number, a meeting, a calendar entry."
            className="w-full px-4 py-3 border border-silver-mist bg-manuscript text-ink placeholder:text-ash focus:border-ink focus:outline-none font-garamond text-lg leading-relaxed resize-y"
          />
          <p className="text-graphite text-xs mt-1 font-mono tracking-mono-caps">
            Per brand rules: no hooks, no lists with bullets, no manufactured controversy.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-ink text-white font-medium text-sm hover:bg-ink/90 transition-colors"
        >
          Save Draft
        </button>
      </form>
    </div>
  );
}
