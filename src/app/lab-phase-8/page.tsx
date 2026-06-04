import { DendriteLab } from "@/components/DendriteLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Branching Space — Phase 8" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase8Page() {
  return <DendriteLab />;
}
