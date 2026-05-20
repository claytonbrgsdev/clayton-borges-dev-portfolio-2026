import { BecomingLab } from "@/components/BecomingLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "The Eternal Becoming — Phase 5" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase5Page() {
  return <BecomingLab />;
}
