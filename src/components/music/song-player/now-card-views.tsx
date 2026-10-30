"use client";

import Link from "next/link";
import { Check, CircleCheck } from "lucide-react";
import type { SongDanceGear, SongSegment } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND, ENERGY_LABELS, type DanceGearStyle } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";
import { SectionMovesList } from "./section-moves-list";
import type { DancerRole } from "./song-player-more-sheet";

function EnergyBars({ gear }: { gear: DanceGearStyle }) {
  return (
    <span className="flex items-center gap-1 text-xs text-ivory-muted" aria-label={`Energy: ${ENERGY_LABELS[gear.energy]}`}>
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          aria-hidden="true"
          className={cn("h-2.5 w-1.5 rounded-sm", level <= gear.energy ? gear.fillClass : "bg-line")}
        />
      ))}
      <span className="ml-0.5">{ENERGY_LABELS[gear.energy]}</span>
    </span>
  );
}

interface GotItProps {
  songId: string;
  sectionId: string;
  signedIn: boolean | null;
  isMastered: boolean;
  onToggle: (sectionId: string) => void;
}

function GotItButton({ songId, sectionId, signedIn, isMastered, onToggle }: GotItProps) {
  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <Link
        href={`/sign-in?redirect_url=${encodeURIComponent(`/music/${songId}`)}`}
        className="mt-3 flex min-h-[44px] items-center justify-center rounded-xl border border-line text-xs font-semibold text-ivory-muted"
      >
        Sign in to tick off sections you&apos;ve got
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onToggle(sectionId)}
      aria-pressed={isMastered}
      data-testid="section-got-it"
      className={cn(
        "mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold",
        isMastered ? "border-success-line bg-success-soft text-success" : "border-line bg-canvas/40 text-ivory"
      )}
    >
      {isMastered ? <CircleCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      {isMastered ? "Got it" : "I've got this section"}
    </button>
  );
}

interface LearnViewProps extends Omit<GotItProps, "sectionId" | "isMastered"> {
  segment: SongSegment;
  role: DancerRole;
  mastered: ReadonlySet<string>;
}

/** Full detail: gear, timing, your cue, body zones, moves to try, "got it". */
export function LearnView({ segment, role, mastered, ...gotIt }: LearnViewProps) {
  const gear = DANCE_GEAR_LEGEND[segment.danceGear];
  const GearIcon = gear.icon;
  const zones = segment.instrumentMapping;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest", gear.textClass)}>
          <GearIcon className="h-4 w-4" aria-hidden="true" />
          {gear.shortLabel}
        </span>
        <EnergyBars gear={gear} />
        {segment.timingMode && (
          <span className="rounded-full border border-line bg-canvas/40 px-2 py-0.5 text-[11px] font-semibold">
            {segment.timingMode}
          </span>
        )}
        {mastered.has(segment.id) && (
          <CircleCheck className="h-4 w-4 text-success" aria-label="You've got this section" />
        )}
      </div>

      <h2 className="mt-1.5 font-display text-xl font-bold leading-tight">{segment.sectionName}</h2>

      <p
        className={cn(
          "mt-2 border-l-2 pl-2.5 text-base leading-snug",
          role === "leader" ? "border-role-lead" : "border-role-follow"
        )}
      >
        {role === "leader" ? segment.leaderCue : segment.followerCue}
      </p>

      {zones && (
        <dl className="mt-2.5 space-y-0.5 text-xs">
          {[
            { label: "Feet", value: zones.feet },
            { label: "Hips", value: zones.hipsAndKnees },
            { label: "Chest", value: zones.chestAndShoulders },
          ].map((zone) => (
            <div key={zone.label} className="flex gap-2 leading-5">
              <dt className="w-11 shrink-0 text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
                {zone.label}
              </dt>
              <dd>{zone.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Keyed by section so open moves collapse when the section changes */}
      <SectionMovesList key={segment.id} segment={segment} />

      <GotItButton {...gotIt} sectionId={segment.id} isMastered={mastered.has(segment.id)} />
    </>
  );
}

interface DanceViewProps {
  segment: SongSegment;
  role: DancerRole;
  secondsUntilNext: number | null;
}

/** Glanceable from 2m away with the phone propped up: gear, energy, countdown. */
export function DanceView({ segment, role, secondsUntilNext }: DanceViewProps) {
  const gear = DANCE_GEAR_LEGEND[segment.danceGear];
  const GearIcon = gear.icon;
  return (
    <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 text-center" data-testid="dance-view">
      <GearIcon className={cn("h-12 w-12", gear.textClass)} aria-hidden="true" />
      <p className={cn("text-4xl font-black uppercase tracking-wider", gear.textClass)}>{gear.shortLabel}</p>
      <EnergyBars gear={gear} />
      {segment.timingMode && <p className="text-sm font-semibold">{segment.timingMode}</p>}
      <p className="line-clamp-2 max-w-md text-sm text-ivory-muted">
        {role === "leader" ? segment.leaderCue : segment.followerCue}
      </p>
      {secondsUntilNext !== null && (
        <p className="font-mono text-xl font-bold" aria-label={`Next change in ${Math.ceil(secondsUntilNext)} seconds`}>
          {formatSongTime(Math.ceil(secondsUntilNext))}
        </p>
      )}
    </div>
  );
}

export interface QuizState {
  sectionId: string;
  correct: SongDanceGear;
  options: SongDanceGear[];
  answer: SongDanceGear | null;
}

interface QuizViewProps {
  quiz: QuizState | null;
  score: { correct: number; asked: number };
  onAnswer: (gear: SongDanceGear) => void;
}

/** Ear training: pause before a change and guess the next gear. */
export function QuizView({ quiz, score, onAnswer }: QuizViewProps) {
  if (!quiz) {
    return (
      <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 text-center" data-testid="quiz-view">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Ear training</p>
        <p className="text-base">Press play and listen. Just before each change the song pauses and asks what comes next.</p>
        <p className="font-mono text-sm text-ivory-muted">
          Score {score.correct}/{score.asked}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2" data-testid="quiz-view">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold">What comes next?</p>
        <p className="font-mono text-xs text-ivory-muted">
          {score.correct}/{score.asked}
        </p>
      </div>
      {quiz.options.map((option) => {
        const style = DANCE_GEAR_LEGEND[option];
        const Icon = style.icon;
        const isAnswered = quiz.answer !== null;
        const isCorrect = option === quiz.correct;
        const isPicked = option === quiz.answer;
        return (
          <button
            key={option}
            type="button"
            disabled={isAnswered}
            onClick={() => onAnswer(option)}
            className={cn(
              "flex min-h-[48px] items-center gap-3 rounded-xl border px-3 text-left text-sm font-bold",
              !isAnswered && "border-line bg-canvas/40",
              isAnswered && isCorrect && "border-success-line bg-success-soft text-success",
              isAnswered && isPicked && !isCorrect && "border-danger-line bg-danger-soft text-danger",
              isAnswered && !isCorrect && !isPicked && "border-line opacity-50"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", style.textClass)} aria-hidden="true" />
            <span className="flex-1">{style.shortLabel}</span>
            <span className="text-xs font-semibold text-ivory-muted">{ENERGY_LABELS[style.energy]}</span>
          </button>
        );
      })}
    </div>
  );
}
