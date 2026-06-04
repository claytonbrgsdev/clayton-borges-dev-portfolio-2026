import { GlowLab } from "@/components/GlowLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Glow — Phase 7" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase7Page() {
  return <GlowLab />;
}
