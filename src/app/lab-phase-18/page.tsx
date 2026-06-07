import { ChladniLab } from "@/components/ChladniLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chladni — Phase 18" };

export default function LabPhase18Page() {
  return (
    <>
      <LabChrome route="/lab-phase-18" />
      <ChladniLab />
    </>
  );
}
