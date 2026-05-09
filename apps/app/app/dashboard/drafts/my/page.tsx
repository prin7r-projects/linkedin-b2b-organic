/**
 * Bylineship Wave 3 — Principal's draft view.
 *
 * /dashboard/drafts/my
 *
 * Shows the principal's own drafts. The primary review surface is
 * Telegram — this page is for reference and searching history.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyDraftsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, name, email } = session.user;

  return (
    <div className="mx-auto max-w-prose px-6 py-16">
      <div className="mb-10">
        <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink">
          My Drafts
        </h1>
        <p className="text-graphite text-sm font-mono tracking-mono-caps uppercase mt-1">
          {name || email} · {role}
        </p>
        <p className="text-slate text-base mt-4 max-w-column">
          Your primary review surface is Telegram — drafts land there with{' '}
          <strong>Ship</strong> and <strong>Edit</strong> buttons for one-tap review.
          This page shows your draft history and current queue.
        </p>
      </div>

      <div className="space-y-6">
        {/* Awaiting sign-off */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Awaiting Your Review
          </h2>
          <div className="dash-card p-6">
            <p className="text-ash text-sm font-mono tracking-mono-caps">
              Drafts awaiting your Telegram review — fetched from API
            </p>
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-fog w-2/3" />
              <div className="h-4 bg-fog w-1/2" />
            </div>
          </div>
        </section>

        {/* Recently shipped */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Your Published Posts
          </h2>
          <div className="dash-card p-6">
            <p className="text-ash text-sm font-mono tracking-mono-caps">
              Published posts — fetched from API when LinkedIn integration is live
            </p>
          </div>
        </section>

        {/* Revision history */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Revision History
          </h2>
          <div className="dash-card p-6">
            <p className="text-slate text-sm">
              Every edit you request via Telegram is stored as a revision.
              Changes are tracked: before → after, with rationale.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
