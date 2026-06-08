import { Navigation } from "@/components/Navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] pt-6 md:pt-8 pb-24 md:pb-16">
        {children}
      </main>
    </>
  );
}
