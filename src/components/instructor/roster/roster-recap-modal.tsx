"use client";

import { Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassRosterSummary } from "@/lib/constants/management";

interface RosterRecapModalProps {
  activeClass: ClassRosterSummary;
  recapVideoUrl: string;
  recapFiguresCsv: string;
  recapNotes: string;
  recapFeedback: {
    type: "success" | "error";
    text: string;
  } | null;
  isPending: boolean;
  onClose: () => void;
  onVideoUrlChange: (url: string) => void;
  onFiguresCsvChange: (csv: string) => void;
  onNotesChange: (notes: string) => void;
  onSaveRecap: (e: React.FormEvent) => void;
}

export function RosterRecapModal({
  activeClass,
  recapVideoUrl,
  recapFiguresCsv,
  recapNotes,
  recapFeedback,
  isPending,
  onClose,
  onVideoUrlChange,
  onFiguresCsvChange,
  onNotesChange,
  onSaveRecap,
}: RosterRecapModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-extrabold">Attach Class Recap Video</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {recapFeedback && (
          <div
            className={`rounded-xl border p-3 text-xs font-semibold ${
              recapFeedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {recapFeedback.text}
          </div>
        )}

        <form onSubmit={onSaveRecap} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold">Class Session</label>
            <div className="rounded-xl border bg-muted/40 p-2.5 font-bold">
              [{activeClass.minLevel}] {activeClass.title}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Recap Video URL</label>
            <input
              type="url"
              required
              placeholder="https://... (Direct MP4, Supabase Video, YouTube, Vimeo)"
              value={recapVideoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
            <p className="text-[10px] text-muted-foreground">
              Attended students will be able to review this video in their Recaps vault.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Figures & Combinations Practiced (comma-separated)</label>
            <input
              type="text"
              required
              placeholder="Guapea, Dile Que No, Enchufla Doble, Vacilala"
              value={recapFiguresCsv}
              onChange={(e) => onFiguresCsvChange(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Maestro Coaching Tips & Notes</label>
            <textarea
              rows={3}
              value={recapNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-brand hover:bg-brand-hover text-white font-bold"
            >
              {isPending ? "Publishing Recap..." : "Publish Recap to Attended Students"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
