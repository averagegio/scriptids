import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Scriptids account.",
};

export default function SignupPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const nextRaw = searchParams?.next;
  const next =
    typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : null;
  return (
    <main className="mx-auto max-w-lg flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Sign up
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Create an account to save your place as we add more features. Use a
        strong password you do not reuse on other sites.
      </p>
      <div className="mt-8">
        <SignupForm next={next} />
      </div>
    </main>
  );
}
