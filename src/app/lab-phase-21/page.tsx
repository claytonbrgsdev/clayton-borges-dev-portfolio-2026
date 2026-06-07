import { VortexLab } from "@/components/VortexLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vortex — Phase 21" };

export default function LabPhase21Page() {
  return (
    <>
      <LabChrome route="/lab-phase-21" />
      <VortexLab />
    </>
  );
}
