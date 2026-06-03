import { SpiroLab } from "@/components/SpiroLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Spiro — Phase 25c" };

export default function LabPhase25cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-25-c" />
      <SpiroLab />
    </>
  );
}
