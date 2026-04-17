import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Scriptids account.",
};

export default function LoginPage({
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
        Log in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Use the email and password you signed up with. If you are trying the
        product for the first time, create an account on the sign-up page.
      </p>
      <div className="mt-8">
        <LoginForm next={next} />
      </div>
    </main>
  );
}
