"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Sparkles, Compass, Music, Menu } from "lucide-react";

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
      label: "Thu & Sun",
      href: "/dashboard/schedule",
      icon: CalendarDays,
      isActive: pathname.startsWith("/dashboard/schedule") || pathname.startsWith("/schedule"),
      isSpecial: false,
    },
    {
      label: "Festivals",
      href: "/events",
      icon: Sparkles,
      isActive: pathname.startsWith("/events"),
      isSpecial: true,
    },
    {
      label: "Rueda",
      href: "/dashboard/rueda",
      icon: Compass,
      isActive: pathname.startsWith("/dashboard/rueda"),
      isSpecial: false,
    },
    {
      label: "Song Trainer",
      href: "/music",
      icon: Music,
      isActive: pathname.startsWith("/music"),
      isSpecial: false,
    },
  ];

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-3 inset-x-3 z-50 h-16 border-4 border-ink bg-paper text-ink shadow-[5px_5px_0_var(--color-ink)] flex items-center justify-around px-1.5"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isSpecial) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-11 px-2.5 sm:px-3 border-2 border-ink bg-ink text-paper text-xs font-black uppercase transition-all ${
                item.isActive ? "-translate-y-0.5" : "active:scale-95"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="leading-tight tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-bold transition-all ${
              item.isActive
                ? "text-ink font-black"
                : "text-ivory-muted hover:text-ink"
            }`}
          >
            {item.isActive && (
              <span className="absolute inset-x-3 top-0 h-1 bg-poster-red" />
            )}
            <Icon
              className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                item.isActive ? "text-ink" : "text-ivory-muted"
              }`}
            />
            <span className="leading-tight tracking-tight whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={triggerDrawer}
        aria-label="Open More Menu"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-bold text-ivory-muted hover:text-ivory transition-all active:scale-95"
      >
        <Menu className="h-4.5 w-4.5 mb-0.5 text-ivory-muted" />
        <span className="leading-tight tracking-tight">Menu</span>
      </button>
    </nav>
  );
}
