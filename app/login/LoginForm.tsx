"use client";

import Link from "next/link";
import { useState } from "react";

export function LoginForm() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        token?: string;
        message?: string;
        error?: string;
        _links?: { home: string };
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      setMessage(data.message ?? "You're signed in.");
      if (typeof window !== "undefined" && data.token) {
        window.localStorage.setItem("scriptids_token", data.token);
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
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Log in"}
      </button>
      {error && (
        <p className="text-center text-sm text-[var(--danger)]">{error}</p>
      )}
      {message && (
        <p className="text-center text-sm text-[var(--muted)]">{message}</p>
      )}
      <p className="text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
          Sign up
        </Link>
        {" · "}
        <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
          Home
        </Link>
      </p>
    </form>
  );
}
