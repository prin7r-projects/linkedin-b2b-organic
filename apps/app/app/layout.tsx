import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bylineship — Writers' Room",
  description:
    "The Bylineship operator dashboard. For retained principals and their writing team.",
  robots: "noindex, nofollow" // internal dashboard — not for search
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-silver-mist px-6 py-4">
          <div className="mx-auto max-w-prose flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              {/* Bylineship logo monogram */}
              <svg viewBox="0 0 64 64" width="32" height="32" role="img" aria-label="Bylineship">
                <rect width="64" height="64" rx="2" fill="#1D1D1F" />
                <text
                  x="32" y="40" textAnchor="middle"
                  fontFamily="EB Garamond, serif"
                  fontWeight="800" fontSize="36"
                  fill="#FAFAF8"
                >
                  B
                </text>
                <rect x="14" y="49" width="36" height="2" fill="#5B6B2F" />
              </svg>
              <span className="font-garamond font-semibold text-xl text-ink">
                Bylineship
                <span className="text-olive">.</span>
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm font-medium text-graphite">
              <a href="/login" className="hover:text-ink transition-colors">
                Sign in
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
