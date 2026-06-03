import { FluxLab } from "@/components/FluxLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flux — Phase 19b" };

export default function LabPhase19bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-19-b" />
      <FluxLab />
    </>
  );
}
