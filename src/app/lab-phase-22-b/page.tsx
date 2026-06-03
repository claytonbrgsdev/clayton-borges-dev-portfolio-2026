import { CellularAutomatonLab } from "@/components/CellularAutomatonLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cellular Automaton — Phase 22b" };

export default function LabPhase22bPage() {
  return (
    <>
      <LabChrome route="/lab-phase-22-b" />
      <CellularAutomatonLab />
    </>
  );
}
