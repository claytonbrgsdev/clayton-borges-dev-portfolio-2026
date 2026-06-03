import { OrbitLab } from "@/components/OrbitLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orbit — Phase 20b" };

export default function LabPhase20bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-20-b" />
      <OrbitLab />
    </>
  );
}
