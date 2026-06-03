import { PercolationLab } from "@/components/PercolationLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Percolation — Phase 24b" };

export default function LabPhase24bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-24-b" />
      <PercolationLab />
    </>
  );
}
