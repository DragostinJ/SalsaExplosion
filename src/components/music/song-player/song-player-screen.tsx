"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronLeft, Info, Loader2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { DANCE_GEAR_LEGEND, ENERGY_LABELS } from "@/lib/music/dance-gear-legend";
import {
  formatSongTime,
  getDurationMismatchSeconds,
  nextSectionSeekTarget,
  previousSectionSeekTarget,
  secondsUntilNextSection,
} from "@/lib/music/song-timing";
import { useYouTubeSongClock } from "@/lib/music/use-youtube-song-clock";
import {
  PREVIEW_IDLE_RETURN_MS,
  resolveSwipeDirection,
  stepPreviewIndex,
} from "@/lib/music/section-preview";
import { useScreenWakeLock } from "@/lib/hooks/use-screen-wake-lock";
import { useStoredString, writeStoredString } from "@/lib/hooks/use-stored-string";
import { cn } from "@/lib/utils";
import { SongMapBar } from "./song-map-bar";
import { SongPlayerMoreSheet, type DancerRole } from "./song-player-more-sheet";
import { SongCalibrationPanel } from "./song-calibration-panel";
import { SectionMovesList } from "./section-moves-list";

const ROLE_STORAGE_KEY = "ritmoflow:player-role";
const LATENCY_STORAGE_KEY = "ritmoflow:player-latency-offset";
/** The NEXT strip switches to "get ready" this many seconds before a change. */
const GET_READY_SECONDS = 4;

const noopSubscribe = () => () => {};
const readCalibrateFlag = () => new URLSearchParams(window.location.search).has("calibrate");

interface SongPlayerScreenProps {
  song: SongAnatomy;
}

