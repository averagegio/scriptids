import type { Metadata } from "next";
import { PitchDeck } from "./PitchDeck";

export const metadata: Metadata = {
  title: "Investor pitch",
  description:
    "Scriptids pitch deck: market size (TAM), MAU and revenue projections, funding goal, and use of funds.",
};

export default function PitchPage() {
  return (
    <main className="flex-1">
      <PitchDeck />
    </main>
  );
}
