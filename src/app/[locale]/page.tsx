import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { PortfolioExperience } from "@/components/PortfolioExperience";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Clayton Borges — Creative / Full-Stack Developer",
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return <PortfolioExperience dict={dict} locale={locale as Locale} />;
}
