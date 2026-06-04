import type { Metadata } from "next";
import { LabLanding } from "@/components/LabLanding";

export const metadata: Metadata = {
  title: "The Lab — Clayton Borges",
  description: "Three acts. 23 scroll-driven experiments. A field guide to the rules that write themselves.",
};

export default function LabPage() {
  return <LabLanding />;
}
