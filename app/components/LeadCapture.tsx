"use client";

import { useCallback, useState } from "react";

export function LeadCapture() {
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState<string>("patient");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email to subscribe.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, segment }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }, [email, segment]);

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--accent-muted)] bg-[var(--accent-muted)]/40 px-5 py-6 text-center sm:px-8">
        <p className="text-sm font-medium text-[var(--foreground)]">
          You&apos;re subscribed. Watch your inbox for Scriptids updates—no spam,
          unsubscribe anytime once we add a link.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 text-xs text-[var(--accent)] underline hover:no-underline"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Get product updates
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        New features, payer tips, and launch news—occasionally and only from
        Scriptids.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-sm font-medium text-[var(--foreground)]">
          Email
          <input
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="text-sm font-medium text-[var(--foreground)] sm:w-44">
          I am a
          <select
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            disabled={pending}
          >
            <option value="patient">Patient / caregiver</option>
            <option value="clinician">Clinician / staff</option>
            <option value="organization">Organization</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={pending}
          className="shrink-0 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
