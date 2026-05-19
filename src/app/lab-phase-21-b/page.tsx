import { LorenzLab } from "@/components/LorenzLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lorenz — Phase 21b" };

export default function LabPhase21bPage() {
  return <LorenzLab />;
}