export function SongPlayerScreen({ song }: SongPlayerScreenProps) {
  const role: DancerRole = useStoredString(ROLE_STORAGE_KEY) === "follower" ? "follower" : "leader";
  const storedLatency = Number(useStoredString(LATENCY_STORAGE_KEY) ?? "0");
  const latencyOffsetSeconds = Number.isFinite(storedLatency) ? storedLatency : 0;
  const isCalibrating = useSyncExternalStore(noopSubscribe, readCalibrateFlag, () => false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const { containerRef: attachVideoHost, ...clock } = useYouTubeSongClock({
    videoId: song.youtubeVideoId,
    segments: song.segments,
    latencyOffsetSeconds,
  });

  useEffect(() => {
    const mismatch = getDurationMismatchSeconds(song, clock.actualDurationSeconds);
    if (mismatch !== null) {
      console.warn(
        `[song-player] ${song.id}: video ${song.youtubeVideoId} is ${mismatch.toFixed(1)}s off the authored ${song.durationSeconds}s. Section cues may be misaligned.`
      );
    }
  }, [song, clock.actualDurationSeconds]);

  const changeRole = (nextRole: DancerRole) => writeStoredString(ROLE_STORAGE_KEY, nextRole);
  const changeLatency = (seconds: number) => writeStoredString(LATENCY_STORAGE_KEY, String(seconds));

  const closeMore = useCallback(() => setIsMoreOpen(false), []);

  const segments = song.segments;
  const activeIndex = Math.max(0, clock.segmentIndex);
  // A preview that reaches the live section simply becomes live again
  const effectivePreview = previewIndex !== null && previewIndex !== activeIndex ? previewIndex : null;
  const isPreviewing = effectivePreview !== null;
  const shownIndex = effectivePreview ?? activeIndex;
  const shown = segments[shownIndex];
  const next = segments[activeIndex + 1];
  const gear = DANCE_GEAR_LEGEND[shown.danceGear];
  const GearIcon = gear.icon;
  const nextGear = next ? DANCE_GEAR_LEGEND[next.danceGear] : null;
  const untilNext = secondsUntilNextSection(segments, clock.currentTime);
  const isGetReady = clock.isPlaying && untilNext !== null && untilNext <= GET_READY_SECONDS;
  const roleCue = role === "leader" ? shown.leaderCue : shown.followerCue;
  const bodyZones = shown.instrumentMapping;
  const canGoNext = nextSectionSeekTarget(segments, clock.currentTime) !== null;

  // Every section shown in the NOW card starts at the top, not where the last one was scrolled to
  const nowCardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    nowCardRef.current?.scrollTo({ top: 0 });
  }, [shown.id]);

  // An untouched preview drifts back to the live section
  useEffect(() => {
    if (effectivePreview === null) return;
    const timer = setTimeout(() => setPreviewIndex(null), PREVIEW_IDLE_RETURN_MS);
    return () => clearTimeout(timer);
  }, [effectivePreview]);

  useScreenWakeLock(clock.isPlaying);

  const { seek, getExactTime, togglePlay } = clock;

  /** Every seek ends a preview so the card always matches what you hear. */
  const seekTo = useCallback(
    (seconds: number) => {
      setPreviewIndex(null);
      seek(seconds);
    },
    [seek]
  );
  const goPrevious = useCallback(
    () => seekTo(previousSectionSeekTarget(segments, getExactTime())),
    [segments, seekTo, getExactTime]
  );
  const goNext = useCallback(() => {
    const target = nextSectionSeekTarget(segments, getExactTime());
    if (target !== null) seekTo(target);
  }, [segments, seekTo, getExactTime]);
  const stepPreview = (direction: -1 | 1) =>
    setPreviewIndex(stepPreviewIndex(effectivePreview, activeIndex, direction, segments.length));

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

  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-testid="song-player-screen"
      className="mx-auto flex h-dvh w-full max-w-5xl flex-col overflow-hidden px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] text-ivory"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-2 pb-2">
        <Link
          href="/music"
          aria-label="Back to all songs"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold">{song.title.replace(/\s*\(Official Video\)/i, "")}</h1>
          <p className="truncate text-xs text-ivory-muted">
            {song.artist} · {song.bpm} BPM
          </p>
        </div>
        <div className="flex shrink-0 rounded-full border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Your role">
          {(["leader", "follower"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={role === option}
              onClick={() => changeRole(option)}
              className={cn(
                "min-h-[40px] rounded-full px-3 text-xs font-bold",
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

      {/* Portrait phone: stacked. Landscape phone: video left, cards right. Desktop: wide video left. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 max-lg:landscape:grid max-lg:landscape:grid-cols-2 max-lg:landscape:gap-3 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-6">
        {/* Video + map */}
        <div className="flex shrink-0 flex-col gap-1.5">
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

          <SongMapBar
            segments={segments}
            durationSeconds={song.durationSeconds}
            currentTime={clock.currentTime}
            activeIndex={activeIndex}
            previewIndex={effectivePreview}
            onSelectSection={(index) => seekTo(segments[index].startTimeSeconds)}
          />

          {isCalibrating && (
            <SongCalibrationPanel
              song={song}
              currentTime={clock.currentTime}
              actualDurationSeconds={clock.actualDurationSeconds}
              getExactTime={clock.getExactTime}
            />
          )}
        </div>

        {/* NOW / NEXT */}
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
              if (!start) return;
              const touch = event.changedTouches[0];
              const direction = resolveSwipeDirection(touch.clientX - start.x, touch.clientY - start.y);
              if (direction !== 0) stepPreview(direction);
            }}
            className={cn(
              "min-h-0 flex-1 touch-pan-y overflow-y-auto rounded-2xl border p-3.5",
              gear.chipClass,
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
                  onClick={() => seekTo(shown.startTimeSeconds)}
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
                  Now<span className="font-semibold normal-case tracking-normal"> · swipe to preview</span>
                </span>
                <span className="flex items-center gap-1" aria-hidden="true">
                  {segments.map((segment, index) => (
                    <span
                      key={segment.id}
                      className={cn(
                        "h-1.5 rounded-full",
                        index === activeIndex
                          ? cn("w-3", DANCE_GEAR_LEGEND[segment.danceGear].fillClass)
                          : "w-1.5 bg-line"
                      )}
                    />
                  ))}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest", gear.textClass)}>
                <GearIcon className="h-4 w-4" aria-hidden="true" />
                {gear.shortLabel}
              </span>
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
              {shown.timingMode && (
                <span className="rounded-full border border-line bg-canvas/40 px-2 py-0.5 text-[11px] font-semibold">
                  {shown.timingMode}
                </span>
              )}
            </div>

            <h2 className="mt-1.5 font-display text-xl font-bold leading-tight">{shown.sectionName}</h2>

            <p
              className={cn(
                "mt-2 border-l-2 pl-2.5 text-base leading-snug",
                role === "leader" ? "border-role-lead" : "border-role-follow"
              )}
            >
              {roleCue}
            </p>

            {bodyZones && (
              <dl className="mt-2.5 space-y-0.5 text-xs">
                {[
                  { label: "Feet", value: bodyZones.feet },
                  { label: "Hips", value: bodyZones.hipsAndKnees },
                  { label: "Chest", value: bodyZones.chestAndShoulders },
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
            <SectionMovesList key={shown.id} segment={shown} />
          </section>

          {next && nextGear ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 transition-colors",
                isGetReady ? cn(nextGear.chipClass, "animate-pulse") : "border-line bg-surface-2"
              )}
            >
              <span className={cn("h-8 w-1.5 shrink-0 rounded-full", nextGear.fillClass)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
                  {isGetReady ? "Get ready" : "Next"} · {nextGear.shortLabel} · {ENERGY_LABELS[nextGear.energy]}
                </p>
                <p className="truncate text-sm font-semibold">{next.sectionName}</p>
              </div>
              <span className={cn("shrink-0 font-mono text-base font-bold", isGetReady && nextGear.textClass)}>
                {untilNext !== null ? formatSongTime(Math.ceil(untilNext)) : ""}
              </span>
            </div>
          ) : (
            <div className="shrink-0 rounded-2xl border border-line bg-surface-2 px-3 py-2 text-sm text-ivory-muted">
              Final section, dance it out until the end.
            </div>
          )}

          {/* Thumb-zone controls */}
          <nav aria-label="Playback" className="flex shrink-0 items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-label="Section details, colours and sync"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goPrevious}
              disabled={!clock.isReady}
              aria-label="Previous section"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2 disabled:opacity-40"
            >
              <SkipBack className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={clock.togglePlay}
              disabled={!clock.isReady}
              aria-label={clock.isPlaying ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-canvas shadow-lg disabled:opacity-40"
            >
              {clock.isBuffering ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : clock.isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="ml-1 h-7 w-7" />
              )}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!clock.isReady || !canGoNext}
              aria-label="Next section"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2 disabled:opacity-40"
            >
              <SkipForward className="h-6 w-6" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-ivory-muted">
              {activeIndex + 1}/{segments.length}
            </span>
          </nav>
        </div>
      </div>

      <SongPlayerMoreSheet
        open={isMoreOpen}
        onClose={closeMore}
        segment={shown}
        role={role}
        latencyOffsetSeconds={latencyOffsetSeconds}
        onChangeLatency={changeLatency}
      />
    </main>
  );
}
