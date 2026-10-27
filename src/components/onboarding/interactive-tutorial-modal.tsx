"use client";

import { useState, useEffect, useCallback } from "react";
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
