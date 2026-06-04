import { WaveLab } from "@/components/WaveLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Interference Field — Phase 4" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase4Page() {
  return <WaveLab />;
}
