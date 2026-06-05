import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CursorCanvas } from "@/components/CursorCanvas";

const syne = Syne({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Clayton Borges — Full-Stack Developer",
  description:
    "Full-Stack Developer specializing in React, Next.js, Three.js 3D, and Python. Based in Brasília, Brazil. Available for remote work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${ibmPlexMono.variable} h-full antialiased bg-black`}
    >
      {/* bg-black lives on <html> so fixed canvases at z-index:-1 are visible above it */}
      <body className="min-h-full flex flex-col text-white">
        <CursorCanvas />
        {children}
      </body>
    </html>
  );
}
