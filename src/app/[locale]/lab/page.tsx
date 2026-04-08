import { WorldLab } from "@/components/WorldLab";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "3D World Lab" };

// Dev preview route — no layout chrome, full-screen canvas.
// Access at /en/lab or /pt/lab while running locally.
export default function LabPage() {
  return <WorldLab />;
}
