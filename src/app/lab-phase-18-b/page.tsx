import { CausticLab } from "@/components/CausticLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Caustic — Phase 18b" };

export default function LabPhase18bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-18-b" />
      <CausticLab />
    </>
  );
}
