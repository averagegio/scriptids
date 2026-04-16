import type { Metadata } from "next";
import { PrintPackClient } from "./PrintPackClient";

export const metadata: Metadata = {
  title: "Print prior auth pack",
  description: "Print-friendly prior authorization pack for your records.",
};

export default function PriorAuthPrintPage() {
  return <PrintPackClient />;
}
