import { WaveOpticsLab } from "@/components/WaveOpticsLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wave Optics — Phase 23b" };

export default function LabPhase23bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-23-b" />
      <WaveOpticsLab />
    </>
  );
}
