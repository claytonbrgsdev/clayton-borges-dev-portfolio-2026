import { LorenzLab } from "@/components/LorenzLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lorenz — Phase 21b" };

export default function LabPhase21bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-21-b" />
      <LorenzLab />
    </>
  );
}
