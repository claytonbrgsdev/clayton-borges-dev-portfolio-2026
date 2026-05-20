import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black`}
    >
      {/* bg-black lives on <html> so fixed canvases at z-index:-1 are visible above it */}
      <body className="min-h-full flex flex-col text-white">{children}</body>
    </html>
  );
}
