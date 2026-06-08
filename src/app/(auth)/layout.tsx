import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — FloraFile",
  description: "Sign in to access your digital garden companion.",
};

/**
 * Minimal layout for auth pages — no Navigation, no main padding.
 * Gives the login page a clean, focused, full-screen centered look.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
      {children}
    </main>
  );
}
