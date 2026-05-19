import { ConvergenceLab } from "@/components/ConvergenceLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Convergence — Phase 2" };

// Convergence V7 — full-screen cinematic, no layout chrome.
// Outside the [locale] tree so it skips the site Header/Footer.
export default function LabPhase2Page() {
  return <ConvergenceLab />;
}
