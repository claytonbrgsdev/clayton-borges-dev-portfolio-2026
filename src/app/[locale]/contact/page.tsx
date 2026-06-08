import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types";
import { ContactSection } from "@/components/sections/contact/ContactSection";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch — open to freelance contracts, remote roles, and relocation. Based in Brasília, available worldwide.",
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="pt-24 pb-20 px-6 md:px-12">
      <div className="mx-auto max-w-4xl">
        <ContactSection dict={dict} locale={locale as Locale} />
      </div>
    </div>
  );
}
