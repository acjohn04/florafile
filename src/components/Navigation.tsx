"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Garden", path: "/", icon: "potted_plant" },
    { name: "Identify", path: "/identify", icon: "photo_camera" },
    { name: "Schedule", path: "/playbook", icon: "calendar_month" },
    { name: "Doctor", path: "/doctor", icon: "medical_services" },
  ];

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container w-full h-16 items-center px-[var(--spacing-margin-desktop)]">
        <Link href="/" className="text-primary font-heading font-bold text-xl flex items-center gap-2">
          <Icon name="spa" filled /> FloraFile
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 font-medium transition-colors ${isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                <Icon name={item.icon} filled={isActive} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="w-px h-6 bg-surface-container-high mx-2" />
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <Icon name="notifications" />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold ml-2">
            U
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-surface-container h-20 px-6 flex items-center justify-between pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            >
              <div className={`w-16 h-8 flex items-center justify-center rounded-full transition-colors ${isActive ? "bg-primary-container/20" : ""}`}>
                <Icon name={item.icon} filled={isActive} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        <Link
          href="/doctor"
          className={`flex flex-col items-center gap-1 ${pathname.startsWith("/doctor") ? "text-primary" : "text-on-surface-variant"}`}
        >
          <div className={`w-16 h-8 flex items-center justify-center rounded-full transition-colors ${pathname.startsWith("/doctor") ? "bg-primary-container/20" : ""}`}>
            <Icon name="medical_services" filled={pathname.startsWith("/doctor")} />
          </div>
          <span className="text-[10px] font-medium">Doctor</span>
        </Link>
      </nav>
    </>
  );
}
