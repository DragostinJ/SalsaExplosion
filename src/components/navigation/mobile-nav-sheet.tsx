"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  X,
  CalendarDays,
  Sparkles,
  CreditCard,
  Award,
  Video,
  MapPin,
  Compass,
  Users,
  ClipboardCheck,
  QrCode,
  BarChart3,
  CalendarPlus,
  ShieldCheck,
  Flame,
  UserCheck,
  Music,
  ShoppingBag,
  HelpCircle,
  Share2,
} from "lucide-react";
import { triggerStudioTutorial } from "@/components/onboarding/interactive-tutorial-modal";

interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  canSwitchRoles?: boolean;
  handleRoleSwitch: (role: Role) => void;
  isPending: boolean;
}

export function MobileNavSheet({
  isOpen,
  onClose,
  role,
  canSwitchRoles = false,
  handleRoleSwitch,
  isPending,
}: MobileNavSheetProps) {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);
  const isStaff = role === "INSTRUCTOR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const prevPathname = useRef(pathname);
  // Auto-close when pathname changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on sheet container or close button
    const closeBtn = sheetRef.current?.querySelector<HTMLButtonElement>("button");
    closeBtn?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const coreLinks = [
    { href: "/dashboard/schedule", label: "Schedule & Booking", icon: CalendarDays },
    { href: "/events", label: "Guest Festivals & Congress", icon: Sparkles },
    { href: "/pricing", label: "Class Passes & Memberships", icon: CreditCard },
    { href: "/dashboard/progression", label: "Syllabus Progression", icon: Award },
    { href: "/dashboard/recaps", label: "Class Video Recaps", icon: Video },
    { href: "/dashboard/rueda", label: "Rueda Call Dictionary", icon: Users },
    { href: "/private-lessons", label: "1-on-1 Private Lessons", icon: Flame },
    { href: "/venues", label: "Bournemouth Venues", icon: MapPin },
  ];

  const exploreLinks = [
    { href: "/music", label: "Cuban Music & Playlists", icon: Music },
    { href: "/shop", label: "Merch & Dance Shoes", icon: ShoppingBag },
    { href: "/how-it-works", label: "How QR Passes Work", icon: HelpCircle },
    { href: "/dashboard/referrals", label: "Dancer Referral Rewards", icon: Share2 },
    { href: "/about", label: "About Maestro Enrique", icon: Compass },
  ];

  const teacherLinks = [
    { href: "/instructor/students", label: "Student Roster & Notes", icon: Users },
    { href: "/instructor/submissions", label: "Video Grading Queue", icon: ClipboardCheck },
    { href: "/instructor/roster", label: "Live QR Class Check-In", icon: QrCode },
  ];

  const ownerLinks = [
    { href: "/admin/analytics", label: "Executive Analytics", icon: BarChart3 },
    { href: "/admin/classes", label: "Schedule Class Sessions", icon: CalendarPlus },
    { href: "/admin/events", label: "Congress & Party Admin", icon: ShieldCheck },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-[100] flex justify-end h-dvh w-screen"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <div
        ref={sheetRef}
        className="relative z-10 flex h-dvh w-[88vw] max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border"
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b px-5 shrink-0">
          <Link
            href="/dashboard/schedule"
            onClick={onClose}
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-xs">
              <Flame className="h-4 w-4 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold leading-none tracking-tight">
                Salsa <span className="text-rose-700 dark:text-rose-400">Explosion</span>
              </span>
              <span className="text-[9px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">
                Bournemouth • Cuba
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-text-muted hover:bg-muted/80 hover:text-foreground transition-colors min-h-10 min-w-10 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 overscroll-contain">
          {/* Quick Action: Interactive Studio Tutorial */}
          <div>
            <button
              type="button"
              onClick={() => {
                onClose();
                triggerStudioTutorial();
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-secondary-base/40 bg-secondary-light/40 px-3.5 py-2.5 text-xs font-bold text-secondary-hover hover:bg-secondary-light transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-secondary-base" />
                <span>Interactive Studio Guide</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-secondary-base text-white px-2 py-0.5 rounded-full">
                Learn
              </span>
            </button>
          </div>

          {/* Persona 1: Dancer Workspace */}
          <div>
            <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
              <Flame className="h-3.5 w-3.5" />
              <span>Dancer Workspace</span>
            </div>
            <nav className="space-y-1">
              {coreLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-base text-white font-bold shadow-xs"
                        : "text-text-main hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Explore Hub (Music, Merch, FAQs, Community) */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Compass className="h-3.5 w-3.5" />
              <span>Explore & Community</span>
            </div>
            <nav className="space-y-1">
              {exploreLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-base text-white font-bold shadow-xs"
                        : "text-text-main hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Persona 2: Teacher Workspace (Staff only) */}
          {isStaff && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-secondary-base">
                <Users className="h-3.5 w-3.5" />
                <span>Teacher Workspace</span>
              </div>
              <nav className="space-y-1">
                {teacherLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-secondary-base text-white font-bold shadow-xs"
                          : "text-text-main hover:bg-secondary-base/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-secondary-base"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Persona 3: Owner Workspace (Admin only) */}
          {isAdmin && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-accent-tangerine">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Owner & Studio Admin</span>
              </div>
              <nav className="space-y-1">
                {ownerLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent-tangerine text-zinc-950 font-bold shadow-xs"
                          : "text-text-main hover:bg-accent-tangerine/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-zinc-950" : "text-accent-tangerine"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Mobile Role Switcher (When allowed in non-production) */}
          {canSwitchRoles && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-1.5 px-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Test Role Switcher</span>
              </div>
              <div
                role="group"
                aria-label="Mobile Role Switcher"
                className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/60 p-1 text-xs shadow-xs"
              >
                {(["STUDENT", "INSTRUCTOR", "ADMIN"] as Role[]).map((r) => {
                  const isActive = (role ?? "STUDENT") === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRoleSwitch(r)}
                      className={`rounded-lg py-2 font-bold transition-all text-center ${
                        isActive
                          ? r === "ADMIN"
                            ? "bg-accent-tangerine text-zinc-950 shadow-xs"
                            : r === "INSTRUCTOR"
                              ? "bg-secondary-base text-white shadow-xs"
                              : "bg-primary-base text-white shadow-xs"
                          : "text-text-muted hover:text-foreground hover:bg-muted/80"
                      } ${isPending ? "opacity-60 cursor-wait" : ""}`}
                    >
                      {r === "ADMIN" ? "Owner" : r === "INSTRUCTOR" ? "Teacher" : "Dancer"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: Social Community Links */}
        <div className="border-t bg-muted/30 p-4 shrink-0">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">Join the Bournemouth Scene:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/salsaexplosion/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border text-text-muted hover:text-pink-600 hover:border-pink-500/30 transition-colors"
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
                aria-label="Facebook Group"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border text-text-muted hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                title="Salsa Explosion Facebook Community"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
