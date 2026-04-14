"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";
import { SymptomMessageBody } from "./SymptomMessageBody";

type Turn = { query: string; reply: string };

type SymptomSearchBarProps = {
  /** Compact = tighter mascot column + padding for footer */
  variant?: "default" | "compact";
  className?: string;
};

export function SymptomSearchBar({
  variant = "default",
  className = "",
}: SymptomSearchBarProps) {
  const inputId = useId();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTurn, setLastTurn] = useState<Turn | null>(null);

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
              Scripti suggestions (educational)
            </p>
            <div className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
              <SymptomMessageBody content={lastTurn.reply} isUser={false} />
            </div>
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
