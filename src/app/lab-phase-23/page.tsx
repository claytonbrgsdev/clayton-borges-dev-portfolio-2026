import { IsingLab } from "@/components/IsingLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ising — Phase 23" };

export default function LabPhase23Page() {
  return (
    <>
      <LabChrome route="/lab-phase-23" />
      <IsingLab />
    </>
  );
}
