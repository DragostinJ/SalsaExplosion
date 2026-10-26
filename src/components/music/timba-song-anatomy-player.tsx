"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Headphones,
  Music,
  ExternalLink,
  Compass,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TIMBA_SONG_ANATOMY_DATA,
  SongAnatomy,
  SongSegment,
  resolveCurriculumMove,
} from "@/lib/constants/timba-song-anatomy";
import { CurriculumSkillItem } from "@/lib/constants/cuban-curriculum-2027";
import { CubanRhythmSynth } from "@/lib/audio/cuban-rhythm-synth";
import { TimbaBeatBar } from "./timba-player/timba-beat-bar";
import { TimbaTimelineScrubber } from "./timba-player/timba-timeline-scrubber";
import { TimbaDancerHud } from "./timba-player/timba-dancer-hud";
import { YouTubeIcon, formatSeconds } from "./timba-player/timba-types";

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  getDuration?: () => number;
  destroy?: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface TimbaSongAnatomyPlayerProps {
  initialSongId?: string;
  className?: string;
}

const getNow = () => (typeof Date !== "undefined" ? Date.now() : 0);

export function TimbaSongAnatomyPlayer({
  initialSongId = "me-dicen-cuba",
  className = "",
}: TimbaSongAnatomyPlayerProps) {
  const [selectedSongId, setSelectedSongId] = useState(initialSongId);
  const [selectedVideoIdOverride, setSelectedVideoIdOverride] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [inspectingMove, setInspectingMove] = useState<CurriculumSkillItem | null>(null);
  const [showVideoDrawer, setShowVideoDrawer] = useState(true);
  const [isClaveHelperActive, setIsClaveHelperActive] = useState(false);
  const [currentDancerBeat, setCurrentDancerBeat] = useState<number>(1);
  const [activeRole, setActiveRole] = useState<"leader" | "follower">("leader");

  const activeSong = useMemo<SongAnatomy>(() => {
    return (
      TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === selectedSongId) ??
      TIMBA_SONG_ANATOMY_DATA[0]
    );
  }, [selectedSongId]);

  const currentVideoId = selectedVideoIdOverride ?? activeSong.youtubeVideoId;
  const effectiveDuration = activeSong.durationSeconds;
  const effectiveSegments = activeSong.segments;

  const rhythmSynthRef = useRef<CubanRhythmSynth | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const lastSeekTimestampRef = useRef<number>(0);
  const ytPlayerStateRef = useRef<number>(-1);

  // Initialize Rhythm Synth
  useEffect(() => {
    rhythmSynthRef.current = new CubanRhythmSynth({
      bpm: activeSong.bpm,
      claveType: activeSong.claveType,
      onBeat: (beat) => setCurrentDancerBeat(beat),
    });
    return () => {
      rhythmSynthRef.current?.stop();
    };
  }, [activeSong.bpm, activeSong.claveType]);

  // Sync Rhythm Synth with play state and helper toggle
  useEffect(() => {
    if (isPlaying && isClaveHelperActive) {
      rhythmSynthRef.current?.setMuted(false);
      rhythmSynthRef.current?.start();
    } else {
      rhythmSynthRef.current?.stop();
    }
  }, [isPlaying, isClaveHelperActive]);

  // YouTube Iframe API Initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT?.Player) return;
      const iframeId = `youtube-iframe-${selectedSongId}`;
      const elem = document.getElementById(iframeId);
      if (!elem) return;

      try {
        ytPlayerRef.current = new window.YT.Player(iframeId, {
          events: {
            onStateChange: (event) => {
              ytPlayerStateRef.current = event.data;
              if (window.YT?.PlayerState) {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (
                  event.data === window.YT.PlayerState.PAUSED ||
                  event.data === window.YT.PlayerState.ENDED
                ) {
                  setIsPlaying(false);
                }
              }
            },
          },
        });
      } catch {
        // safe fallback if already bound
      }
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }
  }, [selectedSongId, currentVideoId]);

  // Handle switching songs: reset playback timer, active move preview, and players
  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
    setSelectedVideoIdOverride(null);
    lastSeekTimestampRef.current = getNow();
    ytPlayerStateRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(false);
    setInspectingMove(null);
    rhythmSynthRef.current?.stop();
    try {
      ytPlayerRef.current?.pauseVideo();
      ytPlayerRef.current?.seekTo(0, true);
    } catch {}
  };

  const handleSwitchVideoVersion = (videoId: string) => {
    if (videoId === currentVideoId) return;
    setSelectedVideoIdOverride(videoId);
    lastSeekTimestampRef.current = getNow();
    ytPlayerStateRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(false);
    rhythmSynthRef.current?.stop();
    try {
      ytPlayerRef.current?.pauseVideo();
      ytPlayerRef.current?.seekTo(0, true);
    } catch {}
  };

  // Active segment determined by currentTime
  const activeSegmentIndex = useMemo(() => {
    const idx = effectiveSegments.findIndex(
      (seg) =>
        currentTime >= seg.startTimeSeconds &&
        (currentTime < seg.endTimeSeconds ||
          (seg.endTimeSeconds === effectiveDuration &&
            currentTime <= seg.endTimeSeconds))
    );
    return idx !== -1 ? idx : 0;
  }, [effectiveSegments, effectiveDuration, currentTime]);

  const activeSegment: SongSegment =
    effectiveSegments[activeSegmentIndex] ?? effectiveSegments[0];
  const nextSegment: SongSegment | undefined =
    effectiveSegments[activeSegmentIndex + 1];

  const secondsUntilNextShift = nextSegment
    ? Math.max(0, activeSegment.endTimeSeconds - Math.floor(currentTime))
    : 0;

  // Real-time synchronization loop (polls YouTube if playing, or runs simulation timer)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 250;
    const interval = setInterval(() => {
      let updatedTime: number | null = null;
      const canSyncFromYT =
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.getCurrentTime === "function" &&
        ytPlayerStateRef.current === 1 &&
        playbackSpeed === 1 &&
        getNow() - lastSeekTimestampRef.current > 1000;

      if (canSyncFromYT) {
        try {
          const ytTime = ytPlayerRef.current!.getCurrentTime();
          if (typeof ytTime === "number" && !isNaN(ytTime) && ytTime >= 0) {
            updatedTime = ytTime;
          }
        } catch {}
      }

      if (updatedTime !== null) {
        if (updatedTime >= effectiveDuration) {
          setIsPlaying(false);
          setCurrentTime(effectiveDuration);
          ytPlayerStateRef.current = 0;
          try {
            ytPlayerRef.current?.pauseVideo();
          } catch {}
        } else {
          setCurrentTime(updatedTime);
        }
      } else {
        setCurrentTime((prev) => {
          const next = prev + (intervalMs / 1000) * playbackSpeed;
          if (next >= effectiveDuration) {
            setIsPlaying(false);
            ytPlayerStateRef.current = 0;
            try {
              ytPlayerRef.current?.pauseVideo();
            } catch {}
            return effectiveDuration;
          }
          return next;
        });
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, effectiveDuration]);

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, effectiveDuration));
    lastSeekTimestampRef.current = getNow();
    setCurrentTime(clamped);
    try {
      ytPlayerRef.current?.seekTo(clamped, true);
    } catch {}
  };

  const handleReset = () => {
    lastSeekTimestampRef.current = getNow();
    ytPlayerStateRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(false);
    rhythmSynthRef.current?.stop();
    try {
      ytPlayerRef.current?.pauseVideo();
      ytPlayerRef.current?.seekTo(0, true);
    } catch {}
  };

  const togglePlay = () => {
    const isAtEnd =
      currentTime >= effectiveDuration - 0.5 ||
      ytPlayerStateRef.current === 0;

    if (isAtEnd) {
      lastSeekTimestampRef.current = getNow();
      setCurrentTime(0);
      try {
        ytPlayerRef.current?.seekTo(0, true);
      } catch {}
    }

    const willPlay = !isPlaying;
    setIsPlaying(willPlay);
    try {
      if (willPlay) {
        if (isAtEnd) {
          lastSeekTimestampRef.current = getNow();
          ytPlayerRef.current?.seekTo(0, true);
        }
        ytPlayerRef.current?.playVideo();
      } else {
        ytPlayerRef.current?.pauseVideo();
      }
    } catch {}
  };

  return (
    <div
      data-testid="timba-song-anatomy-player"
      className={`rounded-2xl sm:rounded-3xl border border-line bg-surface-1 text-ivory p-2.5 sm:p-6 space-y-2.5 sm:space-y-5 shadow-2xl overflow-hidden relative ${className}`}
    >
      {/* 1. Top Bar: Header & Song Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 border-b border-line pb-2.5 sm:pb-4">
        <div className="hidden md:block space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-brand text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1">
              <Compass className="h-3.5 w-3.5" />
              Interactive Song Map
            </Badge>
            <Badge variant="outline" className="border-line bg-surface-3 text-xs font-semibold text-stone-300">
              Live Dancer HUD
            </Badge>
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-ivory">
            Timba Song Anatomy &amp; Gear-Shift Trainer
          </h2>
          <p className="text-xs text-stone-400">
            Follow a real track in real time. Know exactly when the horns hit, when to breakaway, and when to drop into Bomba.
          </p>
        </div>

        {/* 1-Line Compact Mobile Header */}
        <div className="flex md:hidden items-center justify-between gap-2 text-xs">
          <span className="font-black text-ivory truncate">
            🎵 Timba Trainer • {activeSong.title.replace(/\s*\(.*?\)\s*/g, "")} • {activeSong.bpm} Tempo
          </span>
          <span className="font-mono text-[11px] font-extrabold text-stone-400 shrink-0">
            {formatSeconds(currentTime)} elapsed
          </span>
        </div>

        {/* Song Switcher Tabs (Swipeable on mobile, flex-wrap on desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:flex-wrap md:pb-0 self-start md:self-auto w-full md:w-auto">
          {TIMBA_SONG_ANATOMY_DATA.map((song) => {
            const isSelected = song.id === activeSong.id;
            const isBoss = song.id === "agua-pa-yemaya";
            return (
              <button
                key={song.id}
                type="button"
                data-testid={`select-song-${song.id}`}
                onClick={() => handleSelectSong(song.id)}
                className={`rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-all min-h-[38px] sm:min-h-[40px] flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  isSelected
                    ? isBoss
                      ? "bg-gradient-to-r from-red-950/90 to-amber-950/90 text-gold shadow-xs border border-gold/60 ring-1 ring-gold/50"
                      : "bg-gold/20 text-gold border border-gold/60 shadow-xs ring-1 ring-gold/40"
                    : isBoss
                    ? "border border-gold/30 bg-surface-3 text-gold hover:bg-surface-2"
                    : "border border-line bg-surface-3 text-stone-400 hover:bg-surface-2 hover:text-stone-200"
                }`}
              >
                <Music className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-none">{song.title}</span>
                {isBoss ? (
                  <Badge className="bg-amber-500 text-stone-950 font-black text-[9px] uppercase px-1.5 py-0 tracking-wider">
                    Boss Track
                  </Badge>
                ) : (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-amber-500/30 text-amber-200"
                        : "bg-white/5 text-stone-400"
                    }`}
                  >
                    {song.segments.length} Segs
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isSelected
                      ? "text-inherit"
                      : "text-stone-300"
                  }`}
                >
                  {song.bpm} BPM
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Song Meta Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-line bg-surface-2 p-2.5 sm:p-4 text-xs text-stone-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold border border-gold/20">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-ivory">
              {activeSong.title}
            </h3>
            <p className="text-stone-400 text-[11px]">
              {activeSong.artist} • <span className="font-mono font-semibold text-stone-300">{activeSong.bpm} BPM</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-bold border-line bg-surface-3 text-stone-300">
            {activeSong.claveType.toLowerCase().includes("clave") ||
            activeSong.claveType.toLowerCase().includes("hybrid")
              ? activeSong.claveType
              : `${activeSong.claveType} Clave`}
          </Badge>
          <Badge
            className={`text-[11px] font-bold ${
              activeSong.difficultyLevel === "Beginner"
                ? "bg-sky-950/80 text-sky-200 border border-sky-500/30"
                : activeSong.difficultyLevel === "Advanced"
                ? "bg-gradient-to-r from-red-950/80 to-amber-950/80 text-gold border border-gold/40"
                : "bg-rose-950/80 text-rose-200 border border-rose-500/30"
            }`}
          >
            {activeSong.difficultyLevel} Level
          </Badge>

          {/* Segmented Cockpit Role Switcher (Leader ⇄ Follower) */}
          <div
            data-testid="cockpit-role-switcher"
            className="flex items-center rounded-xl border border-line bg-surface-1 p-0.5 text-xs shadow-xs"
          >
            <button
              type="button"
              data-testid="role-switch-leader"
              aria-pressed={activeRole === "leader"}
              onClick={() => setActiveRole("leader")}
              className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                activeRole === "leader"
                  ? "bg-role-lead-soft text-role-lead border border-role-lead-line shadow-xs"
                  : "text-ivory-muted hover:text-ivory"
              }`}
            >
              🕺 Leader
            </button>
            <button
              type="button"
              data-testid="role-switch-follower"
              aria-pressed={activeRole === "follower"}
              onClick={() => setActiveRole("follower")}
              className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                activeRole === "follower"
                  ? "bg-role-follow-soft text-role-follow border border-role-follow-line shadow-xs"
                  : "text-ivory-muted hover:text-ivory"
              }`}
            >
              💃 Follower
            </button>
          </div>

          {/* Toggle Real Song Embedded Player */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="toggle-song-stream"
            onClick={() => setShowVideoDrawer((prev) => !prev)}
            className={`h-8 text-xs font-bold transition-all ${
              showVideoDrawer
                ? "border-gold/40 bg-gold/20 hover:bg-gold/30 text-gold shadow-xs"
                : "border-line bg-surface-3 text-stone-300 hover:bg-surface-2 hover:text-white"
            }`}
          >
            <YouTubeIcon className="mr-1.5 h-3.5 w-3.5 text-brand" />
            {showVideoDrawer ? "Close Song Player" : "Original Song Player"}
          </Button>

          {/* Toggle Web Audio Clave Helper */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="toggle-rhythm-audio"
            onClick={() => setIsClaveHelperActive((prev) => !prev)}
            className={`h-8 text-xs font-bold transition-all ${
              isClaveHelperActive
                ? "border-gold/40 bg-gold/20 hover:bg-gold/30 text-gold shadow-xs"
                : "border-line bg-surface-3 text-stone-300 hover:bg-surface-2 hover:text-white"
            }`}
          >
            {isClaveHelperActive ? (
              <>
                <Volume2 className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                Clave Click: ON
              </>
            ) : (
              <>
                <VolumeX className="mr-1.5 h-3.5 w-3.5 text-stone-500" />
                Clave Click: OFF
              </>
            )}
          </Button>

          {activeSong.spotifyOrYoutubeEmbedUrl && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold border-line bg-surface-3 text-stone-300 hover:bg-surface-2 hover:text-white"
            >
              <a
                href={activeSong.spotifyOrYoutubeEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Headphones className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                Spotify
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Embedded Real Song Player Drawer (Persistent Mount for instant timeline seek) */}
      <div
        data-testid="embedded-youtube-player-container"
        className={`rounded-2xl border border-line bg-surface-2 p-3 sm:p-4 space-y-2 text-ivory shadow-md transition-all ${
          showVideoDrawer ? "" : "hidden"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-2 border-b border-line">
          <div className="flex items-center gap-1.5 font-bold text-ivory">
            <YouTubeIcon className="h-4 w-4 text-brand shrink-0" />
            <span>
              Official Recording Stream • {activeSong.title} ({activeSong.artist})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeSong.alternateYoutubeVideoId && (
              <div className="flex items-center rounded-lg border border-line bg-surface-3 p-0.5 text-[11px]">
                <button
                  type="button"
                  data-testid="switch-version-studio"
                  onClick={() => handleSwitchVideoVersion(activeSong.youtubeVideoId)}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    currentVideoId === activeSong.youtubeVideoId
                      ? "bg-ivory text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-ivory"
                  }`}
                >
                  Studio Audio (5:46)
                </button>
                <button
                  type="button"
                  data-testid="switch-version-video"
                  onClick={() =>
                    handleSwitchVideoVersion(activeSong.alternateYoutubeVideoId!)
                  }
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    currentVideoId === activeSong.alternateYoutubeVideoId
                      ? "bg-ivory text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-ivory"
                  }`}
                >
                  Music Video (6:11)
                </button>
              </div>
            )}
            <span className="text-[11px] text-white/60 hidden md:inline">
              Two-way timeline synchronized
            </span>
          </div>
        </div>
        <div className="relative aspect-video w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg bg-black">
          <iframe
            key={`${selectedSongId}-${currentVideoId}`}
            id={`youtube-iframe-${selectedSongId}`}
            data-testid="youtube-iframe"
            title={`Official recording for ${activeSong.title}`}
            src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?enablejsapi=1&playsinline=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* 8-Count Dancer Beat Bar */}
      <TimbaBeatBar
        isPlaying={isPlaying}
        currentDancerBeat={currentDancerBeat}
      />

      {/* 3. Proportional Interactive Timeline Scrubber */}
      <TimbaTimelineScrubber
        currentTime={currentTime}
        effectiveDuration={effectiveDuration}
        effectiveSegments={effectiveSegments}
        activeSegmentIndex={activeSegmentIndex}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        handleSeek={handleSeek}
        togglePlay={togglePlay}
        handleReset={handleReset}
        setPlaybackSpeed={setPlaybackSpeed}
      />

      {/* 4. Live "Dancer HUD" Panel */}
      <TimbaDancerHud
        activeSegment={activeSegment}
        activeSegmentIndex={activeSegmentIndex}
        totalSegments={effectiveSegments.length}
        nextSegment={nextSegment}
        secondsUntilNextShift={secondsUntilNextShift}
        activeRole={activeRole}
        inspectingMove={inspectingMove}
        setInspectingMove={setInspectingMove}
        resolveCurriculumMove={resolveCurriculumMove}
      />
    </div>
  );
}
