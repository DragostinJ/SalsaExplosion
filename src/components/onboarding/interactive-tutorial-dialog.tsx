"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS, POSTER_BLOCKS } from "@/components/poster/poster-kit";
import { DOOR_PRICING, VENUE_INFO } from "@/lib/academy-data";

interface InteractiveTutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

/** The same four doors as /how-it-works, one per step. */
const STEPS = [
  {
    title: "1. Ven a clase: no partner needed",
    text: `Thursdays and Sundays at ${VENUE_INFO.shortName}. Pay at the door (£${DOOR_PRICING.oneClassPounds} one class, £${DOOR_PRICING.twoClassesPounds} two, the social included). No partner and no booking needed: everyone dances, even when the class is uneven, because the teachers rotate partners.`,
    href: "/classes",
    cta: "See the timetable",
  },
  {
    title: "2. Practica en casa: the class songs",
    text: "Every song from the classes is mapped section by section. The player shows what to dance now and what comes next, timed to the music. Learn the rueda calls with flashcards too.",
    href: "/music",
    cta: "Open the songs",
  },
  {
    title: "3. Fiestas: festivals online",
    text: "Weekenders and special nights are booked online with Stripe. Choose Lead or Follow so the teachers know who is coming; it never stops anyone from booking.",
    href: "/events",
    cta: "What's on",
  },
  {
    title: "4. Mi carnet: your pass",
    text: "Sign in to keep your festival passes with their door QR code, tell the teachers you're coming if you like, and collect a stub for every class you dance.",
    href: "/dashboard/carnet",
    cta: "Mi carnet",
  },
] as const;

export function InteractiveTutorialDialog({ isOpen, onClose, initialStep = 0 }: InteractiveTutorialDialogProps) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), STEPS.length - 1));

  // Body scroll locking while open, restored on unmount
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard: Escape closes, arrows move between steps
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((s) => Math.min(STEPS.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const current = STEPS[step];
  const block = POSTER_BLOCKS[step % POSTER_BLOCKS.length];
  const isLast = step === STEPS.length - 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-tutorial-title"
      data-testid="interactive-tutorial-dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-ink/70 sm:items-center sm:justify-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden border-4 border-ink bg-paper text-ink shadow-[10px_10px_0_var(--color-ink)]"
      >
        <div className={`flex items-center justify-between gap-3 border-b-4 border-ink px-5 py-3 ${block.bg} ${block.text}`}>
          <p className="text-xs font-bold uppercase tracking-[0.3em]">
            Cómo funciona · {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center border-2 border-ink bg-paper text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          <h2 id="studio-tutorial-title" className="text-4xl leading-[0.95]">
            {current.title}
          </h2>
          <p className="text-base font-medium leading-relaxed">{current.text}</p>
          <Link href={current.href} onClick={onClose} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
            {current.cta} →
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-4 border-ink px-5 py-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex min-h-[44px] items-center gap-1 px-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          {isLast ? (
            <button type="button" onClick={onClose} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
              Got It, Let&apos;s Dance!
            </button>
          ) : (
            <button type="button" onClick={() => setStep((s) => s + 1)} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} gap-1`}>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
