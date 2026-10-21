"use client";

import { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { InteractiveTutorialDialog } from "./interactive-tutorial-dialog";

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
  const [step, setStep] = useState(0);

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
    try {
      const seen = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!seen) {
        const timer = window.setTimeout(() => {
          setStep(0);
          setIsOpen(true);
        }, 50);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [autoOpenForNewDancer]);

  return (
    <>
      {/* Trigger Pill in Header */}
      <button
        type="button"
        data-testid="how-it-works-tutorial-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setStep(0);
          setIsOpen(true);
        }}
        aria-label="How It Works - Interactive studio tutorial"
        className="hidden md:inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-secondary-base/50 bg-secondary-light text-secondary-hover px-2 sm:px-2.5 py-1.5 text-xs font-bold transition-colors hover:bg-secondary-base hover:text-white shadow-xs cursor-pointer select-none"
      >
        <HelpCircle className="h-3.5 w-3.5 text-secondary-base shrink-0 group-hover:text-white" />
        <span className="inline">How It Works</span>
      </button>

      {/* Heavy dialog portaled and mounted dynamically only on open */}
      {isOpen && (
        <InteractiveTutorialDialog
          isOpen={isOpen}
          onClose={handleClose}
          initialStep={step}
        />
      )}
    </>
  );
}
