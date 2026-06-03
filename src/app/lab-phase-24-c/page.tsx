import { LSystemLab } from "@/components/LSystemLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "L-System — Phase 24c" };

export default function LabPhase24cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-24-c" />
      <LSystemLab />
    </>
  );
}
