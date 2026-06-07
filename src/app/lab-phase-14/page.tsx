import { CircuitLab } from "@/components/CircuitLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Circuit — Phase 14" };

export default function LabPhase14Page() {
  return (
    <>
      <LabChrome route="/lab-phase-14" />
      <CircuitLab />
    </>
  );
}
