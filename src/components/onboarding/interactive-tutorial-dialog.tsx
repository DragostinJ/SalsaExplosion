"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Flame,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InteractiveTutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export function InteractiveTutorialDialog({
  isOpen,
  onClose,
  initialStep = 0,
}: InteractiveTutorialDialogProps) {
  const [step, setStep] = useState(initialStep);
  const [demoRole, setDemoRole] = useState<"LEAD" | "FOLLOW">("LEAD");
  const [demoTierIndex, setDemoTierIndex] = useState(0);
  const [demoQrCheckedIn, setDemoQrCheckedIn] = useState(false);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && step < 3) setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, step, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-tutorial-title"
      data-testid="interactive-tutorial-dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm transition-opacity"
    >
      {/* Card: Bottom Sheet on Mobile, Centered Dialog on Desktop */}
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-primary-base/30 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
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
                  ? "bg-gradient-to-r from-primary-base to-accent-tangerine"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* STEP 0: Lead/Follow Ratio Balance & Zero Partner Needed */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                    Strict Ratio Protection
                  </Badge>
                  <span className="text-muted-foreground text-xs font-semibold">
                    Never wait on the sidelines
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  Unlike traditional dance schools where followers outnumber leaders, Salsa Explosion enforces{" "}
                  <strong className="text-amber-700 dark:text-amber-400">equal Lead &amp; Follow slot caps</strong> on every class session.
                </p>
              </div>

              {/* Interactive Demo Control */}
              <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5">
                <span className="text-xs font-bold text-foreground block">
                  Try it: Choose your dance role preference
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoRole("LEAD")}
                    className={`flex items-center justify-center gap-2 rounded-lg p-2.5 font-bold transition-all ${
                      demoRole === "LEAD"
                        ? "bg-secondary-base text-white shadow-xs ring-2 ring-secondary-base/40"
                        : "bg-card border text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span>Lead (Steering)</span>
                    {demoRole === "LEAD" && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoRole("FOLLOW")}
                    className={`flex items-center justify-center gap-2 rounded-lg p-2.5 font-bold transition-all ${
                      demoRole === "FOLLOW"
                        ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/40"
                        : "bg-card border text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span>Follow (Interpreting)</span>
                    {demoRole === "FOLLOW" && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                  <p>
                    ✓ <strong>Rueda de Casino Rotation:</strong> Partners rotate dynamically in a circle every 60 seconds. You dance with everyone!
                  </p>
                  <p>
                    ✓ <strong>Come Alone or With Friends:</strong> 85% of our students arrive solo on day one.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Studio Wallet, Credits & Flexible Cancellation */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-4 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    Zero Lock-In
                  </Badge>
                  <span className="text-muted-foreground text-xs font-semibold">
                    1 Free Welcome Credit on Sign-Up
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  Every dancer starts with <strong className="text-emerald-700 dark:text-emerald-400">1 complimentary credit</strong>. No credit card required. Punchcards (5-pack, 10-pack) never expire!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-card p-3 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Free Auto-Refunds</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Life happens. Cancel anytime up to 2 hours before class and your credit is immediately returned to your wallet.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-3 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <Share2 className="h-4 w-4 text-blue-600" />
                    <span>Refer Friends, Earn Credits</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Share your unique referral link. When a friend attends their first class, you both receive 1 bonus credit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 4-Tier Syllabus & AI Dance Co-Pilot */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-4 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white font-bold text-[10px]">
                    Audited Syllabus
                  </Badge>
                  <span className="text-muted-foreground text-xs font-semibold">
                    Transparent Progression
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  Track your mastery from day one. Advance to higher levels via teacher check-offs in class or by uploading a 30-second practice clip.
                </p>
              </div>

              {/* Interactive Tier Explorer */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">
                  Explore the 4 Havana Syllabus Tiers:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {tiers.map((t, idx) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setDemoTierIndex(idx)}
                      className={`rounded-lg py-2 text-center font-bold text-xs transition-all ${
                        demoTierIndex === idx
                          ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border bg-card p-3.5 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-foreground">
                      Level {demoTierIndex}: {tiers[demoTierIndex].subtitle}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      Official Curriculum
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    <strong>Key Moves:</strong> {tiers[demoTierIndex].moves}
                  </p>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg mt-1">
                    💡 {tiers[demoTierIndex].tip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 1-Second Door Check-In & Social Badges */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent p-4 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-600 text-white font-bold text-[10px]">
                    Fast Entry at BOH Studios
                  </Badge>
                  <span className="text-muted-foreground text-xs font-semibold">
                    No clipboards or paper tickets
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  When you book a class or congress pass, your personal QR token updates instantly. Show it at the studio door for 1-second check-in!
                </p>
              </div>

              {/* Interactive QR Simulation */}
              <div className="rounded-xl border bg-muted/40 p-4 text-center space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  Simulated Door Check-In:
                </span>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className={`p-3 rounded-2xl border transition-all duration-300 ${
                    demoQrCheckedIn
                      ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30"
                      : "bg-white border-border"
                  }`}>
                    <QrCode className={`h-16 w-16 ${demoQrCheckedIn ? "text-emerald-600" : "text-zinc-900"}`} />
                  </div>
                  {demoQrCheckedIn ? (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      Checked In! Welcome to Havana Rhythm!
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setDemoQrCheckedIn(true)}
                      className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs"
                    >
                      Scan QR at Studio Desk
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Navigation */}
        <div className="flex items-center justify-between border-t px-4 sm:px-6 py-3 shrink-0 bg-card">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
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
                onClick={onClose}
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
  );
}
