import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bylineship — done-for-you LinkedIn for B2B founders. Ghostwritten posts, comment work, DMs that become calls.",
  description:
    "Bylineship is a literary agency for LinkedIn B2B. We ghostwrite three posts a week in your voice, run an editorial comment plan on 50 target accounts, and route DMs into your CRM. Founder $1,490/mo, Operator $2,990/mo, Director $4,990/mo. Paid in USDT/USDC via NOWPayments.",
  metadataBase: new URL("https://linkedin-b2b-organic.prin7r.com"),
  openGraph: {
    title: "Bylineship — a literary agency for B2B LinkedIn",
    description:
      "Three ghostwritten posts a week, an editorial comment plan, and a DM book that lands meetings. No engagement pods. No bots. No clickbait hooks.",
    url: "https://linkedin-b2b-organic.prin7r.com",
    siteName: "Bylineship",
    type: "website"
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#hero" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
