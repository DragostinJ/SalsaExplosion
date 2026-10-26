"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const ETIQUETTE_STORAGE_KEY = "salsa_explosion_etiquette_agreed_v1";

interface DigitalEtiquetteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function DigitalEtiquetteModal({
  isOpen,
  onClose,
  onAgree,
}: DigitalEtiquetteModalProps) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(ETIQUETTE_STORAGE_KEY);
        if (stored === "true") {
          setAgreed(true);
        }
      } catch {
        // storage unavailable
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      window.localStorage.setItem(ETIQUETTE_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onAgree();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Community Safety Protocol</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Salsa Explosion Dance Floor Etiquette
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To keep our dance floor welcoming, safe, and ego-free for absolute beginners, all dancers agree to these 4 principles before their first booking:
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Heart className="h-4 w-4 shrink-0" />
              <span>1. Gentle Frame & No Forceful Pulling</span>
            </div>
            <p className="text-muted-foreground pl-6 leading-relaxed">
              Leads: guide with fingertips and body position—never yank, grip tightly, or wrench shoulders. Follows: keep your frame responsive and light. Both partners dance with zero pain.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-400">
              <Users className="h-4 w-4 shrink-0" />
              <span>2. Equal Rotational Practice</span>
            </div>
            <p className="text-muted-foreground pl-6 leading-relaxed">
              In Cuban Salsa and Rueda de Casino, we rotate continuously. Dancing with different heights and levels accelerates your lead/follow connection and ensures no one is left behind.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>3. Freshness & Floor Hygiene</span>
            </div>
            <p className="text-muted-foreground pl-6 leading-relaxed">
              Dancing is close-contact social art. Please wear clean clothes, apply deodorant, carry breath mints, and bring a small sweat towel for intense drills.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>4. Zero Judgment & Safe Space</span>
            </div>
            <p className="text-muted-foreground pl-6 leading-relaxed">
              Everyone was once a beginner on day one. Mistakes are celebrated as part of learning. Anyone acting inappropriately or making another dancer uncomfortable will be asked to leave.
            </p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3.5 flex items-start gap-3">
          <input
            type="checkbox"
            id="etiquette-agree-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line bg-surface-3 text-gold focus:ring-gold"
          />
          <label
            htmlFor="etiquette-agree-checkbox"
            className="text-xs font-semibold text-foreground cursor-pointer select-none leading-snug"
          >
            I commit to upholding these dance floor standards for mutual safety, respect, and partner comfort.
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!agreed}
            onClick={handleConfirm}
            className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs px-5 shadow-xs"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Accept & Continue Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
