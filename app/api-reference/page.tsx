import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "../components/BackNav";

export const metadata: Metadata = {
  title: "API",
  description: "Technical overview of Scriptids data endpoints for developers.",
};

export default function ApiReferencePage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        API
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        If you are connecting your own app or dashboard, these are the machine
        endpoints behind Scripti, the PA predictor, drug intelligence, sign-in,
        and pricing. Each response includes a small{" "}
        <code className="rounded bg-[var(--muted-bg)] px-1 font-mono text-xs">
          _links
        </code>{" "}
        object so you can send people back to the website when needed.
      </p>

      <ul className="mt-8 space-y-3 text-sm text-[var(--foreground)]">
        <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="font-medium">Chat (Scripti)</span>
          <span className="mt-1 block text-[var(--muted)]">
            Send a conversation; get a text reply with suggestions.
          </span>
        </li>
        <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="font-medium">PA predictor</span>
          <span className="mt-1 block text-[var(--muted)]">
            Send drug and insurance details; get an approval estimate.
          </span>
        </li>
        <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="font-medium">Drug intelligence</span>
          <span className="mt-1 block text-[var(--muted)]">
            Optional search text; get medicine summaries and side-effect stats.
          </span>
        </li>
        <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="font-medium">Log in &amp; sign up</span>
          <span className="mt-1 block text-[var(--muted)]">
            Send email and password; receive a session token for your client.
          </span>
        </li>
        <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span className="font-medium">Pricing</span>
          <span className="mt-1 block text-[var(--muted)]">
            Load plan names and prices for a billing screen.
          </span>
        </li>
      </ul>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
