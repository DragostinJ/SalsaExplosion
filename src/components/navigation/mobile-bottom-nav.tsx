"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CalendarDays, Sparkles, CreditCard, Award, Info, Menu, Music } from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu?: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

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

  // If signed in, show Syllabus (progression). If guest, show About to avoid kicking to login
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
    isSignedIn
      ? {
          label: "Syllabus",
          href: "/dashboard/progression",
          icon: Award,
          isActive: pathname.startsWith("/dashboard/progression"),
        }
      : {
          label: "About",
          href: "/about",
          icon: Info,
          isActive: pathname.startsWith("/about"),
        },
  ];

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-around px-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold transition-all ${
              item.isActive
                ? "text-primary-base font-black scale-105"
                : "text-slate-700 dark:text-slate-300 hover:text-foreground"
            }`}
          >
            {item.isActive && (
              <span className="absolute top-1 flex h-1.5 w-1.5 rounded-full bg-primary-base shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
            )}
            <Icon
              className={`h-5 w-5 mb-0.5 transition-colors ${
                item.isActive ? "text-primary-base" : "text-slate-600 dark:text-slate-300"
              }`}
            />
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={triggerDrawer}
        aria-label="Open More Menu"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-foreground transition-all active:scale-95"
      >
        <Menu className="h-5 w-5 mb-0.5 text-slate-600 dark:text-slate-300" />
        <span className="leading-none">Menu</span>
      </button>
    </nav>
  );
}
