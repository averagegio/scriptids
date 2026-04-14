"use client";

import { useCallback, useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState("partnership");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, intent, message }),
        });
        const data = (await res.json()) as { message?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        setDone(true);
        setMessage("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setPending(false);
      }
    },
    [name, email, intent, message],
  );

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--accent-muted)] bg-[var(--accent-muted)]/40 p-6 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Message received. We&apos;ll reply by email as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm text-[var(--accent)] underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Name
        <input
          required
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Topic
        <select
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={pending}
        >
          <option value="partnership">Partnership or sales</option>
          <option value="support">Product help</option>
          <option value="press">Press</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Message
        <textarea
          required
          rows={5}
          minLength={10}
          className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={pending}
        />
      </label>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
