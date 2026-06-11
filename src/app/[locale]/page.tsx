import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { SimplePortfolio } from "@/components/SimplePortfolio";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Clayton Borges — Full-Stack & Creative Developer",
  description:
    "Full-stack and creative developer with 3 years shipping production web apps, interactive 3D experiences, and generative tools — freelance for clients across Brazil and beyond.",
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return <SimplePortfolio dict={dict} locale={locale as Locale} />;
}
