import { SpiralLab } from "@/components/SpiralLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Spiral — Phase 20" };

export default function LabPhase20Page() {
  return (
    <>
      <LabChrome route="/lab-phase-20" />
      <SpiralLab />
    </>
  );
}
