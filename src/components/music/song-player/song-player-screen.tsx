"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AudioLines, BookOpen, ChevronLeft, Ear, Loader2, Maximize2 } from "lucide-react";
import type { SongAnatomy, SongDanceGear } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND, ENERGY_LABELS } from "@/lib/music/dance-gear-legend";
import {
  findSegmentIndexAt,
  formatSongTime,
  getDurationMismatchSeconds,
  nextSectionSeekTarget,
  previousSectionSeekTarget,
  secondsUntilNextSection,
} from "@/lib/music/song-timing";
import type { SongClock } from "@/lib/music/song-clock";
import { useYouTubeSongClock } from "@/lib/music/use-youtube-song-clock";
import { useAudioSongClock } from "@/lib/music/use-audio-song-clock";
import { PREVIEW_IDLE_RETURN_MS, resolveSwipeDirection, stepPreviewIndex } from "@/lib/music/section-preview";
import {
  loopWindowFor,
  navigationTime,
  nextPlaybackRate,
  parseLeadIn,
  withLeadIn,
  type LeadInSeconds,
} from "@/lib/music/practice-navigation";
import { buildGearQuizOptions, QUIZ_REVEAL_MS, shouldAskQuiz } from "@/lib/music/gear-quiz";
import { useScreenWakeLock } from "@/lib/hooks/use-screen-wake-lock";
import { useStoredString, writeStoredString } from "@/lib/hooks/use-stored-string";
import { cn } from "@/lib/utils";
import { SongMapBar } from "./song-map-bar";
import { SongPlayerMoreSheet, type DancerRole } from "./song-player-more-sheet";
import { SongCalibrationPanel } from "./song-calibration-panel";
import { PlayerControls } from "./player-controls";
import { SectionList } from "./section-list";
import { DanceView, LearnView, QuizView, type QuizState } from "./now-card-views";
import { useSongProgress } from "./use-song-progress";
import { PLAYER_STORAGE_KEYS as KEYS, PRACTICE_MODES, parsePracticeMode, type PracticeMode } from "./player-settings";

/** The NEXT strip switches to "get ready" this many real seconds before a change. */
const GET_READY_SECONDS = 4;
const HAPTIC_PULSE_MS = 35;
const ALL_GEARS = Object.keys(DANCE_GEAR_LEGEND) as SongDanceGear[];
const MODE_ICONS = { learn: BookOpen, dance: Maximize2, quiz: Ear } as const;

const noopSubscribe = () => () => {};
const readCalibrateFlag = () => new URLSearchParams(window.location.search).has("calibrate");
const readHapticsSupport = () => typeof navigator.vibrate === "function";

interface SongPlayerScreenProps {
  song: SongAnatomy;
  /** When set (import preview), the back button calls this instead of linking to /music. */
  onExit?: () => void;
}

