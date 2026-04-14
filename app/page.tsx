import Link from "next/link";
import { SymptomSearchBar } from "./components/SymptomSearchBar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-medium text-[var(--accent)]">
            Help for everyday medication questions
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Understand your meds and what might slow you down—in plain
            language.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Scriptids helps with prescriptions, side effects, and insurance
            hurdles. Start by asking Scripti how you feel. This does not replace
            your doctor or pharmacist.
          </p>

          <div className="mt-8 max-w-2xl">
            <SymptomSearchBar />
          </div>

          <div className="mt-10 flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
            <Link
              href="/prior-auth"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
            >
              PA predictor
            </Link>
            <Link
              href="/intelligence"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
            >
              Drug intelligence
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-normal text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:decoration-[var(--muted)]"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
          More you can do
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Same tools as the header—pick what fits your question.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Scripti
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Describe symptoms in your own words. We suggest broad{" "}
              <em>kinds</em> of medicines people often discuss with a
              clinician—not a diagnosis or dose.
            </p>
            <Link
              href="/chat"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Open Scripti →
            </Link>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              PA predictor
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              See whether your plan might ask for extra approval before covering
              a drug, and what paperwork is often needed—so you are less
              surprised at the pharmacy.
            </p>
            <Link
              href="/prior-auth"
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Open PA predictor →
            </Link>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Drug intelligence
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Browse summarized reports of side effects by medicine—for
              learning only. Always read your medication guide and ask your
              care team.
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
            View pricing →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
            Home
          </Link>
          {" · "}
          <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Sign up
          </Link>
          {" · "}
          <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Not medical advice. In an emergency, call your local emergency number.
        </p>
      </section>
    </div>
  );
}
