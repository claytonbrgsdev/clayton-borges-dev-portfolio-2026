import { IFSLab } from "@/components/IFSLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "IFS — Phase 23c" };

export default function LabPhase23cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-23-c" />
      <IFSLab />
    </>
  );
}
