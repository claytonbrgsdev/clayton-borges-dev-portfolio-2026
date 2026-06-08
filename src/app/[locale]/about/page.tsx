import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { AboutContent } from "@/components/sections/about/AboutContent";
import { AboutBackground } from "@/components/AboutBackground";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "About",
  description:
    "3 years freelance — shipping production apps, interactive 3D experiences, and generative tools for clients and companies worldwide. Based in Brasília. Creator of The Lab.",
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <AboutBackground />
      <div className="relative z-10 pt-24 pb-20 px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <AboutContent dict={dict} locale={locale as Locale} />
        </div>
      </div>
    </>
  );
}
