"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import { SongMapBar } from "./song-map-bar";
import { SongPlayerMoreSheet, type DancerRole } from "./song-player-more-sheet";
import { SongCalibrationPanel } from "./song-calibration-panel";
import { SectionMovesList } from "./section-moves-list";

const ROLE_STORAGE_KEY = "ritmoflow:player-role";
const LATENCY_STORAGE_KEY = "ritmoflow:player-latency-offset";
/** The NEXT strip switches to "get ready" this many seconds before a change. */
const GET_READY_SECONDS = 4;

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode / storage blocked: setting just won't persist
  }
}

interface SongPlayerScreenProps {
  song: SongAnatomy;
}

export function SongPlayerScreen({ song }: SongPlayerScreenProps) {
  const [role, setRole] = useState<DancerRole>("leader");
  const [latencyOffsetSeconds, setLatencyOffsetSeconds] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    const storedRole = readStored(ROLE_STORAGE_KEY);
    if (storedRole === "leader" || storedRole === "follower") setRole(storedRole);
    const storedLatency = Number(readStored(LATENCY_STORAGE_KEY));
    if (Number.isFinite(storedLatency)) setLatencyOffsetSeconds(storedLatency);
    setIsCalibrating(new URLSearchParams(window.location.search).has("calibrate"));
  }, []);

  const clock = useYouTubeSongClock({
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

  const changeRole = (nextRole: DancerRole) => {
    setRole(nextRole);
    writeStored(ROLE_STORAGE_KEY, nextRole);
  };

  const changeLatency = (seconds: number) => {
    setLatencyOffsetSeconds(seconds);
    writeStored(LATENCY_STORAGE_KEY, String(seconds));
  };

  const closeMore = useCallback(() => setIsMoreOpen(false), []);

  // Each new section starts at the top of the NOW card, not where the last one was scrolled to
  const nowCardRef = useRef<HTMLElement>(null);
  const activeSegmentId = song.segments[Math.max(0, clock.segmentIndex)]?.id;
  useEffect(() => {
    nowCardRef.current?.scrollTo({ top: 0 });
  }, [activeSegmentId]);

  const segments = song.segments;
  const activeIndex = Math.max(0, clock.segmentIndex);
  const active = segments[activeIndex];
  const next = segments[activeIndex + 1];
  const gear = DANCE_GEAR_LEGEND[active.danceGear];
  const GearIcon = gear.icon;
  const nextGear = next ? DANCE_GEAR_LEGEND[next.danceGear] : null;
  const untilNext = secondsUntilNextSection(segments, clock.currentTime);
  const isGetReady = clock.isPlaying && untilNext !== null && untilNext <= GET_READY_SECONDS;
  const roleCue = role === "leader" ? active.leaderCue : active.followerCue;
  const bodyZones = active.instrumentMapping;
  const canGoNext = nextSectionSeekTarget(segments, clock.currentTime) !== null;

  const goPrevious = () => clock.seek(previousSectionSeekTarget(segments, clock.getExactTime()));
  const goNext = () => {
    const target = nextSectionSeekTarget(segments, clock.getExactTime());
    if (target !== null) clock.seek(target);
  };

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
            <div ref={clock.containerRef} className="absolute inset-0" />
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
            onSelectSection={(index) => clock.seek(segments[index].startTimeSeconds)}
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
            aria-label="What to dance now"
            className={cn("min-h-0 flex-1 overflow-y-auto rounded-2xl border p-3.5", gear.chipClass)}
          >
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
              {active.timingMode && (
                <span className="rounded-full border border-line bg-canvas/40 px-2 py-0.5 text-[11px] font-semibold">
                  {active.timingMode}
                </span>
              )}
            </div>

            <h2 className="mt-1.5 font-display text-xl font-bold leading-tight">{active.sectionName}</h2>

            <p
              className={cn(
                "mt-2 border-l-2 pl-2.5 text-base leading-snug",
                role === "leader" ? "border-role-lead" : "border-role-follow"
              )}
            >
              {roleCue}
            </p>

            {bodyZones && (
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {[
                { label: "Feet", value: bodyZones.feet },
                { label: "Hips", value: bodyZones.hipsAndKnees },
                { label: "Chest", value: bodyZones.chestAndShoulders },
              ].map((zone) => (
                <div key={zone.label} className="rounded-xl bg-canvas/40 p-2">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">{zone.label}</dt>
                  <dd className="mt-0.5 leading-snug">{zone.value}</dd>
                </div>
              ))}
            </dl>
            )}

            {/* Keyed by section so open moves collapse when the section changes */}
            <SectionMovesList key={active.id} segment={active} />
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
        segment={active}
        role={role}
        latencyOffsetSeconds={latencyOffsetSeconds}
        onChangeLatency={changeLatency}
      />
    </main>
  );
}
