"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Flame,
  Award,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
  Video,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TUTORIAL_STORAGE_KEY = "salsa_explosion_studio_tutorial_seen_v1";
export const OPEN_TUTORIAL_EVENT = "salsa_explosion:open-tutorial";

export function triggerStudioTutorial() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_TUTORIAL_EVENT));
  }
}

interface InteractiveTutorialModalProps {
  autoOpenForNewDancer?: boolean;
}

export function InteractiveTutorialModal({
  autoOpenForNewDancer = false,
}: InteractiveTutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [step, setStep] = useState(0);
  const [demoRole, setDemoRole] = useState<"LEAD" | "FOLLOW">("LEAD");
  const [demoTierIndex, setDemoTierIndex] = useState(0);
  const [demoQrCheckedIn, setDemoQrCheckedIn] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  // Listen for global trigger event
  useEffect(() => {
    const onOpenEvent = () => {
      setStep(0);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_TUTORIAL_EVENT, onOpenEvent);
    return () => window.removeEventListener(OPEN_TUTORIAL_EVENT, onOpenEvent);
  }, []);

  // Auto-open only if explicitly requested and never seen before
  useEffect(() => {
    if (!autoOpenForNewDancer) return;
    const timer = setTimeout(() => {
      try {
        const alreadySeen = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
        if (!alreadySeen) {
          setIsOpen(true);
        }
      } catch {
        // Ignore storage errors
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [autoOpenForNewDancer]);

  // Lock body scroll and handle keyboard navigation when modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background page from scrolling on mobile & desktop
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" && step < 3) setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, step, handleClose]);

  const tiers = [
    {
      name: "BEGINNER",
      subtitle: "Fundamental Timing & Casino Basic",
      moves: "Guapea, Dile Que No, Enchufla, Basic Rueda Calls",
      tip: "Zero dance experience needed! Start here with your welcome credit.",
    },
    {
      name: "IMPROVER",
      subtitle: "Circular Flow & Rueda Dynamics",
      moves: "Vacilala, Exhibela, Sombrero, Dame Dos",
      tip: "Unlocked by your instructor in class or by submitting a 30s video clip.",
    },
    {
      name: "INTERMEDIATE",
      subtitle: "Complex Turn Patterns & Contratiempo",
      moves: "Setenta (70), Setenta Complicado, Havana Styling, Son Timing",
      tip: "Includes AI Dance Co-Pilot breakdown of clave timing and frame tension.",
    },
    {
      name: "ADVANCED",
      subtitle: "Timba Musicality & Masterclass Level",
      moves: "Rumba Guaguancó Fusion, Fast Rueda Switching, Guest Bootcamps",
      tip: "Full access to every class and international guest artist intensive.",
    },
  ];

  return (
    <>
      {/* Trigger Pill in Header */}
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setIsOpen(true);
        }}
        aria-label="Open interactive studio tutorial"
        className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-base/40 bg-secondary-light/40 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-secondary-hover transition-colors hover:bg-secondary-light/70"
      >
        <HelpCircle className="h-3.5 w-3.5 text-secondary-base shrink-0" />
        <span className="inline">How It Works</span>
      </button>

      {/* Modal Backdrop & Container Portaled to document.body */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-tutorial-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm transition-opacity"
        >
          {/* Card: Bottom Sheet on Mobile, Centered Dialog on Desktop */}
          <div className="relative flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-amber-500/30 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Top Step Indicators */}
            <div className="grid grid-cols-4 gap-1.5 bg-muted/60 px-4 py-2 shrink-0">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to tutorial step ${idx + 1}`}
                  onClick={() => setStep(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    idx <= step
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-muted-foreground/25"
                  }`}
                />
              ))}
            </div>

            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-card">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xs">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 block truncate">
                    Interactive Dancer Guide • Step {step + 1} of 4
                  </span>
                  <h2
                    id="studio-tutorial-title"
                    className="text-sm sm:text-base font-extrabold tracking-tight truncate"
                  >
                    {step === 0 && "1. Partner Balance: No Partner Required!"}
                    {step === 1 && "2. Studio Wallet, Credits & Free Refunds"}
                    {step === 2 && "3. Cuban Salsa Levels & AI Video Co-Pilot"}
                    {step === 3 && "4. 1-Second Door QR Check-In & Badges"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex h-7 px-2.5 text-[11px] font-semibold border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                >
                  <Link href="/how-it-works" onClick={handleClose}>
                    Handbook Page
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Close tutorial modal"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full p-0 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    In Cuban Salsa (<strong>Casino & Rueda de Casino</strong>), we dance in a rotating circle. You <strong>never need to bring a partner</strong> because Salsa Explosion automatically balances <strong>Leads</strong> and <strong>Follows</strong> before class starts!
                  </p>

                  {/* Interactive Role Simulator */}
                  <div className="rounded-2xl border bg-muted/30 p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">
                        Try switching your dance role:
                      </span>
                      <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px]">
                        Interactive Preview
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setDemoRole("LEAD")}
                        className={`rounded-xl border p-2.5 sm:p-3 text-left transition-all ${
                          demoRole === "LEAD"
                            ? "border-blue-600 bg-blue-500/15 ring-2 ring-blue-500/30"
                            : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-300">
                            🕺 Lead Role
                          </span>
                          {demoRole === "LEAD" && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                          Guides turn signals and responds to Rueda calls.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDemoRole("FOLLOW")}
                        className={`rounded-xl border p-2.5 sm:p-3 text-left transition-all ${
                          demoRole === "FOLLOW"
                            ? "border-rose-600 bg-rose-500/15 ring-2 ring-rose-500/30"
                            : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300">
                            💃 Follow Role
                          </span>
                          {demoRole === "FOLLOW" && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          )}
                        </div>
                        <p className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                          Adds Cuban body movement and rotates in the Rueda.
                        </p>
                      </button>
                    </div>

                    {/* Simulated Live Ratio Bar */}
                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-blue-700 dark:text-blue-300">
                          Leads: {demoRole === "LEAD" ? "10/12" : "9/12"}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                          ✓ Balanced Rueda Circle
                        </span>
                        <span className="text-rose-700 dark:text-rose-300">
                          Follows: {demoRole === "FOLLOW" ? "10/12" : "9/12"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: demoRole === "LEAD" ? "83%" : "75%" }}
                          />
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-rose-600 transition-all"
                            style={{ width: demoRole === "FOLLOW" ? "83%" : "75%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Forget fumbling for cash at the studio door. Your <strong>Studio Wallet</strong> holds your class credits and membership status so booking takes <strong>1 tap</strong>.
                  </p>

                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-muted/20 p-3 space-y-1">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        Drop-In Pass
                      </Badge>
                      <div className="text-sm sm:text-base font-extrabold">1 Credit • £12</div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Great for trying your first Cuban Salsa evening class.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.06] p-3 space-y-1">
                      <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px]">
                        Most Popular
                      </Badge>
                      <div className="text-sm sm:text-base font-extrabold">5 or 10 Pack</div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Save up to 25% per class. Credits never expire during the term!
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-3 space-y-1">
                      <Badge className="bg-emerald-700 text-white text-[10px]">
                        Unlimited
                      </Badge>
                      <div className="text-sm sm:text-base font-extrabold">£99 / month</div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Book unlimited weekly classes without spending credits.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-emerald-800 dark:text-emerald-200">
                        Fair 12-Hour Cancellation Guarantee:
                      </strong>{" "}
                      <span className="text-muted-foreground">
                        Cancel at least 12 hours before class starts and your credit is <strong>automatically refunded</strong> to your wallet.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We use a structured <strong>4-Tier Cuban Salsa Curriculum</strong> so beginners feel completely safe and advanced classes stay fast-paced:
                  </p>

                  {/* Interactive 4-Tier Explorer */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tiers.map((t, idx) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setDemoTierIndex(idx)}
                        className={`rounded-xl border px-2.5 py-2 text-xs font-extrabold transition-all ${
                          demoTierIndex === idx
                            ? "bg-amber-500 text-zinc-950 border-amber-600 shadow-xs"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Tier {idx + 1}: {t.name}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400">
                        {tiers[demoTierIndex].name} — {tiers[demoTierIndex].subtitle}
                      </span>
                      <Award className="h-4 w-4 text-amber-600 shrink-0" />
                    </div>
                    <p className="text-xs font-semibold">
                      Key Figures: <span className="font-normal text-muted-foreground">{tiers[demoTierIndex].moves}</span>
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      💡 {tiers[demoTierIndex].tip}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border bg-card p-3 text-xs">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Two Ways to Level Up:</strong>{" "}
                      <span className="text-muted-foreground">
                        Your teacher can promote you during class, <em>or</em> you can submit a 30-second practice clip on the <strong>Progression</strong> tab for instant <strong>AI Dance Co-Pilot + Instructor</strong> feedback!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    When you arrive at the studio on Friday night, skip the paper clipboard! Show your QR code or scan the studio door pass to check in instantly.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Interactive QR Check-in Simulation */}
                    <div className="rounded-2xl border bg-muted/30 p-3.5 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                            Door Check-In Demo
                          </span>
                          <QrCode className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-xs font-bold">
                          Friday Night Rueda de Casino
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Tap below to see how fast door check-in works:
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setDemoQrCheckedIn((prev) => !prev)}
                        className={
                          demoQrCheckedIn
                            ? "w-full bg-emerald-700 text-white font-bold text-xs"
                            : "w-full bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-xs"
                        }
                      >
                        {demoQrCheckedIn ? (
                          <>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Checked In! Welcome to the Floor ✓
                          </>
                        ) : (
                          <>
                            <QrCode className="mr-1.5 h-3.5 w-3.5" />
                            Simulate 1-Tap Door Check-In
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Shareable 9:16 Social Milestone Preview */}
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-3.5 text-white flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                            9:16 Instagram Story Badge
                          </span>
                          <Share2 className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <p className="text-xs font-extrabold">
                          Share Your Salsa Milestone!
                        </p>
                        <p className="text-[11px] text-zinc-300">
                          Each time you unlock a new Cuban Salsa tier, you get a personalized 9:16 Story Badge to share on Instagram & WhatsApp.
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        onClick={handleClose}
                        className="w-full text-xs font-bold"
                      >
                        <Link href="/dashboard/progression">
                          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                          View My Progression Badge
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 sm:px-6 py-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-xs font-semibold"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStep((s) => s + 1)}
                    className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleClose}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Got It, Let&apos;s Dance!
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
