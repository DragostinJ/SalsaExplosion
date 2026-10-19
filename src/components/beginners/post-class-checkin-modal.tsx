"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Heart,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitPostClassFeedbackAction } from "@/actions/beginner.actions";

interface PostClassCheckinModalProps {
  classSessionId: string;
  classTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PostClassCheckinModal({
  classSessionId,
  classTitle,
  isOpen,
  onClose,
}: PostClassCheckinModalProps) {
  const [isPending, startTransition] = useTransition();
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (
    sentiment: "LOVED_IT" | "CHALLENGING_FUN" | "A_BIT_OVERWHELMED"
  ) => {
    startTransition(async () => {
      const res = await submitPostClassFeedbackAction({
        classSessionId,
        sentiment,
      });

      if (res.success && res.data) {
        toast.success("Comfort check-in recorded!", {
          description: "Thank you for helping us make Salsa Explosion welcoming for everyone.",
        });
        setEncouragement(res.data.encouragement);
        setSubmitted(true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-card p-6 shadow-2xl space-y-5">
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Heart className="h-3.5 w-3.5 text-amber-600" />
            <span>Post-Class Check-In</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            How Did Your Class Feel Today?
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            Attended: <strong>{classTitle}</strong>. Your feedback is private and helps Maestro Enrique pace future sessions.
          </p>
        </div>

        {submitted && encouragement ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Feedback Saved! Here&apos;s a Note From Maestro Enrique:</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed pl-7">
              &ldquo;{encouragement}&rdquo;
            </p>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Close & View Next Classes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmit("LOVED_IT")}
                className="rounded-xl border border-border/70 bg-card p-3.5 text-center space-y-2 hover:border-emerald-500 hover:bg-emerald-500/[0.05] transition-all group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  🌟
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Loved It!</p>
                  <p className="text-[10px] text-muted-foreground">Felt like magic</p>
                </div>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmit("CHALLENGING_FUN")}
                className="rounded-xl border border-border/70 bg-card p-3.5 text-center space-y-2 hover:border-amber-500 hover:bg-amber-500/[0.05] transition-all group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  👍
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Challenging</p>
                  <p className="text-[10px] text-muted-foreground">Good fun & sweat</p>
                </div>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmit("A_BIT_OVERWHELMED")}
                className="rounded-xl border border-border/70 bg-card p-3.5 text-center space-y-2 hover:border-purple-500 hover:bg-purple-500/[0.05] transition-all group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  😅
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Overwhelmed</p>
                  <p className="text-[10px] text-muted-foreground">Brain was frying</p>
                </div>
              </button>
            </div>

            {isPending && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span>Recording your check-in...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
