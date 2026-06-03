import { PrismaLab } from "@/components/PrismaLab";
import { LabChrome } from "@/components/LabChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Prisma — Phase 19c" };

export default function LabPhase19cPage() {
  return (
    <>
      <LabChrome route="/lab-phase-19-c" />
      <PrismaLab />
    </>
  );
}
