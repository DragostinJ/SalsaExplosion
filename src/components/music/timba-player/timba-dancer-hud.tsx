"use client";

import React from "react";
import {
  Headphones,
  Sparkles,
  AlertTriangle,
  BookOpen,
  X,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import type { CurriculumSkillItem } from "@/lib/constants/cuban-curriculum-2027";

interface TimbaDancerHudProps {
  activeSegment: SongSegment;
  activeSegmentIndex: number;
  totalSegments: number;
  nextSegment: SongSegment | null;
  secondsUntilNextShift: number;
  activeRole: "leader" | "follower";
  inspectingMove: CurriculumSkillItem | null;
  setInspectingMove: (move: CurriculumSkillItem | null) => void;
  resolveCurriculumMove: (slug: string) => CurriculumSkillItem | undefined;
}

export function TimbaDancerHud({
  activeSegment,
  activeSegmentIndex,
  totalSegments,
  nextSegment,
  secondsUntilNextShift,
  activeRole,
  inspectingMove,
  setInspectingMove,
  resolveCurriculumMove,
}: TimbaDancerHudProps) {
  return (
    <div className="space-y-3 sm:space-y-4 pt-2 border-t border-line">
      {/* Active Segment Announcement Banner */}
      <div
        data-testid="active-segment-hud"
        className="rounded-xl sm:rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-surface-2 to-surface-1 text-ivory p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-md transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold/80">
                Current Segment ({activeSegmentIndex + 1} of {totalSegments})
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-gold">
                {activeSegment.formattedRange}
              </span>
            </div>
            <h3 className="text-sm sm:text-2xl font-black text-ivory truncate sm:whitespace-normal">
              {activeSegment.sectionName}
            </h3>
          </div>

          {/* Next Shift Countdown */}
          {nextSegment ? (
            <div className="inline-flex sm:block items-center gap-1.5 rounded-lg sm:rounded-xl border border-line bg-surface-1/90 px-2.5 sm:px-3.5 py-1 sm:py-2 text-[11px] sm:text-xs sm:text-right self-start sm:self-auto shadow-xs shrink-0">
              <span className="text-[10px] text-stone-400 font-semibold inline sm:block">
                Next in <strong className="text-gold font-mono text-xs">{secondsUntilNextShift}s</strong>:
              </span>
              <span className="font-bold text-ivory text-[11px] truncate max-w-[220px] sm:max-w-none">
                {nextSegment.sectionName} ({nextSegment.danceGear})
              </span>
            </div>
          ) : (
            <Badge className="bg-white/10 text-stone-300 text-[10px] font-mono border-line self-start sm:self-auto shrink-0">
              Song Outro / Final Gear
            </Badge>
          )}
        </div>

        {/* Section Trigger & Dancer Cues */}
        <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2 text-xs pt-1 sm:pt-2 border-t border-white/10">
          <div
            data-testid="musical-trigger-box"
            className="rounded-xl border border-line bg-surface-3/80 p-2.5 sm:p-3 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-stone-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
              <Headphones className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gold shrink-0" />
              What to Listen For (Trigger):
            </div>
            <p className="text-stone-200 text-xs leading-relaxed font-medium">
              {activeSegment.musicalTrigger}
            </p>
          </div>

          {/* Active Role Card (Leader OR Follower based on Mobile Toggle) */}
          {activeRole === "leader" ? (
            <div
              data-testid="leader-action-box"
              className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 sm:p-3 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                <Compass className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-sky-400 shrink-0" />
                Leader Action (What to Dance):
              </div>
              <p className="text-stone-200 text-xs leading-relaxed font-medium">
                {activeSegment.leaderCue}
              </p>
            </div>
          ) : (
            <div
              data-testid="follower-action-box"
              className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 sm:p-3 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                <Compass className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-rose-400 shrink-0" />
                Follower Response (Styling &amp; Energy):
              </div>
              <p className="text-stone-200 text-xs leading-relaxed font-medium">
                {activeSegment.followerCue}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compact Warning Pill Strip */}
      <div
        data-testid="un-confuser-alert"
        className="rounded-lg border border-gold/20 bg-amber-950/30 py-1.5 px-3 flex items-center gap-2 text-xs text-amber-200/90 leading-snug shadow-xs"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-gold shrink-0" />
        <p className="line-clamp-2 sm:line-clamp-none">
          <strong className="font-black uppercase tracking-wider text-gold mr-1.5">
            ⚠️ Avoid:
          </strong>
          {activeSegment.commonMistakeWarning}
        </p>
      </div>

      {/* Recommended Curriculum Moves Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Recommended Curriculum Moves for this Section:
          </span>
          <span className="text-[11px] text-stone-400">
            Tap any move for instant breakdown
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {activeSegment.recommendedMoveSlugs.map((slug) => {
            const move = resolveCurriculumMove(slug);
            if (!move) return null;
            const isSelected = inspectingMove?.id === move.id;

            return (
              <button
                key={move.id}
                type="button"
                data-testid={`move-pill-${move.id}`}
                onClick={() =>
                  setInspectingMove(isSelected ? null : move)
                }
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "border-gold bg-gold/20 text-gold shadow-xs"
                    : "border-line bg-surface-3 text-stone-300 hover:bg-surface-2 hover:text-white"
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>{move.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-gold/30 text-gold" : "bg-white/10 text-stone-400"
                  }`}
                >
                  {move.level}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slide-Up Move Breakdown Overlay / Inspector Modal */}
        {inspectingMove && (
          <div
            data-testid="move-inspector-card"
            className="fixed inset-x-3 bottom-16 sm:static sm:inset-auto sm:bottom-auto z-50 rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 space-y-2.5 mt-3 shadow-2xl backdrop-blur-md text-stone-100"
          >
            <button
              type="button"
              data-testid="close-move-inspector"
              aria-label="Close move preview"
              onClick={() => setInspectingMove(null)}
              className="absolute top-3.5 right-3.5 rounded-full p-1 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close move preview"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-gold/20 text-gold border border-gold/30 text-[10px] font-bold">
                  {inspectingMove.level} Syllabus
                </Badge>
                {inspectingMove.phonetic && (
                  <span className="text-xs text-stone-400 italic">
                    Pronounced: &ldquo;{inspectingMove.phonetic}&rdquo;
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-ivory">
                {inspectingMove.name}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {inspectingMove.summary}
              </p>
            </div>

            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 text-xs pt-1">
              {inspectingMove.handholdType && (
                <div className="rounded-xl border border-line bg-surface-3 p-2 sm:p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Handhold &amp; Connection
                  </span>
                  <p className="font-semibold text-stone-200 text-xs">{inspectingMove.handholdType}</p>
                </div>
              )}
              {inspectingMove.entryExitGeometry && (
                <div className="rounded-xl border border-line bg-surface-3 p-2 sm:p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Circular Geometry
                  </span>
                  <p className="font-semibold text-stone-200 text-xs">{inspectingMove.entryExitGeometry}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-2.5 sm:p-3 text-xs flex items-start gap-2 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold text-amber-300 text-[10px] uppercase tracking-wider block">
                  💡 Un-Confuser Tip:
                </span>
                <p className="text-stone-200 font-semibold leading-relaxed">
                  {inspectingMove.unConfuserTip}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
