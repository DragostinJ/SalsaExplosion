"use client";

import { DoorOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FirstClassPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARRIVAL_STEPS = [
  { title: "Check in", text: "Go into the studio and check in with your QR code. No QR code yet? Pay at the door, cash or card." },
  { title: "Hang up your jacket", text: "Put your jacket in the wardrobe." },
  { title: "Get a drink if you want", text: "There's a licensed bar in the studio." },
] as const;

export function FirstClassPrepModal({
  isOpen,
  onClose,
}: FirstClassPrepModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-foreground max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600">
            <DoorOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>Your first night</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            When You Arrive at BOH Studios
          </h2>
        </div>

        <ol className="grid gap-2.5 sm:grid-cols-3 text-xs">
          {ARRIVAL_STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1">
              <p className="font-semibold text-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="text-muted-foreground leading-snug">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="min-h-[40px] bg-primary-base hover:bg-primary-hover text-white font-bold text-xs px-6"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
