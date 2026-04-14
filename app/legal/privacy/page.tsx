import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "../../components/BackNav";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Scriptids handles information you share with us.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Privacy policy
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="mt-8 max-w-none space-y-4 text-sm leading-relaxed text-[var(--foreground)]">
        <p className="text-[var(--muted)]">
          This is a starter policy for Scriptids. Have your counsel review it
          before you rely on it for compliance (including HIPAA, if applicable).
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          What we collect
        </h2>
        <p>
          We may collect information you choose to give us—such as email address,
          name, and messages—when you sign up, subscribe to updates, use contact
          forms, or use features of the site. Technical data like browser type
          and pages visited may be collected automatically to run and improve
          the service.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          How we use it
        </h2>
        <p>
          We use this information to operate Scriptids, respond to you, send
          updates you asked for, improve the product, and meet legal obligations.
          We do not sell your personal information.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Health information
        </h2>
        <p>
          Scriptids is not a substitute for professional care. Do not send
          protected health information (PHI) unless we have a business
          associate agreement and a secure channel in place. Symptom and
          medication tools on this site are for general education unless we
          explicitly state otherwise.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Cookies and analytics
        </h2>
        <p>
          We may use cookies and analytics (such as Vercel Analytics) to
          understand traffic and improve the experience. You can control cookies
          in your browser settings.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Your choices
        </h2>
        <p>
          You may contact us to access, correct, or delete personal information we
          hold, subject to law. Unsubscribe links will be included in marketing
          email once that program is live.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Contact
        </h2>
        <p>
          Questions about privacy?{" "}
          <Link href="/contact" className="text-[var(--accent)] hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
