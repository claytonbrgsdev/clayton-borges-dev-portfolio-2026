import { SandLab } from "@/components/SandLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sand — Phase 20c" };

export default function LabPhase20cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-20-c" />
      <SandLab />
    </>
  );
}
