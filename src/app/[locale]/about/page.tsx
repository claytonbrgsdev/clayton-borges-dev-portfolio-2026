import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { AboutContent } from "@/components/sections/about/AboutContent";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="pt-24 pb-20 px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <AboutContent dict={dict} locale={locale as Locale} />
      </div>
    </div>
  );
}
