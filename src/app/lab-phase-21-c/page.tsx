import { NewtonLab } from "@/components/NewtonLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Newton — Phase 21c" };

export default function LabPhase21cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-21-c" />
      <NewtonLab />
    </>
  );
}
