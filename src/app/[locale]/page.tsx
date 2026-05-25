import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";

import { IndexSection }   from "@/components/sections/home/IndexSection";
import { WorkSection }    from "@/components/sections/home/WorkSection";
import { LabSection }     from "@/components/sections/home/LabSection";
import { AboutSection }   from "@/components/sections/home/AboutSection";
import { ContactSection } from "@/components/sections/home/ContactSection";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Clayton Borges — Creative / Full-Stack Developer",
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <IndexSection   dict={dict} locale={locale as Locale} />
      <WorkSection    dict={dict} locale={locale as Locale} />
      <LabSection     dict={dict} locale={locale as Locale} />
      <AboutSection   dict={dict} locale={locale as Locale} />
      <ContactSection dict={dict} locale={locale as Locale} />
    </>
  );
}
