import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "../components/BackNav";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Scriptids team for partnerships, support, or press.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Contact us
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Questions about Scripti, prior authorization prediction, or working
        together? Send a
        note—we read everything. For urgent medical issues, contact your
        clinician or emergency services, not this form.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Prefer email?{" "}
        <a
          href="mailto:hello@scriptids.com"
          className="font-medium text-[var(--accent)] hover:underline"
        >
          hello@scriptids.com
        </a>{" "}
        (update this address in code when your inbox is live).
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/pricing" className="text-[var(--accent)] hover:underline">
          Pricing →
        </Link>
      </p>
    </main>
  );
}
