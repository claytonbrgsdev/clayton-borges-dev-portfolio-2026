import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { GSAPProvider } from "@/components/providers/GSAPProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary, locales } from "@/lib/i18n";
import type { Locale } from "@/types";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const description = isEn
    ? "Full-Stack Developer specializing in React, Next.js, Three.js 3D, and Python. Based in Brasília, Brazil. Available for remote work."
    : "Desenvolvedor Full-Stack especializado em React, Next.js, Three.js 3D e Python. Baseado em Brasília, Brasil. Disponível para trabalho remoto.";

  return {
    title: {
      default: "Clayton Borges — Full-Stack Developer",
      template: "%s | Clayton Borges",
    },
    description,
    keywords: ["Full-Stack Developer", "React", "Next.js", "Three.js", "TypeScript", "Python", "Brasília", "Brazil", "Remote"],
    authors: [{ name: "Clayton Borges", url: "https://github.com/claytonbrgsdev" }],
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "Clayton Borges — Full-Stack Developer",
      locale: isEn ? "en_US" : "pt_BR",
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: "Clayton Borges — Full-Stack Developer",
      description,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = getDictionary(locale as Locale);

  return (
    <LenisProvider>
      <GSAPProvider>
        <Header dict={dict} />
        <main className="min-h-screen">{children}</main>
        <Footer dict={dict} locale={locale as Locale} />
      </GSAPProvider>
    </LenisProvider>
  );
}
