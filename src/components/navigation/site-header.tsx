"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CalendarDays,
  Award,
  Sparkles,
  BarChart3,
  ClipboardCheck,
  Flame,
  Users,
  QrCode,
  CalendarPlus,
  ShieldCheck,
  Video,
  Compass,
  Menu,
  ClipboardList,
  Music,
} from "lucide-react";

import dynamic from "next/dynamic";
import type { Role } from "@prisma/client";
import { switchMyAccountRoleAction } from "@/actions/management.actions";
import { InteractiveTutorialModal } from "@/components/onboarding/interactive-tutorial-modal";

const AdminNotificationBell = dynamic(
  () =>
    import("@/components/navigation/admin-notification-bell").then(
      (mod) => mod.AdminNotificationBell
    ),
  { ssr: false }
);

const MobileNavSheet = dynamic(
  () =>
    import("@/components/navigation/mobile-nav-sheet").then(
      (mod) => mod.MobileNavSheet
    ),
  { ssr: false }
);

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
  const [hasMobileNavOpened, setHasMobileNavOpened] = useState(false);

  // Allow bottom nav bar to trigger the mobile drawer
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOpen = () => {
        setHasMobileNavOpened(true);
        setIsMobileNavOpen(true);
      };
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

  // Define base public links accessible to all visitors (matching theplace.org.uk architecture)
  const publicLinks = [
    {
      href: "/dashboard/schedule",
      label: "Thu & Sun Classes",
      icon: CalendarDays,
      active: pathname === "/dashboard/schedule" || pathname === "/schedule",
    },
    {
      href: "/events",
      label: "Festivals & Tickets",
      icon: Sparkles,
      active: pathname.startsWith("/events"),
    },
    {
      href: "/dashboard/rueda",
      label: "Rueda Dictionary",
      icon: Compass,
      active: pathname.startsWith("/dashboard/rueda"),
    },
    {
      href: "/music",
      label: "Song Trainer",
      icon: Music,
      active: pathname.startsWith("/music"),
    },
    {
      href: "/about",
      label: "About & Venue",
      icon: Compass,
      active: pathname.startsWith("/about"),
    },
  ];

  // Additional member-only links injected only when authenticated
  const memberOnlyLinks = [
    {
      href: "/dashboard/progression",
      label: "Progression",
      icon: Award,
      active: pathname.startsWith("/dashboard/progression"),
    },
    {
      href: "/dashboard/wallet",
      label: "Wallet",
      icon: QrCode,
      active: pathname.startsWith("/dashboard/wallet"),
    },
    {
      href: "/dashboard/recaps",
      label: "Recaps",
      icon: Video,
      active: pathname.startsWith("/dashboard/recaps"),
    },
  ];

  // In authenticated mode, insert member tools (Progression, Recaps, Wallet)
  const studentLinks = isSignedIn
    ? [
        publicLinks[0], // Thu & Sun Classes
        publicLinks[1], // Festivals & Tickets
        publicLinks[2], // Rueda Dictionary
        publicLinks[3], // Song Trainer
        memberOnlyLinks[0], // Progression
        memberOnlyLinks[2], // Recaps
        memberOnlyLinks[1], // Wallet
        publicLinks[4], // About & Venue
      ]
    : publicLinks;

  const instructorLinks = [
    {
      href: "/instructor/students",
      label: "Students",
      icon: Users,
      active: pathname.startsWith("/instructor/students"),
    },
    {
      href: "/instructor/submissions",
      label: "Grading",
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
      href: "/admin/operations",
      shortLabel: "Ops",
      fullLabel: "Operations",
      icon: ClipboardList,
      active: pathname.startsWith("/admin/operations"),
    },
    {
      href: "/admin/analytics",
      shortLabel: "Analytics",
      fullLabel: "Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin/analytics"),
    },
    {
      href: "/admin/classes",
      shortLabel: "Classes",
      fullLabel: "Classes",
      icon: CalendarPlus,
      active: pathname.startsWith("/admin/classes"),
    },
    {
      href: "/admin/events",
      shortLabel: "Events",
      fullLabel: "Events",
      icon: ShieldCheck,
      active: pathname.startsWith("/admin/events"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-3 sm:gap-4">
        {/* Brand Logo & Context-Aware Left Nav */}
        <div className="flex items-center gap-2.5 lg:gap-5 min-w-0 flex-1 overflow-x-clip">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-85 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-sm shadow-primary-base/20 shrink-0">
              <Flame className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-lg font-black leading-none tracking-tight">
                Salsa <span className="text-rose-700 dark:text-rose-400">Explosion</span>
              </span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">
                Bournemouth • Cuba
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Filtered by active role persona) */}
          <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-1.5 whitespace-nowrap min-w-0 overflow-x-clip">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard/schedule"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                    pathname === "/dashboard/schedule"
                      ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/music"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                    pathname.startsWith("/music")
                      ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
                  }`}
                >
                  <Music className="h-3.5 w-3.5" />
                  <span>Song Trainer</span>
                </Link>

                <div className="h-4 w-px bg-line mx-0.5 shrink-0" />

                <div className="flex items-center gap-1 rounded-xl border border-gold/30 bg-gold/10 p-1 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold px-1 hidden 2xl:inline">
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
                            ? "bg-gold text-stone-950 font-bold shadow-xs"
                            : "text-muted-foreground hover:bg-gold/15 hover:text-ivory"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="hidden 2xl:inline">{item.fullLabel}</span>
                        <span className="2xl:hidden">{item.shortLabel}</span>
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
                      ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/music"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname.startsWith("/music")
                      ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
                  }`}
                >
                  <Music className="h-3.5 w-3.5" />
                  <span>Song Trainer</span>
                </Link>
                <Link
                  href="/events"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    pathname.startsWith("/events")
                      ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Events</span>
                </Link>

                <div className="h-4 w-px bg-line mx-1" />

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
                            ? "bg-emerald-600 text-white shadow-xs font-bold"
                            : "text-muted-foreground hover:bg-secondary-base/10 hover:text-ivory"
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
                        ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
                        : "text-muted-foreground hover:bg-surface-3/80 hover:text-ivory"
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
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto z-10">
          <InteractiveTutorialModal />

          {isAdmin && <AdminNotificationBell />}

          {isSignedIn ? (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Interactive Studio Demo Role Switcher (Shown on sm+; mobile accesses via slide-in drawer) */}
              {canSwitchRoles && (
                <div
                  role="group"
                  aria-label="Portal Role Switcher"
                  className="hidden sm:inline-flex items-center rounded-lg border border-line bg-surface-3/60 p-0.5 text-[11px] shrink-0 shadow-xs"
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
                              ? "bg-gold text-stone-950 shadow-xs"
                              : r === "INSTRUCTOR"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-brand text-white shadow-xs"
                            : "text-muted-foreground hover:text-ivory hover:bg-surface-3"
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
                    avatarBox: "h-8 w-8 ring-2 ring-gold/30",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <Link
                href="/sign-in"
                className="rounded-xl border border-line bg-transparent px-3 py-1.5 text-xs font-bold text-ivory hover:bg-surface-3 transition-colors shrink-0"
              >
                Sign In
              </Link>
              <Link
                href="/events"
                className="rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover transition-colors min-h-9 flex items-center justify-center whitespace-nowrap shrink-0"
              >
                Book Festival Passes &rarr;
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile & Tablet < xl) */}
          <button
            type="button"
            onClick={() => {
              setHasMobileNavOpened(true);
              setIsMobileNavOpen(true);
            }}
            aria-label="Open mobile navigation menu"
            aria-expanded={isMobileNavOpen}
            className="flex xl:hidden h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1 text-muted-foreground hover:text-ivory hover:bg-surface-3 transition-colors shrink-0 shadow-xs"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-In Accessible Mobile Navigation Sheet (Mounted only upon first open to eliminate initial mobile TBT & DOM bloat) */}
      {(hasMobileNavOpened || isMobileNavOpen) && (
        <MobileNavSheet
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          role={role}
          canSwitchRoles={canSwitchRoles}
          handleRoleSwitch={handleRoleSwitch}
          isPending={isPending}
        />
      )}
    </header>
  );
}
