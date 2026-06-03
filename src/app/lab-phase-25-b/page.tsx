import { WireWorldLab } from "@/components/WireWorldLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "WireWorld — Phase 25b" };

export default function LabPhase25bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-25-b" />
      <WireWorldLab />
    </>
  );
}
