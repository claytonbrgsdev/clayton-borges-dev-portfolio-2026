import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CursorCanvas } from "@/components/CursorCanvas";

const orbit = localFont({
  src: [
    { path: "./fonts/Orbit-Regular.woff2" },
    { path: "./fonts/Orbit-Regular.ttf" },
  ],
  variable: "--font-geist-sans",
  weight: "400",
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claytonborges.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clayton Borges — Full-Stack & Creative Developer",
    template: "%s · Clayton Borges",
  },
  description:
    "Full-stack and creative developer with 3 years shipping production web apps, interactive 3D experiences, and generative tools — freelance for clients and companies across Brazil and beyond. Creator of The Lab.",
  keywords: [
    "Full-Stack Developer",
    "Creative Developer",
    "React",
    "Next.js",
    "Three.js",
    "GSAP",
    "TypeScript",
    "Python",
    "Brasília",
    "Brazil",
    "Freelance",
    "3D",
    "Generative Art",
    "Interactive",
    "The Lab",
  ],
  authors: [{ name: "Clayton Borges", url: SITE_URL }],
  creator: "Clayton Borges",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "pt_BR",
    url: SITE_URL,
    title: "Clayton Borges — Full-Stack & Creative Developer",
    description:
      "Full-stack and creative developer with 3 years shipping production web apps, interactive 3D experiences, and generative tools — freelance for clients across Brazil and beyond.",
    siteName: "Clayton Borges",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Clayton Borges — Full-Stack & Creative Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clayton Borges — Full-Stack & Creative Developer",
    description:
      "Full-stack and creative developer — production apps, interactive 3D, generative tools. Creator of The Lab.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbit.variable} ${ibmPlexMono.variable} h-full antialiased bg-black`}
    >
      {/* bg-black lives on <html> so fixed canvases at z-index:-1 are visible above it */}
      <body className="min-h-full flex flex-col text-white">
        <CursorCanvas />
        {children}
      </body>
    </html>
  );
}
