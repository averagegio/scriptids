import type { Metadata } from "next";
import { BackNav } from "@/app/components/BackNav";
import { ClinicPaDashboardShell } from "./shell";

export const metadata: Metadata = {
  title: "Clinic workflow dashboard",
  description: "Manage clinic prior authorization case queues and paperwork.",
};

export default function ClinicPaDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <ClinicPaDashboardShell />
    </main>
  );
}

