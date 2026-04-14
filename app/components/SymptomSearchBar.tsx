"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { SymptomMessageBody } from "./SymptomMessageBody";

type Turn = { query: string; reply: string };
type CartItem = { id: string; name: string; priceUsd: number; quantity: number };

type SymptomSearchBarProps = {
  /** Compact = tighter mascot column + padding for footer */
  variant?: "default" | "compact";
  className?: string;
};

function suggestOtcCart(query: string): CartItem[] {
  const q = query.toLowerCase();
  const items: CartItem[] = [];

  const add = (id: string, name: string, priceUsd: number) => {
    if (items.some((it) => it.id === id)) return;
    items.push({ id, name, priceUsd, quantity: 1 });
  };

  if (/(allergy|sneeze|sneezing|itchy|watery|runny nose)/.test(q)) {
    add("cetirizine", "Cetirizine (24‑hour allergy relief)", 12.99);
    add("fluticasone", "Fluticasone nasal spray", 18.49);
  }
  if (/(cough|congestion|cold|sinus)/.test(q)) {
    add("dextromethorphan", "Dextromethorphan cough relief", 9.49);
    add("guaifenesin", "Guaifenesin chest congestion relief", 11.99);
  }
  if (/(headache|fever|pain|sore)/.test(q)) {
    add("acetaminophen", "Acetaminophen pain relief", 8.99);
    add("ibuprofen", "Ibuprofen pain relief", 9.99);
  }
  if (/(heartburn|reflux|indigestion)/.test(q)) {
    add("famotidine", "Famotidine heartburn relief", 13.99);
  }

  if (items.length === 0) {
    add("electrolytes", "Electrolyte drink mix", 7.99);
    add("thermometer", "Digital thermometer", 10.99);
  }

  return items.slice(0, 3);
}

