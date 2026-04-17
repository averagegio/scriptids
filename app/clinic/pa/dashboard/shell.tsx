"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClinicPaDashboard } from "../ClinicPaDashboard";

function isClinicPlan(planId: string | null) {
  return (
    planId === "clinic-starter" ||
    planId === "clinic-growth" ||
    planId === "clinic-enterprise"
  );
}

function clearLocalCache() {
  try {
    window.localStorage.removeItem("scriptids_token");
    window.localStorage.removeItem("scriptids_plan");
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem("scriptids_prior_auth_print_pack_v1");
  } catch {
    // ignore
  }
  try {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w?.caches?.keys && w?.caches?.delete) {
        const keys: string[] = await w.caches.keys();
        await Promise.all(keys.map((k) => w.caches.delete(k)));
      }
    })();
  } catch {
    // ignore
  }
}

export function ClinicPaDashboardShell() {
  const [token, setToken] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setToken(window.localStorage.getItem("scriptids_token"));
        setPlanId(window.localStorage.getItem("scriptids_plan"));
      } catch {
        setToken(null);
        setPlanId(null);
      }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const signedIn = Boolean(token);
  const allowed = signedIn && isClinicPlan(planId);

  const email = useMemo(() => {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 3) return null;
    try {
      const decoded = decodeURIComponent(parts[1] ?? "");
      return decoded.includes("@") ? decoded : null;
    } catch {
      return null;
    }
  }, [token]);

  if (!allowed) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Clinics
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Workflow dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Sign in and activate a clinic plan to access case queues and
              paperwork uploads.
            </p>
          </div>
          <Link
            href="/clinic/pa"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Back to Clinics
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!signedIn ? (
            <>
              <Link
                href="/login?next=%2Fclinic%2Fpa%2Fdashboard"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup?next=%2Fclinic%2Fpa%2Fdashboard"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                Sign up
              </Link>
            </>
          ) : (
            <Link
              href="/pricing/clinics?next=%2Fclinic%2Fpa%2Fdashboard"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Choose a clinic plan
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Clinic workflow
            </span>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="text-xs text-[var(--muted)]">
              {planId ?? "clinic"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Dashboard">
              <span className="rounded-lg bg-[var(--muted-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)]">
                Case queue
              </span>
              <span className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--muted)]">
                Paperwork
              </span>
              <span className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--muted)]">
                Reports
              </span>
            </nav>

            <div className="relative">
              <button
                type="button"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {email ?? "Account"}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    onClick={() => {
                      setMenuOpen(false);
                      clearLocalCache();
                      window.location.reload();
                    }}
                  >
                    Clear cache
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    onClick={() => {
                      setMenuOpen(false);
                      clearLocalCache();
                      window.location.assign("/clinic/pa");
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClinicPaDashboard />
    </div>
  );
}

