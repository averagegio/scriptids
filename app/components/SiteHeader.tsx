"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Scripti" },
  { href: "/prior-auth", label: "Prior auth prediction" },
  { href: "/intelligence", label: "Drug intelligence" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

const SIDEBAR_EXTRA = [{ href: "/api-reference", label: "API" }] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-semibold tracking-tight text-[var(--foreground)]"
          onClick={close}
        >
          Scriptids
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex md:flex-1 md:justify-center lg:gap-1"
          aria-label="Main"
        >
          {NAV.filter((l) => l.href !== "/").map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-2 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] lg:px-2.5"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] md:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:inline-block"
          >
            Sign up
          </Link>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-sidebar"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <span className="text-lg leading-none" aria-hidden>
                ×
              </span>
            ) : (
              <span className="flex w-5 flex-col gap-1" aria-hidden>
                <span className="h-0.5 w-full rounded-full bg-current" />
                <span className="h-0.5 w-full rounded-full bg-current" />
                <span className="h-0.5 w-full rounded-full bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 top-14 z-[100] bg-black/40 md:hidden"
              aria-label="Close menu"
              onClick={close}
            />
            <aside
              id="mobile-sidebar"
              className="fixed bottom-0 right-0 top-14 z-[110] flex w-[min(20rem,100%)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[-8px_0_24px_rgba(0,0,0,0.08)] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <nav
                className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4"
                aria-label="Mobile sidebar"
              >
                {NAV.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
                    onClick={close}
                  >
                    {label}
                  </Link>
                ))}

                <div
                  className="my-3 border-t border-[var(--border)] pt-3"
                  role="presentation"
                />

                {SIDEBAR_EXTRA.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
                    onClick={close}
                  >
                    {label}
                  </Link>
                ))}

                <div
                  className="my-3 border-t border-[var(--border)] pt-3"
                  role="presentation"
                />
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Account
                </p>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
                  onClick={close}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="mt-1 rounded-lg bg-[var(--accent)] px-3 py-2.5 text-center text-[15px] font-semibold text-white"
                  onClick={close}
                >
                  Sign up
                </Link>
              </nav>
            </aside>
          </>,
          document.body,
        )}
    </header>
  );
}
