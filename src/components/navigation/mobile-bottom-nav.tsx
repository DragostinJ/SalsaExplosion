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
      className="md:hidden fixed bottom-4 inset-x-4 z-50 h-16 rounded-full bg-black/85 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-around px-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isSpecial) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-11 px-2.5 sm:px-3 rounded-full text-[10px] font-black transition-all ${
                item.isActive
                  ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-105"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-[0_0_14px_rgba(245,158,11,0.45)] hover:brightness-110 active:scale-95"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5 text-zinc-950" />
              <span className="leading-tight tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all ${
              item.isActive
                ? "text-amber-300 font-black scale-105"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {item.isActive && (
              <span className="absolute top-1.5 flex h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            )}
            <Icon
              className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
                item.isActive ? "text-amber-300" : "text-zinc-400"
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
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
      >
        <Menu className="h-4.5 w-4.5 mb-0.5 text-zinc-400" />
        <span className="leading-tight tracking-tight">Menu</span>
      </button>
    </nav>
  );
}
