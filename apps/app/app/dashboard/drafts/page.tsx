/**
 * Bylineship Wave 3 — Drafts dashboard (writer view).
 *
 * /dashboard/drafts
 *
 * Shows drafts grouped by status:
 *   - Senior writer: sees "drafting" + "senior_review" + "head_review"
 *   - Head writer: sees all, with review actions
 *   - Principal: redirected to /dashboard/drafts/my (their own queue)
 */

import { auth, hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DraftsDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, name } = session.user;
  const isWriter = hasRole(role, "senior_writer");

  if (!isWriter) {
    redirect("/dashboard/drafts/my");
  }

  return (
    <div className="mx-auto max-w-prose px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink">
            Drafts
          </h1>
          <p className="text-graphite text-sm font-mono tracking-mono-caps uppercase mt-1">
            {role === "head_writer" ? "Head Writer Queue" : "Senior Writer Queue"}
          </p>
        </div>
        <Link
          href="/dashboard/drafts/new"
          className="px-5 py-2.5 bg-ink text-white font-medium text-sm hover:bg-ink/90 transition-colors"
        >
          New Draft +
        </Link>
      </div>

      <div className="space-y-8">
        {/* Upcoming queue — drafts assigned to this writer */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Upcoming
          </h2>
          <DraftListSkeleton status="drafting" />
        </section>

        {/* Review queue — drafts needing review */}
        {(role === "head_writer" || role === "senior_writer") && (
          <section>
            <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
              Needs Review
            </h2>
            <DraftListSkeleton status="senior_review" />
          </section>
        )}

        {/* Awaiting principal */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Awaiting Principal Sign-off
          </h2>
          <DraftListSkeleton status="awaiting_principal" />
        </section>

        {/* Recently shipped */}
        <section>
          <h2 className="font-inter font-semibold text-sm text-graphite mb-4 tracking-[-0.010em]">
            Shipped This Week
          </h2>
          <DraftListSkeleton status="shipped" />
        </section>
      </div>
    </div>
  );
}

/**
 * Placeholder draft list. Phase 2: fetches from GET /api/drafts?status=X
 * and renders each draft card with actions.
 */
function DraftListSkeleton({ status }: { status: string }) {
  return (
    <div className="dash-card p-6">
      <p className="text-ash text-sm font-mono tracking-mono-caps">
        {status.replace(/_/g, " ")} — fetch from API (Phase 2 integration)
      </p>
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-fog w-3/4" />
        <div className="h-4 bg-fog w-1/2" />
        <div className="h-4 bg-fog w-5/6" />
      </div>
    </div>
  );
}
