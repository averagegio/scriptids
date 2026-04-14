"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";
type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type WebSource = { title: string; url: string; snippet?: string };
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

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function ScriptiChat({ variant = "default" }: { variant?: "default" | "compact" }) {
  const inputId = useId();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("scripti_chat_v1");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Message[];
      return Array.isArray(parsed) ? parsed.slice(-30) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentMeta | null>(null);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [mode, setMode] = useState<"fallback" | "web" | null>(null);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en-US" | "es-ES">("en-US");

  const pad = variant === "compact" ? "p-1" : "p-1.5";
  const isCompact = variant === "compact";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("scripti_chat_v1", JSON.stringify(messages.slice(-30)));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

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
      setError("Voice input failed. Please type instead.");
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
      setError("Voice input could not start. Please type instead.");
    }
  }, [listening, voiceSupported]);

  const lastUserText = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return lastUser?.content || "";
  }, [messages]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
  }, []);

  const startRequest = useCallback(async () => {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setSources([]);
    setMode(null);

    const userMsg: Message = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    const assistantMsg: Message = { id: uid(), role: "assistant", content: "", createdAt: Date.now() };
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput("");
    setPending(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendAssistant = (delta: string) => {
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((x) => x.id === assistantMsg.id);
          if (idx >= 0) copy[idx] = { ...copy[idx], content: copy[idx].content + delta };
          return copy;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames separated by blank line.
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          const lines = frame.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          const event = eventLine ? eventLine.replace("event:", "").trim() : "message";
          const dataRaw = dataLine ? dataLine.replace("data:", "").trim() : "{}";

          let data: any = {};
          try {
            data = JSON.parse(dataRaw);
          } catch {
            data = {};
          }

          if (event === "delta" && typeof data.text === "string") {
            appendAssistant(data.text);
          } else if (event === "done") {
            setAgent(data.agent ?? null);
            setSources(Array.isArray(data.sources) ? data.sources : []);
            setMode(data.mode === "web" ? "web" : "fallback");
          } else if (event === "error") {
            throw new Error(String(data.error || "Request failed"));
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  }, [input, messages, pending]);

  const clearChat = useCallback(() => {
    stop();
    setMessages([]);
    setAgent(null);
    setSources([]);
    setMode(null);
    if (typeof window !== "undefined") window.localStorage.removeItem("scripti_chat_v1");
  }, [stop]);

  const showMascot = variant === "default";

  return (
    <div className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      <div className="flex items-end gap-3 sm:gap-4">
        {showMascot && (
          <div className="flex shrink-0 flex-col justify-end w-[4.5rem] sm:w-24" aria-hidden>
            <Image
              src="/maru3.jpg"
              alt=""
              width={192}
              height={192}
              className="w-full select-none object-contain object-bottom drop-shadow-md max-h-[5rem] sm:max-h-[6rem]"
              sizes="(max-width: 640px) 56px, 96px"
              priority
            />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
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
                chat
              </span>
              {mode && (
                <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  {mode === "web" ? "Web" : "Local"}
                </span>
              )}
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
              onClick={clearChat}
            >
              New chat
            </button>
          </div>

          <div className="max-h-[34vh] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 sm:max-h-[42vh]">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Ask Scripti about symptoms in plain language. Scripti will suggest OTC categories and next-step tools—educational only.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </div>

          <form
            role="search"
            aria-label="Scripti chat input"
            className={`flex items-center gap-2 rounded-full border bg-[var(--surface)] shadow-sm ${pad} pl-3 sm:pl-4`}
            style={{
              borderColor: "color-mix(in srgb, var(--scripti-cyan) 35%, var(--border))",
              boxShadow:
                "0 1px 2px color-mix(in srgb, var(--scripti-cyan) 12%, transparent), 0 0 0 1px color-mix(in srgb, var(--scripti-pink) 8%, transparent)",
            }}
            onSubmit={(e) => {
              e.preventDefault();
              void startRequest();
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              Scripti — describe your symptoms
            </label>
            <input
              id={inputId}
              type="search"
              enterKeyHint="send"
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              placeholder={isCompact ? "Describe symptoms…" : "Tell Scripti how you feel (e.g. sneezing, itchy eyes)…"}
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
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
                  listening
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                }`}
                title={voiceSupported ? (listening ? "Tap to stop" : "Tap to speak") : "Voice not supported"}
              >
                {listening ? <StopIcon /> : <MicIcon />}
              </button>
            </div>

            {pending ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-[var(--foreground)]"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, var(--scripti-pink), var(--scripti-cyan))`,
                }}
              >
                Send
              </button>
            )}
          </form>

          {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}

          {agent?.safety?.urgent && agent?.safety?.message && (
            <p className="mt-2 text-sm font-semibold text-[var(--danger)]">
              {agent.safety.message}
            </p>
          )}
        </div>
      </div>

      {(agent?.recommendedTools?.length || sources.length) && (
        <div className="space-y-3">
          {agent?.recommendedTools?.length ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Next steps
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {agent.recommendedTools.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  >
                    {t.label}
                  </Link>
                ))}
                <Link
                  href="/pricing"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  View pricing →
                </Link>
              </div>
            </div>
          ) : null}

          {sources.length ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Sources
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {sources.map((s, i) => (
                  <li key={s.url} className="text-[var(--foreground)]">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[var(--accent)] hover:underline"
                    >
                      [{i + 1}] {s.title}
                    </a>
                    {s.snippet ? (
                      <div className="mt-1 text-xs text-[var(--muted)]">{s.snippet}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        Not medical advice. Always talk with your doctor or pharmacist about what is right for you.
      </p>
    </div>
  );
}

