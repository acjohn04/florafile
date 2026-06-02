import type { Metadata } from "next";
import { Quicksand, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FloraFile — Your Digital Garden Companion",
  description:
    "Identify, catalog, and care for your houseplants with AI-powered diagnostics and personalized care schedules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${plusJakartaSans.variable} dark h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <Navigation />
        <main className="flex-grow w-full max-w-[1200px] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] pt-6 md:pt-8 pb-24 md:pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
