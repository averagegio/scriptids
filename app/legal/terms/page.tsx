import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "../../components/BackNav";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using the Scriptids website and services.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Terms of use
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="mt-8 max-w-none space-y-4 text-sm leading-relaxed text-[var(--foreground)]">
        <p className="text-[var(--muted)]">
          These terms are a starting point. Have qualified counsel adapt them
          for your entity and jurisdiction.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Agreement
        </h2>
        <p>
          By using Scriptids websites and services, you agree to these terms. If
          you do not agree, do not use the service.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Not medical advice
        </h2>
        <p>
          Scriptids provides educational information and tools. It does not
          provide medical advice, diagnosis, or treatment. Always consult a
          qualified health professional for decisions about medications and
          emergencies.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Pharmacy partner links
        </h2>
        <p>
          Scriptids may link you to third-party pharmacy partners. Scriptids does
          not operate a pharmacy, does not dispense drugs, and is not responsible
          for third-party products, services, pricing, fulfillment, or clinical
          services. Any purchase you make is between you and the third party.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          No warranty
        </h2>
        <p>
          The service is provided &quot;as is.&quot; We do not guarantee
          accuracy, availability, or fitness for a particular purpose. Insurance
          and prior-authorization estimates are illustrative only; your plan
          decides coverage.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Acceptable use
        </h2>
        <p>
          You agree not to misuse the service, attempt unauthorized access, scrape
          in violation of our policies, or use the service in any unlawful way.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Accounts
        </h2>
        <p>
          You are responsible for safeguarding login credentials and for
          activity under your account.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Limitation of liability
        </h2>
        <p>
          To the fullest extent permitted by law, Scriptids and its team are not
          liable for indirect or consequential damages arising from your use of
          the service.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Changes
        </h2>
        <p>
          We may update these terms. Continued use after changes means you
          accept the updated terms.
        </p>
        <h2 className="pt-2 text-base font-semibold text-[var(--foreground)]">
          Contact
        </h2>
        <p>
          <Link href="/contact" className="text-[var(--accent)] hover:underline">
            Contact us
          </Link>{" "}
          with questions.
        </p>
      </div>
    </main>
  );
}
