/**
 * Bylineship Wave 3 — sign-in page.
 *
 * Simple email-first login. The actual magic-link flow is handled by
 * NextAuth's built-in email provider pages.
 */

import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ verify?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const sp = await props.searchParams;
  const isVerify = sp.verify === "1";
  const isError = sp.error === "1";

  if (isVerify) {
    return (
      <div className="mx-auto max-w-column px-6 py-32 text-center">
        <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink mb-4">
          Check your inbox
        </h1>
        <p className="text-slate text-lg max-w-md mx-auto">
          We've sent a magic link to your email. Click the link to sign in.
          The link expires in 10 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-column px-6 py-32">
      <h1 className="font-inter font-bold text-3xl tracking-[-0.016em] text-ink mb-2 text-center">
        Sign in to Bylineship
      </h1>
      <p className="text-graphite text-center mb-8">
        Writers' Room access for retained principals and the Bylineship team.
      </p>

      {isError && (
        <div className="bg-rust/10 border border-rust/20 p-4 mb-6">
          <p className="text-rust text-sm">
            There was a problem signing you in. Please try again or email
            writers@linkedin-b2b-organic.prin7r.com.
          </p>
        </div>
      )}

      <form
        action={async (formData) => {
          "use server";
          await signIn("resend", {
            email: formData.get("email") as string,
            redirectTo: "/"
          });
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="maya@hercompany.com"
            className="w-full px-4 py-3 border border-silver-mist bg-canvas text-ink placeholder:text-ash focus:border-ink focus:outline-none text-base"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-ink text-white font-medium text-sm hover:bg-ink/90 transition-colors"
        >
          Send magic link →
        </button>
      </form>

      <p className="text-graphite text-sm text-center mt-8">
        Not a retainer?{" "}
        <a
          href="https://linkedin-b2b-organic.prin7r.com"
          className="text-cobalt-link hover:underline"
        >
          Learn about Bylineship →
        </a>
      </p>
    </div>
  );
}
