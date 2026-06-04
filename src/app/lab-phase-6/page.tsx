import { FieldLab } from "@/components/FieldLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Field — Phase 6" };

// Outside the [locale] tree — no site header/footer, exempt from locale redirect.
export default function LabPhase6Page() {
  return <FieldLab />;
}
