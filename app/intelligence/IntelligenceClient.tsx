"use client";

import type { DrugIntelligenceProfile } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function trendLabel(t: "up" | "flat" | "down") {
  if (t === "up") return "Trending up recently";
  if (t === "down") return "Trending down recently";
  return "Mostly steady";
}

export function IntelligenceClient() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [profiles, setProfiles] = useState<DrugIntelligenceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("limit", "25");
      const res = await fetch(`/api/intelligence?${params.toString()}`);
      const data = (await res.json()) as {
        profiles?: DrugIntelligenceProfile[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      setProfiles(data.profiles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial state: show nothing until the first search is submitted.
    setLoading(false);
    setProfiles([]);
  }, []);

  const medicinesInGuide = profiles.length;
  const reportsSummarized = profiles.reduce((sum, p) => sum + p.totalSignals, 0);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            setSubmitted(q);
            void load(q);
          }}
        >
          <label className="block flex-1 text-sm font-medium text-[var(--foreground)]">
            Search by drug or brand name
            <input
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. semaglutide, Skyrizi"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Press Search to load results.
        </p>
        {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
      </div>

      {submitted !== "" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Medicines in this guide
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {medicinesInGuide}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Reports summarized
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {reportsSummarized.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              How to use this
            </p>
            <p className="mt-2 text-sm leading-snug text-[var(--foreground)]">
              Compare trends, then talk to your clinician or pharmacist about your
              own situation.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {profiles.map((drug) => (
          <article
            key={drug.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold capitalize text-[var(--foreground)]">
                  {drug.genericName}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {drug.brandNames.join(", ")} · {drug.therapeuticClass}
                </p>
              </div>
              <div className="text-right text-sm text-[var(--muted)]">
                <div>
                  <span className="font-medium text-[var(--foreground)]">
                    {drug.totalSignals.toLocaleString()}
                  </span>{" "}
                  reports in this summary
                </div>
                <div className="text-xs">Updated {drug.lastUpdated}</div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              {drug.notes}
            </p>

            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Side effects people report most often here
            </h3>
            <ul className="mt-3 space-y-3">
              {drug.topSignals.map((s) => (
                <li
                  key={s.term}
                  className="flex flex-col gap-2 rounded-xl bg-[var(--background)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium capitalize text-[var(--foreground)]">
                      {s.term}
                    </span>
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {trendLabel(s.trend)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 sm:mx-6 sm:max-w-md">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[var(--muted-bg)]"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--accent)]"
                        style={{ width: `${Math.min(100, s.sharePct * 4)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--muted)]">
                      <span>{s.reports.toLocaleString()} mentions</span>
                      <span>{s.sharePct}% of top group</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}

        {submitted !== "" && !loading && profiles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            No medicines match that search. Try another name.
          </p>
        )}
      </div>
    </div>
  );
}
