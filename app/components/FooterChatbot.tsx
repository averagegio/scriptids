"use client";

import { useState } from "react";
import { SymptomSearchBar } from "./SymptomSearchBar";

export function FooterChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Scripti in the footer
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Open the same Scripti symptom search here for quick, educational
            ideas—not medical advice.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
          aria-expanded={open}
        >
          {open ? "Close Scripti" : "Open Scripti"}
        </button>
      </div>
      {open && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <SymptomSearchBar variant="compact" className="max-w-xl" />
        </div>
      )}
    </div>
  );
}
