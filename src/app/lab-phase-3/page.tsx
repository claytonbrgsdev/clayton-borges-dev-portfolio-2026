import { LiquidLab } from "@/components/LiquidLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Liquid Matter — Phase 3" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase3Page() {
  return <LiquidLab />;
}
