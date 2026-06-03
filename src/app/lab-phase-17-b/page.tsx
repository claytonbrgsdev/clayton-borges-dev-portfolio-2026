import { HamonLab } from "@/components/HamonLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hamon — Phase 17b" };

export default function LabPhase17bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-17-b" />
      <HamonLab />
    </>
  );
}
