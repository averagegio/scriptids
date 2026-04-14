"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BackNav } from "../components/BackNav";

type Session = {
  kind: string;
  sessionId: string;
  createdAt: string;
  planId: string;
  planName: string;
  planPriceMonthlyUsd: number | null;
  items: { id: string; name: string; priceUsd: number; quantity: number }[];
};

function decodeSession(token: string): Session | null {
  try {
    const normalized = token.replaceAll("-", "+").replaceAll("_", "/");
    const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const json = atob(normalized + pad);
    const parsed = JSON.parse(json) as Session;
    if (!parsed?.sessionId || !parsed?.planId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("session") ?? "";
  const session = useMemo(() => (token ? decodeSession(token) : null), [token]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ orderId: string } | null>(null);

  const subtotal = (session?.items ?? []).reduce(
    (sum, it) => sum + it.priceUsd * it.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Demo checkout flow. No payment is processed.
      </p>

      {!session && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--foreground)]">No checkout session found.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose a plan to start checkout.
          </p>
          <div className="mt-4">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Go to pricing →
            </Link>
          </div>
        </div>
      )}

      {session && (
        <div className="mt-8 space-y-4">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Plan</h2>
            <p className="mt-2 text-sm text-[var(--foreground)]">{session.planName}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {typeof session.planPriceMonthlyUsd === "number"
                ? `$${session.planPriceMonthlyUsd}/mo`
                : "Custom pricing"}
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Cart</h2>
            {session.items.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                No items added. (You can still confirm to finish the demo flow.)
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
                {session.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      {it.name}{" "}
                      <span className="text-[var(--muted)]">×{it.quantity}</span>
                    </span>
                    <span className="shrink-0 text-[var(--muted)]">
                      ${(it.priceUsd * it.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
              <span className="font-semibold text-[var(--foreground)]">Subtotal</span>
              <span className="font-semibold text-[var(--foreground)]">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </section>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          {confirmed ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Order confirmed
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Demo order id:{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {confirmed.orderId}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  onClick={() => router.push("/chat")}
                >
                  Back to Scripti
                </button>
                <Link
                  href="/"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Home
                </Link>
              </div>
            </section>
          ) : (
            <button
              type="button"
              disabled={pending}
              className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              onClick={async () => {
                setError(null);
                setPending(true);
                try {
                  const res = await fetch("/api/checkout", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session: token }),
                  });
                  const json = (await res.json()) as {
                    orderId?: string;
                    error?: string;
                  };
                  if (!res.ok) throw new Error(json.error || res.statusText);
                  setConfirmed({ orderId: json.orderId || "demo_order" });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Checkout failed");
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Confirming…" : "Confirm checkout"}
            </button>
          )}
        </div>
      )}
    </main>
  );
}

