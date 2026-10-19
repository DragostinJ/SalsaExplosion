"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Sparkles, CreditCard, Award, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu?: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  function triggerDrawer() {
    if (onOpenMenu) {
      onOpenMenu();
      return;
    }
    // Dispatch custom event to open the mobile drawer from anywhere
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-mobile-nav-drawer"));
    }
  }

  const navItems = [
    {
      label: "Classes",
      href: "/dashboard/schedule",
      icon: CalendarDays,
      isActive: pathname.startsWith("/dashboard/schedule"),
    },
    {
      label: "Congress",
      href: "/events",
      icon: Sparkles,
      isActive: pathname.startsWith("/events"),
    },
    {
      label: "Passes",
      href: "/pricing",
      icon: CreditCard,
      isActive: pathname.startsWith("/pricing"),
    },
    {
      label: "Syllabus",
      href: "/dashboard/progression",
      icon: Award,
      isActive: pathname.startsWith("/dashboard/progression"),
    },
  ];

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg flex items-center justify-around px-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-colors ${
              item.isActive
                ? "text-primary-base font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`h-5 w-5 mb-0.5 ${
                item.isActive ? "text-primary-base" : "text-muted-foreground"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={triggerDrawer}
        aria-label="Open More Menu"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5 mb-0.5 text-muted-foreground" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
