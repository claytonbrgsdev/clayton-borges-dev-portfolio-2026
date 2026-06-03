import { SlimeLab } from "@/components/SlimeLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Slime — Phase 19" };

export default function LabPhase19Page() {
  return (
    <>
      <LabChrome route="/lab-phase-19" />
      <SlimeLab />
    </>
  );
}
