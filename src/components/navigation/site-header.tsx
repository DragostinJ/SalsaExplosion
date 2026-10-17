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
} from "lucide-react";

import type { Role } from "@prisma/client";
import { switchMyAccountRoleAction } from "@/actions/management.actions";
import { InteractiveTutorialModal } from "@/components/onboarding/interactive-tutorial-modal";

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
                Ritmo<span className="text-amber-700 dark:text-amber-400">Flow</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                Cuban Salsa
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
          <InteractiveTutorialModal />

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
