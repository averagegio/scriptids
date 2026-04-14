import Link from "next/link";
import { LeadCapture } from "./components/LeadCapture";
import { SymptomSearchBar } from "./components/SymptomSearchBar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-medium text-[var(--accent)]">
            Prescriptions, explained—without the runaround
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Ask Scripti. Get plain-language answers about symptoms and prescriptions.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Type what you&apos;re feeling (or what you were prescribed). Scripti
            explains the basics so you can talk with your doctor or pharmacist
            with confidence.
          </p>

          <div id="scripti" className="mt-8 scroll-mt-24 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Step 1 · Ask Scripti
            </p>
            <SymptomSearchBar />
          </div>

          <p className="mt-5 max-w-2xl text-sm text-[var(--muted)]">
            Want full features?{" "}
            <Link href="/pricing" className="font-semibold text-[var(--accent)] hover:underline">
              View pricing
            </Link>
            .
          </p>

          <div className="mt-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Step 2 · Prior authorizations
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Understand you medical insurance and what might slow you down -in
              plain language.
            </p>
            <div className="mt-3">
              <Link
                href="/prior-auth"
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                Open prior authorization prediction →
              </Link>
            </div>
          </div>

          <ul className="mt-8 flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent)]" aria-hidden>
                ✓
              </span>
              Prescription education—not a diagnosis or dosing advice
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent)]" aria-hidden>
                ✓
              </span>
              Built for real pharmacy and insurance workflows
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent)]" aria-hidden>
                ✓
              </span>
              Optional updates—your inbox stays light
            </li>
          </ul>

          <div className="mt-8 max-w-2xl">
            <details className="group rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 sm:px-6">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)]">
                What is prior authorization?
                <span className="ml-2 text-xs font-medium text-[var(--muted)] group-open:hidden">
                  (tap to expand)
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                For some prescriptions, your health plan asks for{" "}
                <strong className="font-medium text-[var(--foreground)]">
                  prior authorization
                </strong>{" "}
                before they agree to cover the medication. That usually means
                your prescriber sends the plan a bit of extra paperwork. It can
                delay a prescription pickup if no one knows what to send.
              </p>
              <div className="mt-3">
                <Link
                  href="/prior-auth"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Try prior authorization prediction →
                </Link>
              </div>
            </details>
          </div>

          <div className="mt-10 max-w-2xl">
            <LeadCapture />
          </div>

          <p className="mt-8 text-sm text-[var(--muted)]">
            Already exploring for a team?{" "}
            <Link
              href="/contact"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Contact us about partnerships
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
          More tools on Scriptids
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Same features as the top navigation—jump in wherever you need.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Scripti
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Describe symptoms in your own words. Scripti suggests broad{" "}
              <em>kinds</em> of medicines people discuss with a clinician—not a
              diagnosis or dose.
            </p>
            <a
              href="#scripti"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Back to Scripti ↑
            </a>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Prior authorization prediction
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              <strong className="font-medium text-[var(--foreground)]">
                Prior authorization
              </strong>{" "}
              is when your plan reviews a prescription before paying. We help
              you preview whether that step might apply to a medication and what
              paperwork is often useful—so you&apos;re not caught off guard at
              the counter.
            </p>
            <Link
              href="/prior-auth"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Open prior authorization prediction →
            </Link>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Drug intelligence
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Browse summarized reports of side effects by medicine—context for
              conversations about what&apos;s on your prescription. Learning
              only; always follow your medication guide and care team.
            </p>
            <Link
              href="/intelligence"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Open drug intelligence →
            </Link>
          </article>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/pricing"
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Compare plans →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Create an account
          </Link>
          {" · "}
          <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
            Log in
          </Link>
          {" · "}
          <Link href="/contact" className="font-medium text-[var(--accent)] hover:underline">
            Contact
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Not medical advice. In an emergency, call your local emergency number.
        </p>
      </section>
    </div>
  );
}
