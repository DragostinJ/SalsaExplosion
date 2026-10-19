"use client";

import { useState, useEffect, useTransition } from "react";
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
  MapPin,
  Menu,
} from "lucide-react";

import type { Role } from "@prisma/client";
import { switchMyAccountRoleAction } from "@/actions/management.actions";
import { InteractiveTutorialModal } from "@/components/onboarding/interactive-tutorial-modal";
import { AdminNotificationBell } from "@/components/navigation/admin-notification-bell";
import { MobileNavSheet } from "@/components/navigation/mobile-nav-sheet";

import { toast } from "sonner";

interface SiteHeaderProps {
  role: Role | null;
  canSwitchRoles?: boolean;
}

export function SiteHeader({ role, canSwitchRoles = false }: SiteHeaderProps) {
  const isAdmin = role === "ADMIN";
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Allow bottom nav bar to trigger the mobile drawer
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOpen = () => setIsMobileNavOpen(true);
      window.addEventListener("open-mobile-nav-drawer", handleOpen);
      return () => window.removeEventListener("open-mobile-nav-drawer", handleOpen);
    }
  }, []);

  const handleRoleSwitch = (targetRole: Role) => {
    startTransition(async () => {
      try {
        const res = await switchMyAccountRoleAction({ targetRole });
        if (res.success) {
          toast.success(`Active workspace switched to ${targetRole === "ADMIN" ? "Owner" : targetRole === "INSTRUCTOR" ? "Teacher" : "Dancer"}`);
          router.refresh();
          // Force a clean reload so layout, Prisma viewer, and active links rehydrate immediately
          window.location.reload();
        } else {
          console.error("[handleRoleSwitch] Error:", res.error);
          toast.error(res.error?.message || "Could not switch role.");
        }
      } catch (err) {
        console.error("[handleRoleSwitch] Failed:", err);
        toast.error("An unexpected error occurred while switching roles.");
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
      href: "/dashboard/progression",
      label: "Progression",
      icon: Award,
      active: pathname.startsWith("/dashboard/progression"),
    },
    {
      href: "/dashboard/recaps",
      label: "Recaps",
      icon: Video,
      active: pathname.startsWith("/dashboard/recaps"),
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-3 sm:gap-4">
        {/* Brand Logo & Context-Aware Left Nav */}
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-sm shadow-primary-base/20">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black leading-none tracking-tight">
                Salsa <span className="text-rose-700 dark:text-rose-400">Explosion</span>
              </span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">
                Bournemouth • Cuba
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Filtered by active role persona) */}
          <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-1.5 whitespace-nowrap min-w-0">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard/schedule"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname === "/dashboard/schedule"
                      ? "bg-primary-base text-white shadow-xs font-bold"
                      : "text-text-muted hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/events"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname.startsWith("/events")
                      ? "bg-primary-base text-white shadow-xs font-bold"
                      : "text-text-muted hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Events</span>
                </Link>

                <div className="h-4 w-px bg-border mx-1" />

                <div className="flex items-center gap-1 rounded-xl border border-accent-tangerine/30 bg-accent-tangerine/[0.08] px-2 py-1 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-tangerine px-1">
                    Admin:
                  </span>
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                          item.active
                            ? "bg-accent-tangerine text-zinc-950 font-bold shadow-xs"
                            : "text-text-muted hover:bg-accent-tangerine/10 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : role === "INSTRUCTOR" ? (
              <>
                <Link
                  href="/dashboard/schedule"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname === "/dashboard/schedule"
                      ? "bg-primary-base text-white shadow-xs font-bold"
                      : "text-text-muted hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/events"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname.startsWith("/events")
                      ? "bg-primary-base text-white shadow-xs font-bold"
                      : "text-text-muted hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Events</span>
                </Link>

                <div className="h-4 w-px bg-border mx-1" />

                <div className="flex items-center gap-1 rounded-xl border border-secondary-base/30 bg-secondary-base/[0.08] px-2 py-1 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-base px-1">
                    Teacher:
                  </span>
                  {instructorLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                          item.active
                            ? "bg-secondary-base text-white shadow-xs font-bold"
                            : "text-text-muted hover:bg-secondary-base/10 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Student / Dancer View */
              studentLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      item.active
                        ? "bg-primary-base text-white shadow-xs font-bold"
                        : "text-text-muted hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        {/* Right side Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* Social Links (Instagram & Facebook) */}
          <div className="hidden sm:flex items-center gap-1 border-r border-border pr-2 shrink-0">
            <a
              href="https://www.instagram.com/salsaexplosion/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Salsa Explosion Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-pink-600 hover:bg-pink-500/10 transition-colors shrink-0"
              title="@salsaexplosion on Instagram"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/groups/salsaexplosionuk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Salsa Explosion Facebook Group"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors shrink-0"
              title="Salsa Explosion Facebook Community"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
          </div>

          <InteractiveTutorialModal />

          {isAdmin && <AdminNotificationBell />}

          {isSignedIn ? (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Interactive Studio Demo Role Switcher (Shown on sm+; mobile accesses via slide-in drawer) */}
              {canSwitchRoles && (
                <div
                  role="group"
                  aria-label="Portal Role Switcher"
                  className="hidden sm:inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-[11px] shrink-0 shadow-xs"
                  title="Switch active portal role for testing"
                >
                  {(["STUDENT", "INSTRUCTOR", "ADMIN"] as Role[]).map((r) => {
                    const isActive = (role ?? "STUDENT") === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRoleSwitch(r)}
                        className={`rounded-md px-2 py-1 font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? r === "ADMIN"
                              ? "bg-accent-tangerine text-zinc-950 shadow-xs"
                              : r === "INSTRUCTOR"
                                ? "bg-secondary-base text-white shadow-xs"
                                : "bg-primary-base text-white shadow-xs"
                            : "text-text-muted hover:text-foreground hover:bg-muted/80"
                        } ${isPending ? "opacity-60 cursor-wait" : ""}`}
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
              )}

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-primary/20",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex text-xs font-semibold text-muted-foreground hover:text-foreground py-2 px-1"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary-base px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors min-h-9 flex items-center justify-center whitespace-nowrap"
              >
                Join Studio
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile & Tablet < xl) */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open mobile navigation menu"
            aria-expanded={isMobileNavOpen}
            className="flex xl:hidden h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-text-muted hover:text-foreground hover:bg-muted/70 transition-colors shrink-0 shadow-xs"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-In Accessible Mobile Navigation Sheet */}
      <MobileNavSheet
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        role={role}
        canSwitchRoles={canSwitchRoles}
        handleRoleSwitch={handleRoleSwitch}
        isPending={isPending}
      />
    </header>
  );
}
