/**
 * Bylineship Wave 3 — dashboard landing page.
 *
 * Simple gate: signed-in users see their dashboard; anonymous users see
 * a login prompt. The real dashboard surfaces land in Phase 2.
 */

import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-column px-6 py-32 text-center">
        <h1 className="font-inter font-bold text-4xl tracking-[-0.016em] text-ink mb-4">
          Bylineship Writers' Room
        </h1>
        <p className="text-slate text-lg max-w-md mx-auto mb-8">
          The operator dashboard for retained principals and their writing team.
          Sign in with your email to access your drafts, comment plan, and DM book.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-ink text-white font-medium text-sm hover:bg-ink/90 transition-colors"
        >
          Sign in with email →
        </Link>
      </div>
    );
  }

  const { role, name, email } = session.user;

  return (
    <div className="mx-auto max-w-prose px-6 py-16">
      <div className="dash-card p-8 mb-8">
        <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink mb-2">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="text-graphite text-sm font-mono tracking-mono-caps uppercase mb-6">
          {role} · {email}
        </p>
        <p className="text-slate">
          The full dashboard surfaces — drafts queue, comment plan, DM book,
          and monthly reports — land in subsequent phases. For now, the
          scaffolding is in place.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="dash-card p-6">
          <h3 className="font-inter font-semibold text-sm text-graphite mb-2">
            Status
          </h3>
          <p className="text-ink text-base">
            Phase 0 — Scaffolding active. Core schema, auth, and DB connection
            wired.
          </p>
        </div>
        {role === "head_writer" || role === "senior_writer" ? (
          <div className="dash-card p-6">
            <h3 className="font-inter font-semibold text-sm text-graphite mb-2">
              Writer Tools
            </h3>
            <p className="text-ink text-base">
              Draft queue, comment plan, and editorial call management coming
              in Phase 1–2.
            </p>
          </div>
        ) : null}
        <div className="dash-card p-6">
          <h3 className="font-inter font-semibold text-sm text-graphite mb-2">
            Your Retainer
          </h3>
          <p className="text-ink text-base">
            Voice profile, post history, and monthly reports will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
