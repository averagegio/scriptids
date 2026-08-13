"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FUND_ALLOCATION,
  FUNDING_GOAL_USD,
  MARKET,
  PROJECTIONS,
  formatCompactUsd,
  formatMau,
} from "@/lib/pitch-data";

const SLIDES = [
  { id: "cover", label: "Cover" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "market", label: "TAM" },
  { id: "mau", label: "MAU" },
  { id: "earnings", label: "Earnings" },
  { id: "funding", label: "Funding" },
  { id: "ask", label: "Ask" },
] as const;

const SLIDE_IDS: readonly string[] = SLIDES.map((s) => s.id);

function useActiveSlide() {
  const [active, setActive] = useState<string>(SLIDE_IDS[0] ?? "cover");
  useEffect(() => {
    const nodes = SLIDE_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => Boolean(n),
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target?.id;
        if (id) setActive(id);
      },
      { root: null, threshold: [0.35, 0.55, 0.7] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  return active;
}

function BarChart({
  values,
  labels,
  max,
  format,
}: {
  values: number[];
  labels: string[];
  max: number;
  format: (n: number) => string;
}) {
  return (
    <div className="mt-8 grid grid-cols-5 items-end gap-3 sm:gap-4" role="img" aria-label="Projection chart">
      {values.map((v, i) => {
        const h = Math.max(8, Math.round((v / max) * 100));
        return (
          <div key={labels[i]} className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
              {format(v)}
            </span>
            <div className="relative flex h-40 w-full items-end sm:h-52">
              <div
                className="pitch-bar w-full rounded-t-lg bg-[var(--accent)]"
                style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--muted)]">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function AllocationBars() {
  return (
    <ul className="mt-8 space-y-4">
      {FUND_ALLOCATION.map((item, i) => (
        <li key={item.id}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
            <span className="shrink-0 tabular-nums text-[var(--muted)]">
              {item.pct}% · {formatCompactUsd(item.amountUsd)}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--muted-bg)]">
            <div
              className="pitch-fill h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${item.pct}%`, animationDelay: `${i * 120}ms` }}
            />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export function PitchDeck() {
  const active = useActiveSlide();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") {
        return;
      }
      const idx = SLIDE_IDS.indexOf(active);
      if (idx < 0) return;
      const next =
        e.key === "ArrowDown" || e.key === "PageDown"
          ? Math.min(SLIDE_IDS.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      const el = document.getElementById(SLIDE_IDS[next]!);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className="relative">
      <nav
        className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex"
        aria-label="Pitch slides"
      >
        {SLIDES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`pointer-events-auto h-2.5 w-2.5 rounded-full border transition-all ${
              active === s.id
                ? "scale-125 border-[var(--accent)] bg-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
            }`}
            title={s.label}
            aria-label={`Go to ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
          />
        ))}
      </nav>

      {/* Cover */}
      <section
        id="cover"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center overflow-hidden border-b border-[var(--border)]"
      >
        <div
          className="pitch-orb pointer-events-none absolute -right-24 top-0 h-[70%] w-[70%] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--scripti-cyan) 45%, transparent), transparent 65%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-muted) 80%, transparent) 0%, transparent 55%, color-mix(in srgb, var(--scripti-pink) 18%, transparent) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="pitch-reveal text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Investor pitch
          </p>
          <h1 className="pitch-reveal mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl" style={{ animationDelay: "80ms" }}>
            Scriptids
          </h1>
          <p className="pitch-reveal mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl" style={{ animationDelay: "160ms" }}>
            Medication access without the runaround—plain-language Scripti answers,
            prior-auth prediction, and clinic workflows that clear the path to the
            pharmacy counter.
          </p>
          <div className="pitch-reveal mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a
              href="#market"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              See the market
            </a>
            <a
              href="#funding"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Funding ask
            </a>
          </div>
          <p className="pitch-reveal mt-10 text-xs text-[var(--muted)]" style={{ animationDelay: "320ms" }}>
            Seed round · {formatCompactUsd(FUNDING_GOAL_USD)} · Projections are illustrative
          </p>
        </div>
      </section>

      {/* Problem */}
      <section
        id="problem"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center border-b border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            The problem
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Patients stall. Clinics drown in paperwork. Pharmacies wait.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Prior authorization and opaque insurance rules delay starts of therapy.
            Consumers lack plain-language help; clinics burn staff hours on forms
            that should already know the answer.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { k: "Hours lost", v: "Staff time on PA chase-downs every week" },
              { k: "Delayed starts", v: "Patients leave the pharmacy empty-handed" },
              { k: "Opaque coverage", v: "No clear next step until the claim fails" },
            ].map((item) => (
              <li key={item.k} className="border-l-2 border-[var(--accent)] pl-4">
                <p className="text-lg font-semibold text-[var(--foreground)]">{item.k}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section
        id="solution"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center overflow-hidden border-b border-[var(--border)]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-50"
          style={{
            background:
              "linear-gradient(0deg, color-mix(in srgb, var(--accent-muted) 70%, transparent), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            The product
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            One stack for consumers and clinics
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Scripti explains symptoms and prescriptions in plain language. Prior-auth
            tools predict friction, autofill forms, and suggest covered alternatives.
            Clinic SaaS turns that into a daily workflow.
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", t: "Scripti", d: "Consumer Q&A that builds confidence before the visit or pickup." },
              { n: "02", t: "Prior auth", d: "Likelihood signals, optimizer autofill, and alternative drugs." },
              { n: "03", t: "Clinic SaaS", d: "Seats, case fees, and dashboards for high-volume practices." },
            ].map((item) => (
              <li key={item.n}>
                <p className="font-mono text-xs text-[var(--scripti-cyan)]">{item.n}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{item.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Market / TAM */}
      <section
        id="market"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center border-b border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Market
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            A massive medication-access market
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            We focus where paperwork and confusion block therapy—then expand with
            partner pharmacies and clinic groups.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[MARKET.tam, MARKET.sam, MARKET.som].map((m, i) => (
              <div
                key={m.label}
                className="pitch-reveal rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {m.label}
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--accent)] sm:text-5xl">
                  {m.display}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{m.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAU */}
      <section
        id="mau"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center border-b border-[var(--border)]"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Traction plan
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Projected monthly active users
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Free Explorer + Scripti Plus funnels feed clinic land-and-expand. Target
            Y5: {formatMau(PROJECTIONS[4]!.mau)} MAU.
          </p>
          <BarChart
            values={PROJECTIONS.map((p) => p.mau)}
            labels={PROJECTIONS.map((p) => p.label)}
            max={PROJECTIONS[4]!.mau}
            format={formatMau}
          />
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Y1 MAU</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatMau(PROJECTIONS[0]!.mau)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Y3 MAU</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatMau(PROJECTIONS[2]!.mau)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Y5 MAU</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatMau(PROJECTIONS[4]!.mau)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Earnings */}
      <section
        id="earnings"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center border-b border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Projected earnings
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Revenue ramp to {formatCompactUsd(PROJECTIONS[4]!.revenueUsd)}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Mix of consumer subscriptions (Scripti Plus, Prior auth Plus, Complete)
            and clinic SaaS (platform fee + per-case PA fees).
          </p>
          <BarChart
            values={PROJECTIONS.map((p) => p.revenueUsd)}
            labels={PROJECTIONS.map((p) => p.label)}
            max={PROJECTIONS[4]!.revenueUsd}
            format={formatCompactUsd}
          />
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th className="py-2 pr-4 font-semibold">Year</th>
                  <th className="py-2 pr-4 font-semibold">Revenue</th>
                  <th className="py-2 pr-4 font-semibold">Paying users</th>
                  <th className="py-2 font-semibold">Clinic accounts</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTIONS.map((p) => (
                  <tr key={p.year} className="border-b border-[var(--border)] text-[var(--foreground)]">
                    <td className="py-3 pr-4 font-medium">{p.label}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatCompactUsd(p.revenueUsd)}</td>
                    <td className="py-3 pr-4 tabular-nums">{p.payingUsers.toLocaleString()}</td>
                    <td className="py-3 tabular-nums">{p.clinicAccounts.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Funding + distribution */}
      <section
        id="funding"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center border-b border-[var(--border)]"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            The raise
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Funding goal: {formatCompactUsd(FUNDING_GOAL_USD)}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Seed capital to harden the product, win clinic pilots, and ship
            compliance-ready infrastructure for medication-access workflows.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Seed round
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-[var(--accent)]">
                {formatCompactUsd(FUNDING_GOAL_USD)}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                ~18–24 months of runway to reach product-market fit in clinics and
                meaningful consumer Plus conversion.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[var(--foreground)]">
                <li className="flex gap-2">
                  <span className="text-[var(--accent)]" aria-hidden>✓</span>
                  Clinic land-and-expand playbook
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--accent)]" aria-hidden>✓</span>
                  Scripti + PA quality loop
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--accent)]" aria-hidden>✓</span>
                  Partner pharmacy distribution
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                How funds are distributed
              </h3>
              <AllocationBars />
            </div>
          </div>
        </div>
      </section>

      {/* Ask / CTA */}
      <section
        id="ask"
        className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 items-center overflow-hidden"
      >
        <div
          className="pitch-orb pointer-events-none absolute -left-20 bottom-0 h-[55%] w-[55%] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--scripti-pink) 35%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            The ask
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Join us in clearing the path to every prescription
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            We&apos;re raising {formatCompactUsd(FUNDING_GOAL_USD)} to scale Scriptids from
            early product to category-defining medication-access infrastructure.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Goal</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatCompactUsd(FUNDING_GOAL_USD)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">TAM</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{MARKET.tam.display}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Y5 MAU</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatMau(PROJECTIONS[4]!.mau)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Y5 revenue</dt>
              <dd className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{formatCompactUsd(PROJECTIONS[4]!.revenueUsd)}</dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact?topic=investors"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Talk with the team
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              View pricing model
            </Link>
          </div>
          <p className="mt-8 text-xs text-[var(--muted)]">
            Figures are forward-looking estimates for discussion—not guarantees of
            future performance. Not medical advice.
          </p>
        </div>
      </section>
    </div>
  );
}
