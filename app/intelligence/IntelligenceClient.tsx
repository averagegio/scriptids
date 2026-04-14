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
  const [debounced, setDebounced] = useState("");
  const [profiles, setProfiles] = useState<DrugIntelligenceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async (q: string) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
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
    void load(debounced);
  }, [debounced, load]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Search by drug or brand name
          <input
            className="mt-2 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. semaglutide, Skyrizi"
          />
        </label>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Type to filter the list. Results update as you type.
        </p>
        {loading && (
          <p className="mt-2 text-xs text-[var(--muted)]">Loading…</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>

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

        {!loading && profiles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            No medicines match that search. Try another name.
          </p>
        )}
      </div>
    </div>
  );
}
