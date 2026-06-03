import { MandelbrotLab } from "@/components/MandelbrotLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mandelbrot — Phase 24" };

export default function LabPhase24Page() {
  return (
    <>
      <LabChrome route="/lab-phase-24" />
      <MandelbrotLab />
    </>
  );
}
