import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { hardwareProjects } from "@/lib/data/hardware";
import type { Locale } from "@/types";
import { HardwareList } from "@/components/sections/hardware/HardwareList";

interface HardwarePageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Hardware",
};

export default async function HardwarePage({ params }: HardwarePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="pt-24 pb-20 px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <span className="font-sans text-xs tracking-widest uppercase opacity-40 block mb-4">
            Physical Computing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            {dict.hardware.heading}
          </h1>
          <p className="font-sans text-lg opacity-60 max-w-2xl">{dict.hardware.subheading}</p>
        </div>
        <HardwareList dict={dict} locale={locale as Locale} projects={hardwareProjects} />
      </div>
    </div>
  );
}
