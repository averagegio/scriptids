"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SymptomMessageBody } from "./SymptomMessageBody";

type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
type CartItem = { id: string; name: string; priceUsd: number; quantity: number };
type AgentTool = { label: string; href: string; why: string };
type AgentMeta = {
  intents?: string[];
  matchedKeywords?: string[];
  recommendedTools?: AgentTool[];
  safety?: { urgent?: boolean; message?: string };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function MicIcon({ muted }: { muted?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      className={muted ? "opacity-70" : ""}
    >
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0a1 1 0 0 0-2 0a7 7 0 0 0 6 6.92V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 11a1 1 0 1 0-2 0Z"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M7 7h10v10H7z" />
    </svg>
  );
}

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
  const [turns, setTurns] = useState<Turn[]>([]);
  const [agent, setAgent] = useState<AgentMeta | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [shopPending, setShopPending] = useState(false);
  const [rxPending, setRxPending] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const [voiceLang, setVoiceLang] = useState<"en-US" | "es-ES">("en-US");
  const abortRef = useRef<AbortController | null>(null);

  const confirmExternal = useCallback((kind: "otc" | "rx") => {
    const msg =
      kind === "otc"
        ? "You are leaving Scriptids.\n\nScripti suggestions are educational and not medical advice. Purchases and fulfillment happen on a separate pharmacy partner site.\n\nContinue?"
        : "You are leaving Scriptids.\n\nScriptids does not provide medical care or prescriptions. Any prescribing (if available) is provided by the partner's licensed clinicians, and dispensing is handled by the partner.\n\nContinue?";
    return window.confirm(msg);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceSupported(false);
      return;
    }
    setVoiceSupported(true);

    const rec: SpeechRecognitionLike = new Ctor();
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event: any) => {
      const results = event?.results;
      if (!results || !results.length) return;
      const transcript = Array.from(results)
        .map((r: any) => r?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) setInput(transcript);

      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        try {
          recognitionRef.current?.stop();
        } catch {
          // ignore
        } finally {
          setListening(false);
        }
      }, 2500);
    };
    rec.onerror = () => {
      setListening(false);
      setError("Voice input failed. Please type your symptoms instead.");
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, [voiceLang]);

  const toggleVoice = useCallback(() => {
    if (!voiceSupported) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    setError(null);
    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }
    try {
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setError("Voice input could not start. Please type your symptoms instead.");
    }
  }, [listening, voiceSupported]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setPending(false);
  }, []);

  const lastUserText = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i]?.role === "user") return turns[i]!.content;
    }
    return "";
  })();

  const submit = useCallback(async () => {
    const q = input.trim();
    if (!q || pending || streaming) return;

    setError(null);
    setPending(true);
    setStreaming(true);
    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const newUserTurn: Turn = { id: crypto.randomUUID(), role: "user", content: q };
      const assistantId = crypto.randomUUID();
      setTurns((t) => [
        ...t,
        newUserTurn,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setInput("");

      const messages = [...turns, newUserTurn].map((t) => ({
        role: t.role,
        content: t.content,
      }));

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let err = res.statusText;
        try {
          const j = (await res.json()) as any;
          err = j?.error || j?.message || err;
        } catch {
          // ignore
        }
        throw new Error(err);
      }
      if (!res.body) throw new Error("Missing response stream");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";

      const applyDelta = (text: string) => {
        setTurns((t) =>
          t.map((turn) =>
            turn.id === assistantId
              ? { ...turn, content: (turn.content || "") + text }
              : turn,
          ),
        );
      };

      const handleEvent = (event: string, data: any) => {
        if (event === "delta" && data?.text) applyDelta(String(data.text));
        if (event === "done") {
          setAgent((data?.agent as AgentMeta) ?? null);
        }
        if (event === "error") {
          throw new Error(String(data?.error || "Request failed"));
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });

        while (true) {
          const idx = buffer.indexOf("\n\n");
          if (idx === -1) break;
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // Basic SSE parsing (event/data lines)
          let event = "message";
          let dataStr = "";
          for (const line of chunk.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let data: any = null;
          try {
            data = JSON.parse(dataStr);
          } catch {
            data = { text: dataStr };
          }
          handleEvent(event, data);
        }
      }
    } catch (e) {
      // If aborted mid-stream, don't show as an error.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, pending, streaming, turns]);

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
              disabled={pending || listening}
            />
            <div className="flex items-center gap-2 sm:hidden">
              <select
                className="h-9 rounded-full border border-[var(--border)] bg-[var(--background)] px-2 text-xs font-semibold text-[var(--foreground)]"
                aria-label="Voice language"
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value as "en-US" | "es-ES")}
                disabled={pending || listening || !voiceSupported}
              >
                <option value="en-US">EN</option>
                <option value="es-ES">ES</option>
              </select>
              <button
                type="button"
                onClick={toggleVoice}
                disabled={pending || !voiceSupported}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                title={
                  voiceSupported
                    ? listening
                      ? "Tap to stop"
                      : "Tap to speak"
                    : "Voice input not supported"
                }
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
                  listening
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                {listening ? <StopIcon /> : <MicIcon muted={!voiceSupported} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={pending || streaming || !input.trim()}
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

      {turns.length > 0 && (
        <div
          className={`mt-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] ${isCompact ? "p-3" : "p-4"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Conversation
            </p>
            {streaming && (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                <span>Stop</span>
              </button>
            )}
          </div>

          <div className="mt-3 space-y-3">
            {turns.map((t) => (
              <div
                key={t.id}
                className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl border px-3 py-2 text-sm leading-relaxed sm:max-w-[80%] ${
                    t.role === "user"
                      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  <SymptomMessageBody content={t.content || (t.role === "assistant" && streaming ? "…" : "")} isUser={t.role === "user"} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Next steps
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              If your situation involves a prescription, insurance, or side
              effects, these tools can help you plan what to do next.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(agent?.recommendedTools?.length ? agent.recommendedTools : null)?.map(
                (t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  >
                    {t.label}
                  </Link>
                ),
              ) ?? (
                <>
                  <Link
                    href="/prior-auth"
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  >
                    Prior auth prediction
                  </Link>
                  <Link
                    href="/intelligence"
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  >
                    Drug intelligence
                  </Link>
                </>
              )}
              <Link
                href="/pricing"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                View pricing →
              </Link>
            </div>
            {agent?.safety?.urgent && agent?.safety?.message && (
              <p className="mt-3 text-sm font-semibold text-[var(--danger)]">
                {agent.safety.message}
              </p>
            )}
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
              {suggestOtcCart(lastUserText).map((it) => (
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
                        query: lastUserText,
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
                        query: lastUserText,
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
