"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm({ next }: { next?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, password }),
      });
      const raw = await res.text();
      const data = (raw ? JSON.parse(raw) : {}) as {
        success?: boolean;
        token?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      setMessage(data.message ?? "Welcome! Your account is ready.");
      if (typeof window !== "undefined" && data.token) {
        window.localStorage.setItem("scriptids_token", data.token);
      }
      const dest = typeof next === "string" && next.startsWith("/") ? next : "";
      if (dest) {
        router.push(dest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Name (optional)
        <input
          type="text"
          autoComplete="name"
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Email
        <input
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
      {error && (
        <p className="text-center text-sm text-[var(--danger)]">{error}</p>
      )}
      {message && (
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      )}
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Log in
        </Link>
        {" · "}
        <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
          Home
        </Link>
      </p>
    </form>
  );
}
