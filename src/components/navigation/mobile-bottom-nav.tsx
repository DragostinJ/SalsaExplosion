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
      className="md:hidden fixed bottom-4 inset-x-4 z-50 h-16 rounded-full bg-surface-1/90 backdrop-blur-xl border border-line shadow-2xl flex items-center justify-around px-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isSpecial) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-11 px-2.5 sm:px-3 rounded-full text-xs font-black transition-all ${
                item.isActive
                  ? "bg-brand text-white shadow-xs scale-105"
                  : "bg-brand/90 hover:bg-brand text-white shadow-xs active:scale-95"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5 text-white" />
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
                ? "text-gold font-black scale-105"
                : "text-ivory-muted hover:text-ivory"
            }`}
          >
            {item.isActive && (
              <span className="absolute top-1.5 flex h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            )}
            <Icon
              className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                item.isActive ? "text-gold" : "text-ivory-muted"
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
