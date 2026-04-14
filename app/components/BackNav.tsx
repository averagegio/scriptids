"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackNavProps = {
  /** When history is empty or back would leave the app unexpectedly */
  fallbackHref?: string;
};

export function BackNav({ fallbackHref = "/" }: BackNavProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push(fallbackHref);
          }
        }}
        className="rounded-lg px-2 py-1 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
      >
        ← Back
      </button>
      <span className="text-[var(--muted)]" aria-hidden>
        ·
      </span>
      <Link
        href="/"
        className="rounded-lg px-2 py-1 font-medium text-[var(--accent)] transition-colors hover:bg-[var(--muted-bg)] hover:underline"
      >
        Home
      </Link>
    </div>
  );
}
