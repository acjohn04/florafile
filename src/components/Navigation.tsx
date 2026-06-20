"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Icon } from "./Icon";
import { FloraFileIcon } from "./FloraFileIcon";
import { useTranslation } from "@/i18n/client";

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = useSession();

  const navItems = [
    { name: t.navigation.garden, path: "/", icon: "potted_plant" },
    { name: t.navigation.identify, path: "/identify", icon: "add_a_photo" },
    { name: t.navigation.schedule, path: "/playbook", icon: "calendar_month" },
    { name: t.navigation.settings, path: "/settings", icon: "settings" },
  ];

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container w-full h-16 items-center px-[var(--spacing-margin-desktop)]">
        <Link href="/" className="text-primary font-heading font-bold text-xl flex items-center gap-2">
          <FloraFileIcon /> FloraFile
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 font-medium transition-colors cursor-pointer ${isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                <Icon name={item.icon} filled={isActive} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          {session?.user && (
            <>
              <div className="w-px h-6 bg-surface-container-high mx-2 hidden md:block" />
              <div className="flex items-center gap-3 ml-2 hidden md:flex">
                <span className="text-sm font-medium text-on-surface hidden lg:block">
                  {session.user.name || session.user.email}
                </span>
                {session.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold">
                    {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title={t.navigation?.signOut || "Sign Out"}
                >
                  <Icon name="logout" className="text-[20px]" />
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-surface-container h-20 px-6 flex items-center justify-around pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 cursor-pointer ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            >
              <div className={`w-16 h-8 flex items-center justify-center rounded-full transition-colors ${isActive ? "bg-primary-container/20" : ""}`}>
                <Icon name={item.icon} filled={isActive} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