export function SongPlayerScreen({ song, onExit }: SongPlayerScreenProps) {
  const segments = song.segments;
  const audioUrl = song.licensedAudio?.url ?? null;

  // Per-device settings
  const role: DancerRole = useStoredString(KEYS.role) === "follower" ? "follower" : "leader";
  const storedLatency = Number(useStoredString(KEYS.latency) ?? "0");
  const latencyOffsetSeconds = Number.isFinite(storedLatency) ? storedLatency : 0;
  const mode = parsePracticeMode(useStoredString(KEYS.mode));
  const leadIn = parseLeadIn(useStoredString(KEYS.leadIn));
  const hapticsSupported = useSyncExternalStore(noopSubscribe, readHapticsSupport, () => false);
  const hapticsEnabled = useStoredString(KEYS.haptics) !== "off";
  const isCalibrating = useSyncExternalStore(noopSubscribe, readCalibrateFlag, () => false);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [loopSectionIndex, setLoopSectionIndex] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, asked: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  /** Section start we jumped to with a lead-in (so prev/next act from that section). */
  const pendingLeadInRef = useRef<number | null>(null);
  const quizAskedRef = useRef<Set<string>>(new Set());
  const quizTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Per-frame logic (loop + quiz) lives in a ref so the clocks always call the latest version
  const frameHandlerRef = useRef<(cueSeconds: number) => void>(() => {});
  const onFrame = useCallback((cueSeconds: number) => frameHandlerRef.current(cueSeconds), []);

  const { containerRef: attachVideoHost, ...youtubeClock } = useYouTubeSongClock({
    videoId: song.youtubeVideoId,
    segments,
    latencyOffsetSeconds,
    onFrame,
  });
  const audioClock = useAudioSongClock({ audioUrl, segments, latencyOffsetSeconds, onFrame });
  const clock: SongClock = audioUrl ? audioClock : youtubeClock;
  const { seek, getExactTime, togglePlay, play, pause, setPlaybackRate } = clock;

  const progress = useSongProgress(song.id, !onExit);

  useEffect(() => {
    const mismatch = getDurationMismatchSeconds(song, clock.actualDurationSeconds);
    if (mismatch !== null) {
      console.warn(
        `[song-player] ${song.id}: media is ${mismatch.toFixed(1)}s off the authored ${song.durationSeconds}s. Section cues may be misaligned.`
      );
    }
  }, [song, clock.actualDurationSeconds]);

  // Derived section state
  const activeIndex = Math.max(0, clock.segmentIndex);
  const effectivePreview = previewIndex !== null && previewIndex !== activeIndex ? previewIndex : null;
  const isPreviewing = effectivePreview !== null;
  const shownIndex = effectivePreview ?? activeIndex;
  const shown = segments[shownIndex];
  const next = segments[activeIndex + 1];
  const shownGear = DANCE_GEAR_LEGEND[shown.danceGear];
  const nextGear = next ? DANCE_GEAR_LEGEND[next.danceGear] : null;
  const mediaUntilNext = secondsUntilNextSection(segments, clock.currentTime);
  const realUntilNext = mediaUntilNext === null ? null : mediaUntilNext / (clock.playbackRate || 1);
  const isGetReady = clock.isPlaying && realUntilNext !== null && realUntilNext <= GET_READY_SECONDS;
  const canGoNext = nextSectionSeekTarget(segments, clock.currentTime) !== null;
  const loopWindow = loopSectionIndex === null ? null : loopWindowFor(segments, loopSectionIndex, leadIn);
  const isQuiz = mode === "quiz";

  // Loop + quiz, evaluated every animation frame by the active clock
  useEffect(() => {
    frameHandlerRef.current = (cueSeconds) => {
      if (loopWindow && clock.isPlaying && cueSeconds >= loopWindow.endAt) {
        pendingLeadInRef.current = segments[loopWindow.sectionIndex].startTimeSeconds;
        // Each repeat may quiz again, but never about the section you chose to loop
        quizAskedRef.current = new Set([segments[loopWindow.sectionIndex].id]);
        seek(loopWindow.restartAt);
        return;
      }
      if (mode !== "quiz" || quiz) return;
      const index = findSegmentIndexAt(segments, cueSeconds);
      const upcoming = segments[index + 1];
      const realSecondsUntilNext = upcoming
        ? (upcoming.startTimeSeconds - cueSeconds) / (clock.playbackRate || 1)
        : null;
      if (
        upcoming &&
        shouldAskQuiz({
          isPlaying: clock.isPlaying,
          nextSection: upcoming,
          realSecondsUntilNext,
          alreadyAsked: quizAskedRef.current,
        })
      ) {
        quizAskedRef.current.add(upcoming.id);
        pause();
        const songGears = segments.map((segment) => segment.danceGear);
        setQuiz({
          sectionId: upcoming.id,
          correct: upcoming.danceGear,
          options: buildGearQuizOptions(upcoming.danceGear, songGears, ALL_GEARS, index + 1),
          answer: null,
        });
        setQuizScore((score) => ({ ...score, asked: score.asked + 1 }));
      }
    };
  });

  useEffect(
    () => () => {
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    },
    []
  );

  // Every section shown in the NOW card starts at the top
  const nowCardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    nowCardRef.current?.scrollTo({ top: 0 });
  }, [shown.id, mode]);

  // An untouched preview drifts back to the live section
  useEffect(() => {
    if (effectivePreview === null) return;
    const timer = setTimeout(() => setPreviewIndex(null), PREVIEW_IDLE_RETURN_MS);
    return () => clearTimeout(timer);
  }, [effectivePreview]);

  // Haptic pulse on each live section change (Android; iOS has no vibration API)
  const lastHapticIndexRef = useRef(activeIndex);
  useEffect(() => {
    if (lastHapticIndexRef.current === activeIndex) return;
    lastHapticIndexRef.current = activeIndex;
    if (hapticsSupported && hapticsEnabled && clock.isPlaying) navigator.vibrate(HAPTIC_PULSE_MS);
  }, [activeIndex, hapticsSupported, hapticsEnabled, clock.isPlaying]);

  useScreenWakeLock(clock.isPlaying);

  /** Jump to a section (with lead-in). Ends previews/quizzes; an active loop follows you. */
  const seekToSection = useCallback(
    (index: number) => {
      const target = segments[index];
      if (!target) return;
      setPreviewIndex(null);
      setQuiz(null);
      // You chose this section, so the quiz starts with the change after it
      quizAskedRef.current = new Set([target.id]);
      pendingLeadInRef.current = leadIn > 0 ? target.startTimeSeconds : null;
      setLoopSectionIndex((current) => (current === null ? null : index));
      seek(withLeadIn(target.startTimeSeconds, leadIn));
    },
    [segments, leadIn, seek, setPreviewIndex, setQuiz, setLoopSectionIndex]
  );
  const currentNavigationTime = useCallback(
    () => navigationTime(getExactTime(), pendingLeadInRef.current, leadIn),
    [getExactTime, leadIn]
  );
  const goPrevious = useCallback(() => {
    const target = previousSectionSeekTarget(segments, currentNavigationTime());
    seekToSection(findSegmentIndexAt(segments, target));
  }, [segments, currentNavigationTime, seekToSection]);
  const goNext = useCallback(() => {
    const target = nextSectionSeekTarget(segments, currentNavigationTime());
    if (target !== null) seekToSection(findSegmentIndexAt(segments, target));
  }, [segments, currentNavigationTime, seekToSection]);

  const toggleLoop = () =>
    setLoopSectionIndex((current) =>
      current === null ? findSegmentIndexAt(segments, currentNavigationTime()) : null
    );
  const cycleRate = () => setPlaybackRate(nextPlaybackRate(clock.playbackRate));
  const stepPreview = (direction: -1 | 1) =>
    setPreviewIndex(stepPreviewIndex(effectivePreview, activeIndex, direction, segments.length));

  const changeRole = (nextRole: DancerRole) => writeStoredString(KEYS.role, nextRole);
  const changeLatency = (seconds: number) => writeStoredString(KEYS.latency, String(seconds));
  const changeLeadIn = (seconds: LeadInSeconds) => writeStoredString(KEYS.leadIn, String(seconds));
  const changeHaptics = (enabled: boolean) => writeStoredString(KEYS.haptics, enabled ? "on" : "off");
  const changeMode = (nextMode: PracticeMode) => {
    writeStoredString(KEYS.mode, nextMode);
    setQuiz(null);
    quizAskedRef.current.clear();
  };
  const cycleMode = () => changeMode(PRACTICE_MODES[(PRACTICE_MODES.indexOf(mode) + 1) % PRACTICE_MODES.length]);
  const closeMore = useCallback(() => setIsMoreOpen(false), [setIsMoreOpen]);

  const answerQuiz = (gear: SongDanceGear) => {
    if (!quiz || quiz.answer) return;
    setQuiz({ ...quiz, answer: gear });
    if (gear === quiz.correct) setQuizScore((score) => ({ ...score, correct: score.correct + 1 }));
    quizTimerRef.current = setTimeout(() => {
      setQuiz(null);
      play();
    }, QUIZ_REVEAL_MS);
  };

  // Desktop shortcuts: Space play/pause, arrows previous/next section
  useEffect(() => {
    if (isMoreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === " ") {
        // A focused button, link or summary handles Space itself
        if (target?.closest("button, a, summary")) return;
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMoreOpen, togglePlay, goPrevious, goNext]);

  const ModeIcon = MODE_ICONS[mode];
  const title = song.title.replace(/\s*\(Official Video\)/i, "");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-testid="song-player-screen"
      className="mx-auto flex h-dvh w-full max-w-5xl flex-col overflow-hidden px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] text-ivory"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-2 pb-2">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            aria-label="Close preview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/music"
            aria-label="Back to all songs"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold">{title}</h1>
          <p className="truncate text-xs text-ivory-muted">
            {song.artist} · {song.bpm} BPM
          </p>
        </div>
        <button
          type="button"
          onClick={cycleMode}
          aria-label={`Practice mode: ${mode}. Tap to switch`}
          data-testid="player-mode"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-gold"
        >
          <ModeIcon className="h-5 w-5" />
        </button>
        <div className="flex shrink-0 rounded-full border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Your role">
          {(["leader", "follower"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={role === option}
              onClick={() => changeRole(option)}
              className={cn(
                "min-h-[40px] rounded-full px-2.5 text-xs font-bold",
                role === option
                  ? option === "leader"
                    ? "bg-role-lead-soft text-role-lead"
                    : "bg-role-follow-soft text-role-follow"
                  : "text-ivory-muted"
              )}
            >
              {option === "leader" ? "Lead" : "Follow"}
            </button>
          ))}
        </div>
      </header>

      {/* Portrait phone: stacked. Landscape phone: media left, cards right. Desktop: media + section list left. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 max-lg:landscape:grid max-lg:landscape:grid-cols-2 max-lg:landscape:gap-3 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6">
        <div className="flex shrink-0 flex-col gap-1.5 lg:min-h-0">
          {audioUrl ? (
            <div className={cn("flex h-20 shrink-0 items-center gap-3 rounded-xl border p-3", shownGear.chipClass)}>
              <AudioLines className={cn("h-8 w-8 shrink-0", shownGear.textClass)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title}</p>
                <p className="truncate text-xs text-ivory-muted">Studio audio · {song.licensedAudio?.license}</p>
              </div>
              {clock.errorCode !== null && <p className="ml-auto text-xs text-danger">Audio failed to load</p>}
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-surface-1">
              <div ref={attachVideoHost} className="absolute inset-0" />
              {!clock.isReady && clock.errorCode === null && (
                <div className="absolute inset-0 flex items-center justify-center text-ivory-muted" aria-hidden="true">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              {clock.errorCode !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-1 p-4 text-center text-sm">
                  <p>This video can&apos;t play inside the app.</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${song.youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] content-center font-semibold text-gold underline underline-offset-4"
                  >
                    Open on YouTube
                  </a>
                </div>
              )}
            </div>
          )}

          <SongMapBar
            segments={segments}
            durationSeconds={song.durationSeconds}
            currentTime={clock.currentTime}
            activeIndex={activeIndex}
            previewIndex={effectivePreview}
            concealAfterIndex={isQuiz ? activeIndex : null}
            onSelectSection={seekToSection}
          />

          {isCalibrating && (
            <SongCalibrationPanel
              song={song}
              currentTime={clock.currentTime}
              actualDurationSeconds={clock.actualDurationSeconds}
              getExactTime={getExactTime}
            />
          )}

          {!isQuiz && (
            <SectionList
              segments={segments}
              activeIndex={activeIndex}
              mastered={progress.mastered}
              onSelectSection={seekToSection}
              className="hidden lg:block lg:flex-1"
            />
          )}
        </div>

        {/* NOW / NEXT / controls */}
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <section
            ref={nowCardRef}
            aria-live="polite"
            aria-label={isPreviewing ? "Section preview" : "What to dance now"}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              const start = touchStartRef.current;
              touchStartRef.current = null;
              if (!start || (isQuiz && quiz)) return;
              const touch = event.changedTouches[0];
              const direction = resolveSwipeDirection(touch.clientX - start.x, touch.clientY - start.y);
              if (direction !== 0) stepPreview(direction);
            }}
            className={cn(
              "min-h-0 flex-1 touch-pan-y overflow-y-auto rounded-2xl border p-3.5",
              isQuiz && quiz ? "border-line bg-surface-2" : shownGear.chipClass,
              isPreviewing && "border-dashed"
            )}
          >
            {isPreviewing ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-canvas/60 p-1.5 pl-2.5">
                <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-widest text-gold">
                  Preview · {shownIndex + 1}/{segments.length} · {formatSongTime(shown.startTimeSeconds)}
                </span>
                <button
                  type="button"
                  onClick={() => seekToSection(shownIndex)}
                  className="min-h-[40px] rounded-lg bg-gold px-3 text-xs font-bold text-canvas"
                >
                  Jump here
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(null)}
                  className="min-h-[40px] px-2 text-xs font-semibold text-ivory-muted"
                >
                  Live
                </button>
              </div>
            ) : (
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
                  {loopWindow ? (
                    <span className="text-gold">Looping section {loopWindow.sectionIndex + 1}</span>
                  ) : (
                    <>
                      Now<span className="font-semibold normal-case tracking-normal"> · swipe to preview</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1" aria-hidden="true">
                  {segments.map((segment, index) => (
                    <span
                      key={segment.id}
                      className={cn(
                        "h-1.5 rounded-full",
                        index === activeIndex
                          ? cn("w-3", DANCE_GEAR_LEGEND[segment.danceGear].fillClass)
                          : progress.mastered.has(segment.id)
                            ? "w-1.5 bg-success"
                            : "w-1.5 bg-line"
                      )}
                    />
                  ))}
                </span>
              </div>
            )}

            {mode === "dance" ? (
              <DanceView segment={shown} role={role} secondsUntilNext={isPreviewing ? null : realUntilNext} />
            ) : isQuiz && !isPreviewing ? (
              <QuizView quiz={quiz} score={quizScore} onAnswer={answerQuiz} />
            ) : (
              <LearnView
                segment={shown}
                role={role}
                songId={song.id}
                mastered={progress.mastered}
                signedIn={progress.signedIn}
                onToggle={progress.toggle}
              />
            )}
            {progress.error && <p className="mt-2 text-xs text-danger">{progress.error}</p>}
          </section>

          {next && nextGear ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 transition-colors",
                isGetReady && !isQuiz ? cn(nextGear.chipClass, "animate-pulse") : "border-line bg-surface-2"
              )}
            >
              <span
                className={cn("h-8 w-1.5 shrink-0 rounded-full", isQuiz ? "bg-line" : nextGear.fillClass)}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
                  {isQuiz
                    ? "Next · listen for it"
                    : `${isGetReady ? "Get ready" : "Next"} · ${nextGear.shortLabel} · ${ENERGY_LABELS[nextGear.energy]}`}
                </p>
                <p className="truncate text-sm font-semibold">{isQuiz ? "???" : next.sectionName}</p>
              </div>
              <span className={cn("shrink-0 font-mono text-base font-bold", isGetReady && !isQuiz && nextGear.textClass)}>
                {realUntilNext !== null ? formatSongTime(Math.ceil(realUntilNext)) : ""}
              </span>
            </div>
          ) : (
            <div className="shrink-0 rounded-2xl border border-line bg-surface-2 px-3 py-2 text-sm text-ivory-muted">
              Final section, dance it out until the end.
            </div>
          )}

          <PlayerControls
            isReady={clock.isReady}
            isPlaying={clock.isPlaying}
            isBuffering={clock.isBuffering}
            canGoNext={canGoNext}
            playbackRate={clock.playbackRate}
            isLooping={loopWindow !== null}
            onOpenMore={() => setIsMoreOpen(true)}
            onCycleRate={cycleRate}
            onPrevious={goPrevious}
            onTogglePlay={togglePlay}
            onNext={goNext}
            onToggleLoop={toggleLoop}
          />
        </div>
      </div>

      <SongPlayerMoreSheet
        open={isMoreOpen}
        onClose={closeMore}
        segment={shown}
        role={role}
        latencyOffsetSeconds={latencyOffsetSeconds}
        onChangeLatency={changeLatency}
        mode={mode}
        onChangeMode={changeMode}
        leadInSeconds={leadIn}
        onChangeLeadIn={changeLeadIn}
        hapticsEnabled={hapticsSupported ? hapticsEnabled : null}
        onChangeHaptics={changeHaptics}
      />
    </main>
  );
}
