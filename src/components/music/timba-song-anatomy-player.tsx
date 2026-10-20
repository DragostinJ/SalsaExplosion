"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Music,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Compass,
  BookOpen,
  X,
  Clock,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomy,
  SongSegment,
  resolveCurriculumMove,
  SegmentColorTheme,
} from "@/lib/constants/timba-song-anatomy";
import { CurriculumSkillItem } from "@/lib/constants/cuban-curriculum-2027";

interface TimbaSongAnatomyPlayerProps {
  initialSongId?: string;
  className?: string;
}

const THEME_STYLES: Record<
  SegmentColorTheme,
  {
    bgActive: string;
    bgInactive: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  }
> = {
  blue: {
    bgActive: "bg-sky-500/25 dark:bg-sky-500/30",
    bgInactive: "bg-sky-500/10 dark:bg-sky-500/15 hover:bg-sky-500/20",
    border: "border-sky-500/40",
    text: "text-sky-950 font-bold dark:text-sky-100",
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-950 font-bold dark:text-sky-100",
    pillBg: "bg-sky-500",
  },
  emerald: {
    bgActive: "bg-emerald-500/25 dark:bg-emerald-500/30",
    bgInactive: "bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-950 font-bold dark:text-emerald-100",
    badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-950 font-bold dark:text-emerald-100",
    pillBg: "bg-emerald-500",
  },
  amber: {
    bgActive: "bg-amber-500/25 dark:bg-amber-500/30",
    bgInactive: "bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-950 font-bold dark:text-amber-100",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-950 font-bold dark:text-amber-100",
    pillBg: "bg-amber-500",
  },
  purple: {
    bgActive: "bg-purple-500/25 dark:bg-purple-500/30",
    bgInactive: "bg-purple-500/10 dark:bg-purple-500/15 hover:bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-950 font-bold dark:text-purple-100",
    badge: "border-purple-500/40 bg-purple-500/15 text-purple-950 font-bold dark:text-purple-100",
    pillBg: "bg-purple-500",
  },
  red: {
    bgActive: "bg-rose-500/25 dark:bg-rose-500/30",
    bgInactive: "bg-rose-500/10 dark:bg-rose-500/15 hover:bg-rose-500/20",
    border: "border-rose-500/40",
    text: "text-rose-950 font-bold dark:text-rose-100",
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-950 font-bold dark:text-rose-100",
    pillBg: "bg-rose-500",
  },
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function TimbaSongAnatomyPlayer({
  initialSongId = "me-dicen-cuba",
  className = "",
}: TimbaSongAnatomyPlayerProps) {
  const [selectedSongId, setSelectedSongId] = useState(initialSongId);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [inspectingMove, setInspectingMove] = useState<CurriculumSkillItem | null>(null);

  const activeSong = useMemo<SongAnatomy>(() => {
    return (
      TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === selectedSongId) ??
      TIMBA_SONG_ANATOMY_DATA[0]
    );
  }, [selectedSongId]);

  // Handle switching songs: reset playback timer and active move preview
  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
    setCurrentTime(0);
    setIsPlaying(false);
    setInspectingMove(null);
  };

  // Active segment determined by currentTime
  const activeSegmentIndex = useMemo(() => {
    const idx = activeSong.segments.findIndex(
      (seg) =>
        currentTime >= seg.startTimeSeconds &&
        (currentTime < seg.endTimeSeconds ||
          (seg.endTimeSeconds === activeSong.durationSeconds &&
            currentTime <= seg.endTimeSeconds))
    );
    return idx !== -1 ? idx : 0;
  }, [activeSong, currentTime]);

  const activeSegment: SongSegment = activeSong.segments[activeSegmentIndex];
  const nextSegment: SongSegment | undefined =
    activeSong.segments[activeSegmentIndex + 1];

  const secondsUntilNextShift = nextSegment
    ? Math.max(0, activeSegment.endTimeSeconds - Math.floor(currentTime))
    : 0;

  // Timer simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 250;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        if (next >= activeSong.durationSeconds) {
          setIsPlaying(false);
          return activeSong.durationSeconds;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeSong.durationSeconds]);

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, activeSong.durationSeconds));
    setCurrentTime(clamped);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentTime >= activeSong.durationSeconds) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const activeTheme = THEME_STYLES[activeSegment.colorTheme];

  return (
    <div
      data-testid="timba-song-anatomy-player"
      className={`rounded-3xl border border-border/80 bg-card p-5 sm:p-7 space-y-6 shadow-sm overflow-hidden ${className}`}
    >
      {/* 1. Top Bar: Header & Song Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-base text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1">
              <Compass className="h-3.5 w-3.5" />
              Interactive Song Map
            </Badge>
            <Badge variant="outline" className="border-border text-xs font-semibold">
              Live Dancer HUD
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Timba Song Anatomy &amp; Gear-Shift Trainer
          </h2>
          <p className="text-xs text-muted-foreground">
            Follow a real track in real time. Know exactly when the horns hit, when to breakaway, and when to drop into Bomba.
          </p>
        </div>

        {/* Song Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {TIMBA_SONG_ANATOMY_DATA.map((song) => {
            const isSelected = song.id === activeSong.id;
            return (
              <button
                key={song.id}
                type="button"
                data-testid={`select-song-${song.id}`}
                onClick={() => handleSelectSong(song.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all min-h-[40px] flex items-center gap-2 ${
                  isSelected
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Music className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{song.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {song.segments.length} Segs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Song Meta Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base font-bold">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">
              {activeSong.title}
            </h3>
            <p className="text-muted-foreground text-[11px]">
              {activeSong.artist} • <span className="font-mono font-semibold">{activeSong.bpm} BPM</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-bold border-border/80">
            {activeSong.claveType} Clave
          </Badge>
          <Badge
            className={`text-[11px] font-bold ${
              activeSong.difficultyLevel === "Beginner"
                ? "bg-sky-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {activeSong.difficultyLevel} Level
          </Badge>
          {activeSong.spotifyOrYoutubeEmbedUrl && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold"
            >
              <a
                href={activeSong.spotifyOrYoutubeEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Headphones className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Listen on Spotify
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Proportional Interactive Timeline Scrubber */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Song Progression Timeline (Click Any Segment to Jump)
          </span>
          <span className="font-mono font-extrabold text-foreground">
            {formatSeconds(currentTime)} / {formatSeconds(activeSong.durationSeconds)}
          </span>
        </div>

        {/* Multi-segment proportional bar */}
        <div
          role="region"
          aria-label="Song Segments Bar"
          className="relative h-12 w-full rounded-2xl border border-border/80 overflow-hidden bg-muted/40 flex"
        >
          {activeSong.segments.map((segment, idx) => {
            const segmentDuration = segment.endTimeSeconds - segment.startTimeSeconds;
            const widthPct = (segmentDuration / activeSong.durationSeconds) * 100;
            const isSegmentActive = idx === activeSegmentIndex;
            const theme = THEME_STYLES[segment.colorTheme];

            return (
              <button
                key={segment.id}
                type="button"
                data-testid={`timeline-segment-${idx}`}
                onClick={() => handleSeek(segment.startTimeSeconds)}
                title={`${segment.formattedRange} • ${segment.sectionName} (${segment.danceGear})`}
                style={{ width: `${widthPct}%` }}
                className={`relative h-full text-left transition-all px-2 flex flex-col justify-center border-r border-background/60 last:border-r-0 ${
                  isSegmentActive ? `${theme.bgActive} ring-2 ring-inset ring-foreground/40` : theme.bgInactive
                }`}
              >
                <div className="truncate text-[10px] font-bold text-foreground">
                  {segment.sectionName}
                </div>
                <div className="truncate text-[9px] text-muted-foreground font-medium">
                  {segment.danceGear}
                </div>
              </button>
            );
          })}

          {/* Live Playhead Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground pointer-events-none z-10"
            style={{
              left: `${Math.min(
                100,
                (currentTime / activeSong.durationSeconds) * 100
              )}%`,
            }}
          />
        </div>

        {/* Playback Controls & Range Scrubber */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              data-testid="playback-toggle"
              onClick={togglePlay}
              className="h-9 px-4 text-xs font-bold bg-primary-base hover:bg-primary-hover text-white rounded-xl shadow-xs"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-white" />
                  {currentTime >= activeSong.durationSeconds ? "Replay" : "Play Along"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 text-xs font-semibold rounded-xl"
              title="Reset to 0:00"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            {/* Speed Toggle */}
            <div className="flex items-center rounded-xl border bg-muted/30 p-0.5 text-xs">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    playbackSpeed === spd
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Slider Scrubber */}
          <div className="flex-1 max-w-xs flex items-center gap-2">
            <input
              type="range"
              aria-label="Timeline position scrubber"
              min={0}
              max={activeSong.durationSeconds}
              step={1}
              value={Math.floor(currentTime)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-primary-base cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Live "Dancer HUD" Panel */}
      <div className="space-y-4 pt-2 border-t">
        {/* Active Segment Announcement Banner */}
        <div
          data-testid="active-segment-hud"
          className={`rounded-2xl border ${activeTheme.border} ${activeTheme.bgActive} p-4 sm:p-5 space-y-3 transition-colors`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Current Segment ({activeSegmentIndex + 1} of {activeSong.segments.length})
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {activeSegment.formattedRange}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {activeSegment.sectionName}
              </h3>
            </div>

            {/* Next Shift Countdown */}
            <div className="rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs text-right self-start sm:self-auto shadow-xs">
              {nextSegment ? (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Next Shift in: <strong className="text-foreground font-mono text-xs">{secondsUntilNextShift}s</strong>
                  </span>
                  <span className="font-bold text-foreground text-[11px]">
                    {nextSegment.sectionName} ({nextSegment.danceGear})
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Song Climax
                  </span>
                  <span className="font-bold text-foreground text-[11px]">
                    Final Section • Strike Pose
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Dance Gear Pill */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-foreground">Recommended Gear:</span>
            <Badge className={`${activeTheme.badge} text-xs font-black`}>
              {activeSegment.danceGear}
            </Badge>
          </div>
        </div>

        {/* 3 Action Cards (What to Listen For, Leader Cue, Follower Cue) */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: What to Listen For */}
          <Card className="border border-border/80 bg-card shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-muted-foreground flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-sky-600" />
                What to Listen For (Trigger)
              </span>
              <p className="text-xs text-slate-900 dark:text-foreground font-semibold leading-relaxed">
                {activeSegment.musicalTrigger}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Leader Cue */}
          <Card className="border border-sky-500/30 bg-sky-500/[0.04] shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Leader Action
              </span>
              <p className="text-xs text-slate-900 dark:text-foreground font-semibold leading-relaxed">
                {activeSegment.leaderCue}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Follower Cue */}
          <Card className="border border-rose-500/30 bg-rose-500/[0.04] shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Follower Action
              </span>
              <p className="text-xs text-slate-900 dark:text-foreground font-semibold leading-relaxed">
                {activeSegment.followerCue}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Un-Confuser Alert Banner */}
        <div
          data-testid="un-confuser-alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/20 p-4 flex items-start gap-3 text-xs shadow-xs"
        >
          <AlertTriangle className="h-4 w-4 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-amber-950 dark:text-amber-200 uppercase text-[10px] tracking-wider block">
              Dancer Un-Confuser Warning
            </span>
            <p className="text-slate-900 dark:text-amber-100 font-semibold leading-relaxed">
              {activeSegment.commonMistakeWarning}
            </p>
          </div>
        </div>

        {/* Recommended Curriculum Moves Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-base" />
              Recommended Curriculum Moves for this Section:
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tap any move for instant breakdown
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
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
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "border-primary-base bg-primary-base text-white shadow-xs"
                      : "border-border bg-muted/40 text-foreground hover:bg-muted"
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{move.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {move.level}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inline Move Inspector Card (Opens on tap) */}
          {inspectingMove && (
            <div
              data-testid="move-inspector-card"
              className="rounded-2xl border-2 border-primary-base/40 bg-card p-5 space-y-3 mt-3 shadow-md relative"
            >
              <button
                type="button"
                onClick={() => setInspectingMove(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                title="Close move preview"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary-base text-white text-[10px] font-bold">
                    {inspectingMove.level} Syllabus
                  </Badge>
                  {inspectingMove.phonetic && (
                    <span className="text-xs text-muted-foreground italic">
                      Pronounced: &ldquo;{inspectingMove.phonetic}&rdquo;
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-foreground">
                  {inspectingMove.name}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {inspectingMove.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs pt-1">
                {inspectingMove.handholdType && (
                  <div className="rounded-xl border bg-muted/30 p-2.5 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Handhold &amp; Connection
                    </span>
                    <p className="font-medium text-foreground">{inspectingMove.handholdType}</p>
                  </div>
                )}
                {inspectingMove.entryExitGeometry && (
                  <div className="rounded-xl border bg-muted/30 p-2.5 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Circular Geometry
                    </span>
                    <p className="font-medium text-foreground">{inspectingMove.entryExitGeometry}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/20 p-3 text-xs flex items-start gap-2.5 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-amber-950 dark:text-amber-200 text-[10px] uppercase tracking-wider block">
                    Un-Confuser Tip
                  </span>
                  <p className="text-slate-900 dark:text-amber-100 font-semibold leading-relaxed">
                    {inspectingMove.unConfuserTip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
