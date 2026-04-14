import Link from "next/link";
import { API_LINKS } from "@/lib/api-meta";
import { FooterChatbot } from "./FooterChatbot";

const FOOTER_NAV = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Scripti" },
  { href: "/prior-auth", label: "Prior auth prediction" },
  { href: "/intelligence", label: "Drug intelligence" },
  { href: "/pricing", label: "Pricing" },
  { href: "/api-reference", label: "API" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
] as const;

const FOOTER_LEGAL = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href={API_LINKS.home}
              className="font-semibold text-[var(--foreground)]"
            >
              Scriptids
            </Link>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              Clear answers about medications, insurance steps, and side-effect
              trends. Not a substitute for your care team.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
            aria-label="Footer"
          >
            {FOOTER_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <nav
          className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]"
          aria-label="Legal"
        >
          {FOOTER_LEGAL.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-[var(--foreground)]">
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5">
          <FooterChatbot />
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Scriptids. Not medical advice.
        </p>
      </div>
    </footer>
  );
}
