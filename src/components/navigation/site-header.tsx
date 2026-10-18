"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CalendarDays,
  Award,
  Sparkles,
  CreditCard,
  BarChart3,
  ClipboardCheck,
  Flame,
  Users,
  QrCode,
  CalendarPlus,
  ShieldCheck,
  Video,
  Compass,
  HelpCircle,
  MapPin,
} from "lucide-react";

import type { Role } from "@prisma/client";
import { switchMyAccountRoleAction } from "@/actions/management.actions";
import { InteractiveTutorialModal } from "@/components/onboarding/interactive-tutorial-modal";
import { AdminNotificationBell } from "@/components/navigation/admin-notification-bell";

interface SiteHeaderProps {
  role: Role | null;
}

export function SiteHeader({ role }: SiteHeaderProps) {
  const isStaff = role === "INSTRUCTOR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  const handleRoleSwitch = (targetRole: Role) => {
    startTransition(async () => {
      const res = await switchMyAccountRoleAction({ targetRole });
      if (res.success) {
        router.refresh();
      }
    });
  };

  const studentLinks = [
    {
      href: "/dashboard/schedule",
      label: "Schedule",
      icon: CalendarDays,
      active: pathname === "/dashboard/schedule",
    },
    {
      href: "/how-it-works",
      label: "How It Works",
      icon: HelpCircle,
      active: pathname.startsWith("/how-it-works"),
    },
    {
      href: "/dashboard/recaps",
      label: "Recaps",
      icon: Video,
      active: pathname.startsWith("/dashboard/recaps"),
    },
    {
      href: "/dashboard/progression",
      label: "Progression",
      icon: Award,
      active: pathname.startsWith("/dashboard/progression"),
    },
    {
      href: "/events",
      label: "Events",
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
      href: "/venues",
      label: "Venues",
      icon: MapPin,
      active: pathname.startsWith("/venues"),
    },
    {
      href: "/about",
      label: "About",
      icon: Compass,
      active: pathname.startsWith("/about"),
    },
  ];

  const instructorLinks = [
    {
      href: "/instructor/students",
      label: "Students",
      icon: Users,
      active: pathname.startsWith("/instructor/students"),
    },
    {
      href: "/instructor/submissions",
      label: "Video Grading",
      icon: ClipboardCheck,
      active: pathname.startsWith("/instructor/submissions"),
    },
    {
      href: "/instructor/roster",
      label: "QR Roster",
      icon: QrCode,
      active: pathname.startsWith("/instructor/roster"),
    },
  ];

  const adminLinks = [
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin/analytics"),
    },
    {
      href: "/admin/classes",
      label: "Classes",
      icon: CalendarPlus,
      active: pathname.startsWith("/admin/classes"),
    },
    {
      href: "/admin/events",
      label: "Events Admin",
      icon: ShieldCheck,
      active: pathname.startsWith("/admin/events"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-sm shadow-amber-500/20">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold leading-none tracking-tight">
                Salsa <span className="text-amber-700 dark:text-amber-400">Explosion</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                Bournemouth • Cuba
              </span>
            </div>
          </Link>

          {/* Desktop Segmented Navigation: Student | Instructor | Admin */}
          <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-3">
            {/* Student Links */}
            <div className="flex items-center gap-0.5">
              {studentLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      item.active
                        ? "bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {isStaff && <div className="h-4 w-px bg-border" />}

            {/* Instructor Menu Group */}
            {isStaff && (
              <div className="flex items-center gap-1 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 px-1.5">
                  Instructor:
                </span>
                {instructorLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                        item.active
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "text-muted-foreground hover:bg-emerald-500/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Admin Menu Group */}
            {isAdmin && (
              <div className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 px-1.5">
                  Admin:
                </span>
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                        item.active
                          ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                          : "text-muted-foreground hover:bg-amber-500/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Right side Actions & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Social Links */}
          <div className="hidden sm:flex items-center gap-1 border-r pr-2">
            <a
              href="https://www.instagram.com/salsaexplosion/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Salsa Explosion Instagram"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-pink-600 transition-colors"
              title="@salsaexplosion on Instagram"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/groups/salsaexplosionuk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Salsa Explosion Facebook Group"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-blue-600 transition-colors"
              title="Salsa Explosion Facebook Community"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
          </div>

          <InteractiveTutorialModal />

          {isAdmin && <AdminNotificationBell />}

          {isSignedIn ? (
            <div className="flex items-center gap-2.5">
              {/* Interactive Studio Demo Role Switcher */}
              <div
                role="group"
                aria-label="Portal Role Switcher"
                className="hidden sm:inline-flex items-center rounded-lg border bg-muted/40 p-0.5 text-[11px]"
                title="Switch active portal role for studio demo"
              >
                {(["STUDENT", "INSTRUCTOR", "ADMIN"] as Role[]).map((r) => {
                  const isActive = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRoleSwitch(r)}
                      className={`rounded-md px-2 py-1 font-bold transition-colors ${
                        isActive
                          ? r === "ADMIN"
                            ? "bg-amber-500 text-zinc-950 shadow-xs"
                            : r === "INSTRUCTOR"
                              ? "bg-emerald-700 text-white shadow-xs"
                              : "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r === "ADMIN"
                        ? "Owner"
                        : r === "INSTRUCTOR"
                          ? "Teacher"
                          : "Dancer"}
                    </button>
                  );
                })}
              </div>

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

      {/* Tablet & Mobile Horizontal Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="flex xl:hidden overflow-x-auto border-t px-4 py-2 gap-1.5 bg-muted/20 scrollbar-none items-center"
      >
        {[
          ...studentLinks,
          ...(isStaff ? instructorLinks : []),
          ...(isAdmin ? adminLinks : []),
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1 shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                item.active
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "bg-background text-muted-foreground border"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
