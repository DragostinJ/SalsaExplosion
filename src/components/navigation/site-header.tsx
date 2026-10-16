"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CalendarDays,
  Award,
  Sparkles,
  CreditCard,
  BarChart3,
  ClipboardCheck,
  Flame,
} from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const navLinks = [
    {
      href: "/dashboard/schedule",
      label: "Schedule",
      icon: CalendarDays,
      active: pathname === "/dashboard/schedule",
    },
    {
      href: "/dashboard/progression",
      label: "Progression",
      icon: Award,
      active: pathname === "/dashboard/progression",
    },
    {
      href: "/events",
      label: "Events & Artists",
      icon: Sparkles,
      active: pathname.startsWith("/events"),
    },
    {
      href: "/pricing",
      label: "Passes",
      icon: CreditCard,
      active: pathname === "/pricing",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin"),
    },
    {
      href: "/instructor/submissions",
      label: "Instructor Desk",
      icon: ClipboardCheck,
      active: pathname.startsWith("/instructor"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-sm shadow-amber-500/20">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold leading-none tracking-tight">
                Ritmo<span className="text-amber-500">Flow</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                Cuban Salsa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    item.active
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side Actions & User Profile */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-amber-500/20",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Join Studio
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto border-t px-4 py-2 gap-2 bg-muted/20 scrollbar-none">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1 shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                item.active
                  ? "bg-amber-500 text-white font-semibold"
                  : "bg-background text-muted-foreground border"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
