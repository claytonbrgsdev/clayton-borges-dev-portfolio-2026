import { LangtonLab } from "@/components/LangtonLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Langton — Phase 22c" };

export default function LabPhase22cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-22-c" />
      <LangtonLab />
    </>
  );
}
