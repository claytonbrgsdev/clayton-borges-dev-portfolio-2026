import { MetaLab } from "@/components/MetaLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "What Is a Simulation? — Phase 26" };

export default function LabPhase26Page() {
  return (
    <>
      <LabChrome route="/lab-phase-26" />
      <MetaLab />
    </>
  );
}
