"use client";

import React from "react";
import {
  Video,
  X,
  Film,
  Link2,
  UploadCloud,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import type { DanceLevel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { POPULAR_CUBAN_FIGURES } from "./recap-types";

interface RecapStaffModalProps {
  showAttachModal: boolean;
  setShowAttachModal: (show: boolean) => void;
  attachFeedback: { type: "success" | "error"; text: string } | null;
  handleAttachSubmit: (e: React.FormEvent) => void;
  attachSessionId: string;
  setAttachSessionId: (val: string) => void;
  activeClassesForStaff: Array<{ id: string; title: string; minLevel: DanceLevel }>;
  videoSourceMode: "FILE" | "URL";
  setVideoSourceMode: (mode: "FILE" | "URL") => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  isPending: boolean;
  uploadProgress: number;
  attachVideoUrl: string;
  setAttachVideoUrl: (url: string) => void;
  attachFiguresCsv: string;
  setAttachFiguresCsv: (csv: string) => void;
  handleToggleFigureTag: (fig: string) => void;
  attachNotes: string;
  setAttachNotes: (notes: string) => void;
}

export function RecapStaffModal({
  showAttachModal,
  setShowAttachModal,
  attachFeedback,
  handleAttachSubmit,
  attachSessionId,
  setAttachSessionId,
  activeClassesForStaff,
  videoSourceMode,
  setVideoSourceMode,
  selectedFile,
  setSelectedFile,
  isDragging,
  setIsDragging,
  isPending,
  uploadProgress,
  attachVideoUrl,
  setAttachVideoUrl,
  attachFiguresCsv,
  setAttachFiguresCsv,
  handleToggleFigureTag,
  attachNotes,
  setAttachNotes,
}: RecapStaffModalProps) {
  if (!showAttachModal) return null;

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
            <h3 className="text-base font-extrabold">Attach End-of-Class Recap Video</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAttachModal(false)}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {attachFeedback && (
          <div
            className={`rounded-xl border p-3 text-xs font-semibold ${
              attachFeedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {attachFeedback.text}
          </div>
        )}

        <form onSubmit={handleAttachSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold">Class Session</label>
            <select
              aria-label="Select class session"
              value={attachSessionId}
              onChange={(e) => setAttachSessionId(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 font-semibold"
            >
              {activeClassesForStaff.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  [{cls.minLevel}] {cls.title}
                </option>
              ))}
            </select>
          </div>

          {/* Video Source Switcher */}
          <div className="space-y-2">
            <div className="flex rounded-xl bg-muted/60 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setVideoSourceMode("FILE")}
                className={`flex-1 rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceMode === "FILE"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Film className="h-3.5 w-3.5 text-amber-400" />
                <span>Upload Video File (Phone / PC)</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceMode("URL")}
                className={`flex-1 rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 ${
                  videoSourceMode === "URL"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Paste Video Link (YouTube / URL)</span>
              </button>
            </div>

            {videoSourceMode === "FILE" ? (
              <div className="space-y-2">
                {!selectedFile ? (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) setSelectedFile(f);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all ${
                      isDragging
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-muted-foreground/30 hover:border-amber-500/60 hover:bg-muted/30"
                    }`}
                  >
                    <UploadCloud className="h-7 w-7 text-amber-400 mb-1.5" />
                    <span className="font-bold text-xs text-foreground text-center">
                      Tap to choose or record recap video
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Direct from camera roll or files (MP4, MOV up to 100MB)
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setSelectedFile(f);
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Film className="h-4 w-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Ready to upload
                        </p>
                      </div>
                    </div>
                    {!isPending && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {isPending && uploadProgress > 0 && (
                  <div className="space-y-1 rounded-xl border bg-muted/20 p-2.5">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                        Uploading to studio storage...
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://... (YouTube, Vimeo, or direct MP4 link)"
                  value={attachVideoUrl}
                  onChange={(e) => setAttachVideoUrl(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 font-medium"
                />
                <p className="text-[10px] text-muted-foreground">
                  Paste a public YouTube watch link, Vimeo link, or HTTPS video URL.
                </p>
              </div>
            )}
          </div>

          {/* Figures Practiced & Quick Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold">Cuban Figures Practiced</label>
              <span className="text-[10px] text-muted-foreground">Tap chips to toggle</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-1.5">
              {POPULAR_CUBAN_FIGURES.map((figure) => {
                const active = attachFiguresCsv
                  .split(",")
                  .map((f) => f.trim().toLowerCase())
                  .includes(figure.toLowerCase());
                return (
                  <button
                    key={figure}
                    type="button"
                    onClick={() => handleToggleFigureTag(figure)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all ${
                      active
                        ? "bg-amber-500 text-stone-950 shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {active && <Check className="inline h-2.5 w-2.5 mr-1" />}
                    {figure}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              required
              placeholder="Guapea, Dile Que No, Enchufla Doble, Vacilala"
              value={attachFiguresCsv}
              onChange={(e) => setAttachFiguresCsv(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Maestro Coaching Notes & Tips</label>
            <textarea
              rows={3}
              value={attachNotes}
              onChange={(e) => setAttachNotes(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAttachModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
            >
              {isPending ? "Publishing Recap..." : "Publish Recap to Students"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