export function SymptomSearchBar({
  variant = "default",
  className = "",
}: SymptomSearchBarProps) {
  const router = useRouter();
  const inputId = useId();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTurn, setLastTurn] = useState<Turn | null>(null);
  const [shopPending, setShopPending] = useState(false);
  const [rxPending, setRxPending] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  const confirmExternal = useCallback((kind: "otc" | "rx") => {
    const msg =
      kind === "otc"
        ? "You are leaving Scriptids.\n\nScripti suggestions are educational and not medical advice. Purchases and fulfillment happen on a separate pharmacy partner site.\n\nContinue?"
        : "You are leaving Scriptids.\n\nScriptids does not provide medical care or prescriptions. Any prescribing (if available) is provided by the partner's licensed clinicians, and dispensing is handled by the partner.\n\nContinue?";
    return window.confirm(msg);
  }, []);

  const submit = useCallback(async () => {
    const q = input.trim();
    if (!q || pending) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user" as const, content: q }],
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error || res.statusText);
      const reply = data.reply ?? "";
      setLastTurn({ query: q, reply });
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
    }
  }, [input, pending]);

  const pad = variant === "compact" ? "p-1" : "p-1.5";
  const isCompact = variant === "compact";

  return (
    <div className={className}>
      {/* Row layout: mascot has its own column so it never overlaps headings or the input */}
      <div className="flex items-end gap-3 sm:gap-4">
        <div
          className={`flex shrink-0 flex-col justify-end ${isCompact ? "w-14 sm:w-16" : "w-[4.5rem] sm:w-24"}`}
          aria-hidden
        >
          <Image
            src="/maru3.jpg"
            alt=""
            width={192}
            height={192}
            className={`w-full select-none object-contain object-bottom drop-shadow-md ${
              isCompact ? "max-h-16 sm:max-h-[4.5rem]" : "max-h-[5rem] sm:max-h-[6rem]"
            }`}
            sizes="(max-width: 640px) 56px, 96px"
            priority={!isCompact}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className="text-base font-bold tracking-tight sm:text-lg"
              style={{
                background: `linear-gradient(105deg, var(--scripti-pink), var(--scripti-cyan))`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Scripti
            </span>
            <span className="text-xs font-medium text-[var(--muted)]">
              symptom search
            </span>
          </div>

          <form
            role="search"
            aria-label="Scripti symptom search"
            className={`flex items-center gap-2 rounded-full border bg-[var(--surface)] shadow-sm ${pad} pl-3 sm:pl-4`}
            style={{
              borderColor:
                "color-mix(in srgb, var(--scripti-cyan) 35%, var(--border))",
              boxShadow:
                "0 1px 2px color-mix(in srgb, var(--scripti-cyan) 12%, transparent), 0 0 0 1px color-mix(in srgb, var(--scripti-pink) 8%, transparent)",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              Scripti — describe your symptoms
            </label>
            <input
              id={inputId}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              placeholder="Tell Scripti how you feel (e.g. sneezing, itchy eyes)…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, var(--scripti-pink), var(--scripti-cyan))`,
              }}
            >
              {pending ? "…" : "Ask Scripti"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
      )}

      {lastTurn && (
        <div
          className={`mt-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] ${isCompact ? "p-3" : "p-4"}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Your search
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{lastTurn.query}</p>
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Scripti suggestions (OTC education only)
            </p>
            <div className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
              <SymptomMessageBody content={lastTurn.reply} isUser={false} />
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Buy OTC meds (pharmacy partner)
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Scripti can suggest OTC categories. Purchases happen with a licensed
              pharmacy partner.
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Scriptids does not sell or dispense drugs and does not provide medical
              advice.
            </p>

            <div className="mt-3 space-y-2">
              {suggestOtcCart(lastTurn.query).map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <span className="min-w-0 text-sm text-[var(--foreground)]">
                    {it.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[var(--foreground)]">
                    ${it.priceUsd.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={shopPending}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                onClick={async () => {
                  if (!confirmExternal("otc")) return;
                  setShopPending(true);
                  setError(null);
                  setCouponCopied(false);
                  try {
                    const planId =
                      typeof window !== "undefined"
                        ? localStorage.getItem("scriptids_plan") || ""
                        : "";
                    const res = await fetch("/api/pharmacy/referral", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        kind: "otc",
                        planId: planId || "free",
                        query: lastTurn.query,
                      }),
                    });
                    const json = (await res.json()) as { url?: string; coupon?: string; error?: string };
                    if (!res.ok) throw new Error(json.error || res.statusText);
                    if (json.coupon) {
                      // Keep it visible even if partner ignores the query param.
                      navigator.clipboard
                        ?.writeText(json.coupon)
                        .then(() => setCouponCopied(true))
                        .catch(() => {});
                    }
                    const url = json.url || "";
                    if (!url) throw new Error("Missing partner URL");
                    window.open(url, "_blank", "noopener,noreferrer");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Checkout failed");
                  } finally {
                    setShopPending(false);
                  }
                }}
              >
                {shopPending ? "Opening partner…" : "Shop now"}
              </button>
              <button
                type="button"
                disabled={rxPending}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-opacity hover:bg-[var(--muted-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={async () => {
                  const planId =
                    typeof window !== "undefined"
                      ? localStorage.getItem("scriptids_plan") || ""
                      : "";
                  const hasPlus = planId === "scripti-plus" || planId === "pro" || planId === "enterprise";
                  if (!hasPlus) {
                    router.push("/pricing");
                    return;
                  }
                  if (!confirmExternal("rx")) return;
                  setRxPending(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/pharmacy/referral", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        kind: "rx",
                        planId,
                        query: lastTurn.query,
                      }),
                    });
                    const json = (await res.json()) as { url?: string; error?: string };
                    if (!res.ok) throw new Error(json.error || res.statusText);
                    const url = json.url || "";
                    if (!url) throw new Error("Missing partner URL");
                    window.open(url, "_blank", "noopener,noreferrer");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not open partner");
                  } finally {
                    setRxPending(false);
                  }
                }}
              >
                {rxPending ? "Opening…" : "Connect for Rx (Plus)"}
              </button>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                View pricing
              </Link>
              <span className="text-xs text-[var(--muted)]">
                Rx connection requires Scripti Plus.
              </span>
            </div>

            {couponCopied && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Coupon copied to clipboard (if your partner supports it).
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-[var(--muted)]">
        Not medical advice. Always talk with your doctor or pharmacist about
        what is right for you.
      </p>
    </div>
  );
}
