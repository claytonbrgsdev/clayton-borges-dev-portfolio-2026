import { KikaiLab } from "@/components/KikaiLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kikai — Phase 17" };

export default function LabPhase17Page() {
  return (
    <>
      <LabChrome route="/lab-phase-17" />
      <KikaiLab />
    </>
  );
}
