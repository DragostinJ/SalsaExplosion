"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  SegmentColorTheme,
} from "@/lib/constants/timba-song-anatomy";
import { CurriculumSkillItem } from "@/lib/constants/cuban-curriculum-2027";
import { CubanRhythmSynth } from "@/lib/audio/cuban-rhythm-synth";

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

function YouTubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
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
  slate: {
    bgActive: "bg-stone-800/80 border-stone-500/50 text-stone-100",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-stone-500/40",
    text: "text-stone-100 font-bold",
    badge: "border-stone-500/40 bg-stone-800/80 text-stone-200 font-bold",
    pillBg: "bg-stone-500",
  },
  blue: {
    bgActive: "bg-sky-950/60 border-sky-500/40 text-sky-200",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-sky-500/40",
    text: "text-sky-200 font-bold",
    badge: "border-sky-500/40 bg-sky-950/60 text-sky-200 font-bold",
    pillBg: "bg-sky-500",
  },
  emerald: {
    bgActive: "bg-emerald-950/60 border-emerald-500/40 text-emerald-200",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-emerald-500/40",
    text: "text-emerald-200 font-bold",
    badge: "border-emerald-500/40 bg-emerald-950/60 text-emerald-200 font-bold",
    pillBg: "bg-emerald-500",
  },
  amber: {
    bgActive: "bg-amber-950/60 border-amber-500/40 text-amber-200",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-amber-500/40",
    text: "text-amber-200 font-bold",
    badge: "border-amber-500/40 bg-amber-950/60 text-amber-200 font-bold",
    pillBg: "bg-amber-500",
  },
  purple: {
    bgActive: "bg-purple-950/60 border-purple-500/40 text-purple-200",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-purple-500/40",
    text: "text-purple-200 font-bold",
    badge: "border-purple-500/40 bg-purple-950/60 text-purple-200 font-bold",
    pillBg: "bg-purple-500",
  },
  red: {
    bgActive: "bg-rose-950/60 border-rose-500/40 text-rose-200",
    bgInactive: "bg-[#1C1917] text-stone-400 border-white/[0.06] hover:bg-[#26221F] hover:text-stone-200",
    border: "border-rose-500/40",
    text: "text-rose-200 font-bold",
    badge: "border-rose-500/40 bg-rose-950/60 text-rose-200 font-bold",
    pillBg: "bg-rose-500",
  },
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
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
      className={`rounded-2xl sm:rounded-3xl border border-white/10 bg-[#110F0E] text-[#F5F2EB] p-2.5 sm:p-6 space-y-2.5 sm:space-y-5 shadow-2xl overflow-hidden relative ${className}`}
    >
      {/* 1. Top Bar: Header & Song Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 border-b border-white/10 pb-2.5 sm:pb-4">
        <div className="hidden md:block space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-base text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1">
              <Compass className="h-3.5 w-3.5" />
              Interactive Song Map
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-xs font-semibold text-stone-300">
              Live Dancer HUD
            </Badge>
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
            Timba Song Anatomy &amp; Gear-Shift Trainer
          </h2>
          <p className="text-xs text-stone-400">
            Follow a real track in real time. Know exactly when the horns hit, when to breakaway, and when to drop into Bomba.
          </p>
        </div>

        {/* 1-Line Compact Mobile Header */}
        <div className="flex md:hidden items-center justify-between gap-2 text-xs">
          <span className="font-black text-white truncate">
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
                      ? "bg-gradient-to-r from-red-900/80 to-amber-900/80 text-amber-200 shadow-sm border border-amber-500/60 ring-1 ring-amber-400/50"
                      : "bg-amber-500/20 text-amber-200 border border-amber-400/50 shadow-sm ring-1 ring-amber-400/40"
                    : isBoss
                    ? "border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40"
                    : "border border-white/10 bg-[#181513] text-stone-400 hover:bg-[#221E1B] hover:text-stone-200"
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
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#181513] p-2.5 sm:p-4 text-xs text-stone-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              {activeSong.title}
            </h3>
            <p className="text-stone-400 text-[11px]">
              {activeSong.artist} • <span className="font-mono font-semibold text-stone-300">{activeSong.bpm} BPM</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-bold border-white/10 bg-white/5 text-stone-300">
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
                ? "bg-gradient-to-r from-red-900/80 to-amber-900/80 text-amber-200 border border-amber-500/40"
                : "bg-rose-950/80 text-rose-200 border border-rose-500/30"
            }`}
          >
            {activeSong.difficultyLevel} Level
          </Badge>

          {/* Segmented Cockpit Role Switcher (Leader ⇄ Follower) */}
          <div
            data-testid="cockpit-role-switcher"
            className="flex items-center rounded-xl border border-white/10 bg-[#110F0E] p-0.5 text-xs shadow-xs"
          >
            <button
              type="button"
              data-testid="role-switch-leader"
              aria-pressed={activeRole === "leader"}
              onClick={() => setActiveRole("leader")}
              className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                activeRole === "leader"
                  ? "bg-teal-900/80 text-teal-200 border border-teal-500/40 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
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
                  ? "bg-rose-900/80 text-rose-200 border border-rose-500/40 shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
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
                ? "border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 shadow-xs"
                : "border-white/10 bg-[#181513] text-stone-300 hover:bg-[#221E1B] hover:text-white"
            }`}
          >
            <YouTubeIcon className="mr-1.5 h-3.5 w-3.5 text-red-500" />
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
                ? "border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 shadow-xs"
                : "border-white/10 bg-[#181513] text-stone-300 hover:bg-[#221E1B] hover:text-white"
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
              className="h-8 text-xs font-semibold border-white/10 bg-[#181513] text-stone-300 hover:bg-[#221E1B] hover:text-white"
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
        className={`rounded-2xl border border-border/80 bg-slate-950 p-3 sm:p-4 space-y-2 text-white shadow-md transition-all ${
          showVideoDrawer ? "" : "hidden"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 font-bold text-white/90">
            <YouTubeIcon className="h-4 w-4 text-red-500 shrink-0" />
            <span>
              Official Recording Stream • {activeSong.title} ({activeSong.artist})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeSong.alternateYoutubeVideoId && (
              <div className="flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5 text-[11px]">
                <button
                  type="button"
                  data-testid="switch-version-studio"
                  onClick={() => handleSwitchVideoVersion(activeSong.youtubeVideoId)}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    currentVideoId === activeSong.youtubeVideoId
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-white/70 hover:text-white"
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
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-white/70 hover:text-white"
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
      <div
        data-testid="dancer-beat-bar"
        className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#181513] p-1.5 sm:p-3 flex items-center justify-between gap-1.5 sm:gap-2.5 text-xs shadow-xs"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-white shrink-0">
          <Headphones className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] sm:text-xs">Dancer Rhythm Bar:</span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((beatNum) => {
            const isCurrent = isPlaying && currentDancerBeat === beatNum;
            const isBreakOn1 = beatNum === 1;
            const isSonOn2 = beatNum === 2;

            return (
              <div
                key={beatNum}
                className={`h-6 sm:h-7 px-1.5 sm:px-2.5 rounded-lg flex items-center justify-center font-mono font-black text-[11px] sm:text-xs transition-all ${
                  isCurrent
                    ? "bg-amber-500 text-stone-950 font-black shadow-sm scale-105 ring-2 ring-amber-400"
                    : isBreakOn1
                    ? "border border-rose-500/40 bg-rose-500/20 text-rose-300"
                    : isSonOn2
                    ? "border border-sky-500/40 bg-sky-500/20 text-sky-300"
                    : "border border-white/[0.08] bg-[#110F0E] text-stone-400"
                }`}
                title={
                  isBreakOn1
                    ? "Beat 1: Casino On1 Break Step"
                    : isSonOn2
                    ? "Beat 2: Son Contratiempo Step"
                    : `Beat ${beatNum}`
                }
              >
                {beatNum}
              </div>
            );
          })}
        </div>

        <span className="text-[10px] text-stone-400 font-medium hidden lg:inline">
          Red = Beat 1 (On1) • Blue = Beat 2 (Son)
        </span>
      </div>

      {/* 3. Proportional Interactive Timeline Scrubber */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            Song Progression Timeline (Click Any Segment to Jump)
          </span>
          <span className="font-mono font-extrabold text-stone-200">
            {formatSeconds(currentTime)} / {formatSeconds(effectiveDuration)}
          </span>
        </div>

        {/* Multi-segment proportional bar */}
        <div
          role="region"
          aria-label="Song Segments Bar"
          className="relative h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden bg-[#14110F] flex"
        >
          {effectiveSegments.map((segment, idx) => {
            const segmentDuration = segment.endTimeSeconds - segment.startTimeSeconds;
            const widthPct = (segmentDuration / effectiveDuration) * 100;
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
                className={`relative h-full text-left transition-all px-1 sm:px-2 flex flex-col justify-center border-r border-white/10 last:border-r-0 ${
                  isSegmentActive
                    ? "bg-amber-500/25 text-amber-200 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-inset ring-amber-400/60"
                    : theme.bgInactive
                }`}
              >
                <div className="truncate text-[10px] font-bold text-white">
                  {widthPct < 12 ? (
                    <>
                      <span className="md:hidden text-[9px] font-bold">{idx + 1}</span>
                      <span className="hidden md:inline">{segment.sectionName}</span>
                    </>
                  ) : (
                    <span>{segment.sectionName}</span>
                  )}
                </div>
                <div className="hidden md:block truncate text-[9px] text-stone-300 font-semibold">
                  {segment.danceGear}
                </div>
              </button>
            );
          })}

          {/* Live Playhead Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] pointer-events-none z-10"
            style={{
              left: `${Math.min(
                100,
                (currentTime / effectiveDuration) * 100
              )}%`,
            }}
          />
        </div>

        {/* Mobile Quick-Jump Thumb-Friendly Segment Strip */}
        <div tabIndex={0} role="region" aria-label="Mobile quick-jump timeline segments" className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory focus:outline-none">
          {effectiveSegments.map((segment, idx) => {
            const isSegmentActive = idx === activeSegmentIndex;
            return (
              <button
                key={`mobile-seg-${segment.id}`}
                type="button"
                data-testid={`mobile-segment-chip-${idx}`}
                onClick={() => handleSeek(segment.startTimeSeconds)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shrink-0 transition-all border snap-start ${
                  isSegmentActive
                    ? "bg-amber-500/25 border-amber-400/50 text-amber-200 ring-1 ring-amber-400/50 shadow-xs"
                    : "border-white/10 bg-[#181513] text-stone-400 hover:bg-[#221E1B] hover:text-stone-200"
                }`}
              >
                <span>{idx + 1}. {segment.sectionName}</span>
                <span className="ml-1 opacity-75 font-mono text-[9px]">{segment.formattedRange.split(" - ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Playback Controls & Range Scrubber */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              data-testid="playback-toggle"
              onClick={togglePlay}
              className="h-9 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow-xs"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  {currentTime >= effectiveDuration ? "Replay" : "Play Along"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 text-xs font-semibold rounded-xl border-white/10 bg-[#181513] text-stone-200 hover:bg-[#221E1B] hover:text-white"
              title="Reset to 0:00"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            {/* Speed Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-[#14110F] p-0.5 text-xs">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    playbackSpeed === spd
                      ? "bg-amber-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-stone-200"
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
              max={effectiveDuration}
              step={1}
              value={Math.floor(currentTime)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Live "Dancer HUD" Panel */}
      <div className="space-y-3 sm:space-y-4 pt-2 border-t border-white/10">
        {/* Active Segment Announcement Banner */}
        <div
          data-testid="active-segment-hud"
          className="rounded-xl sm:rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/15 via-[#1A1613] to-[#14110F] text-white p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-md transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80">
                  Current Segment ({activeSegmentIndex + 1} of {effectiveSegments.length})
                </span>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-200">
                  {activeSegment.formattedRange}
                </span>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white truncate sm:whitespace-normal">
                {activeSegment.sectionName}
              </h3>
            </div>

            {/* Next Shift Countdown */}
            {nextSegment ? (
              <div className="inline-flex sm:block items-center gap-1.5 rounded-lg sm:rounded-xl border border-white/10 bg-[#110F0E]/90 px-2.5 sm:px-3.5 py-1 sm:py-2 text-[11px] sm:text-xs sm:text-right self-start sm:self-auto shadow-xs shrink-0">
                <span className="text-[10px] text-stone-400 font-semibold inline sm:block">
                  Next in <strong className="text-amber-200 font-mono text-xs">{secondsUntilNextShift}s</strong>:
                </span>
                <span className="font-bold text-white text-[11px] truncate max-w-[220px] sm:max-w-none">
                  {nextSegment.sectionName} ({nextSegment.danceGear})
                </span>
              </div>
            ) : (
              <div className="inline-flex sm:block items-center gap-1.5 rounded-lg sm:rounded-xl border border-white/10 bg-[#110F0E]/90 px-2.5 sm:px-3.5 py-1 sm:py-2 text-[11px] sm:text-xs sm:text-right self-start sm:self-auto shadow-xs shrink-0">
                <span className="text-[10px] text-stone-400 font-semibold inline sm:block">
                  Song Climax
                </span>
                <span className="font-bold text-amber-300 text-[11px]">
                  Final Section • Strike Pose
                </span>
              </div>
            )}
          </div>

          {/* Active Dance Gear Pill & Timing Mode Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 text-[11px] sm:text-xs">
            <span className="text-[11px] sm:text-xs font-bold text-stone-200">Recommended Gear:</span>
            <Badge className="border-amber-400/40 bg-amber-500/20 text-amber-200 text-[10px] sm:text-xs font-black px-2 py-0.5">
              {activeSegment.danceGear}
            </Badge>

            {activeSegment.timingMode && (
              <Badge
                variant="outline"
                data-testid="active-timing-mode-badge"
                className="border-amber-500/40 bg-amber-500/10 text-amber-200 text-[10px] sm:text-xs font-black flex items-center gap-1 px-2 sm:px-2.5 py-0.5"
              >
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">Timing: {activeSegment.timingMode}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* 3-Zone Body Telemetry (Polyrhythm Zone Separation) */}
        {activeSegment.instrumentMapping && (
          <div
            data-testid="body-telemetry-widget"
            className="rounded-xl border border-white/[0.08] bg-[#181513] p-1.5 sm:p-3 space-y-1 sm:space-y-1.5 shadow-xs"
          >
            <div className="hidden md:flex items-center justify-between gap-2 border-b border-white/[0.06] pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2">
                  Level 4 Body Separation
                </Badge>
                <h4 className="text-[11px] sm:text-xs font-black text-stone-200 uppercase tracking-wide">
                  3-Zone Body Telemetry
                </h4>
              </div>
              <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                Polyrhythmic Body Isolation Map
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {/* Zone 1: Chest & Shoulders */}
              <div className="rounded-lg border border-white/[0.07] bg-[#161311] p-1.5 sm:p-2 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-sky-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  Chest &amp; Shoulders
                </span>
                <p className="text-[10px] sm:text-xs text-stone-200 font-bold leading-tight line-clamp-2 sm:line-clamp-none">
                  {activeSegment.instrumentMapping.chestAndShoulders}
                </p>
              </div>

              {/* Zone 2: Hips & Knees */}
              <div className="rounded-lg border border-white/[0.07] bg-[#161311] p-1.5 sm:p-2 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-amber-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  Hips &amp; Knees
                </span>
                <p className="text-[10px] sm:text-xs text-stone-200 font-bold leading-tight line-clamp-2 sm:line-clamp-none">
                  {activeSegment.instrumentMapping.hipsAndKnees}
                </p>
              </div>

              {/* Zone 3: Feet */}
              <div className="rounded-lg border border-white/[0.07] bg-[#161311] p-1.5 sm:p-2 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  Feet
                </span>
                <p className="text-[10px] sm:text-xs text-stone-200 font-bold leading-tight line-clamp-2 sm:line-clamp-none">
                  {activeSegment.instrumentMapping.feet}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2-Card Live Cue Row: Permanent Trigger + Strictly Conditional Active Role (Leader XOR Follower) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Card 1: What to Listen For (100% Permanently Visible) */}
          <div data-testid="trigger-cue-card" className="rounded-xl border border-white/10 border-l-2 border-l-amber-400 bg-[#181513] p-2.5 sm:p-3 space-y-0.5 shadow-xs">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 flex items-center gap-1.5">
              <Headphones className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              🎧 What to Listen For (Trigger)
            </span>
            <p className="text-xs text-stone-100 font-semibold leading-snug">
              {activeSegment.musicalTrigger}
            </p>
          </div>

          {/* Card 2: Strictly Conditional Role Action (ONLY Leader OR Follower in DOM!) */}
          {activeRole === "leader" ? (
            <div
              data-testid="leader-action-card"
              className="rounded-xl border border-teal-500/25 bg-teal-950/35 p-2.5 sm:p-3 space-y-0.5 shadow-xs text-teal-100"
            >
              <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
                🕺 Leader Action
              </span>
              <p className="text-xs text-teal-100 font-semibold leading-snug">
                {activeSegment.leaderCue}
              </p>
            </div>
          ) : (
            <div
              data-testid="follower-action-card"
              className="rounded-xl border border-rose-500/25 bg-rose-950/35 p-2.5 sm:p-3 space-y-0.5 shadow-xs text-rose-100"
            >
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                💃 Follower Action
              </span>
              <p className="text-xs text-rose-100 font-semibold leading-snug">
                {activeSegment.followerCue}
              </p>
            </div>
          )}
        </div>

        {/* Compact Warning Pill Strip */}
        <div
          data-testid="un-confuser-alert"
          className="rounded-lg border border-amber-500/20 bg-amber-950/30 py-1.5 px-3 flex items-center gap-2 text-xs text-amber-200/90 leading-snug shadow-xs"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <p className="line-clamp-2 sm:line-clamp-none">
            <strong className="font-black uppercase tracking-wider text-amber-300 mr-1.5">
              ⚠️ Avoid:
            </strong>
            {activeSegment.commonMistakeWarning}
          </p>
        </div>

        {/* Recommended Curriculum Moves Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
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
                      ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-xs"
                      : "border-white/10 bg-[#181513] text-stone-300 hover:bg-[#221E1B] hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{move.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-amber-500/30 text-amber-200" : "bg-white/10 text-stone-400"
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
              className="fixed inset-x-3 bottom-16 sm:static sm:inset-auto sm:bottom-auto z-50 rounded-2xl border border-white/15 bg-[#161311] p-4 sm:p-5 space-y-2.5 mt-3 shadow-2xl backdrop-blur-md text-stone-100"
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
                  <Badge className="bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[10px] font-bold">
                    {inspectingMove.level} Syllabus
                  </Badge>
                  {inspectingMove.phonetic && (
                    <span className="text-xs text-stone-400 italic">
                      Pronounced: &ldquo;{inspectingMove.phonetic}&rdquo;
                    </span>
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  {inspectingMove.name}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {inspectingMove.summary}
                </p>
              </div>

              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 text-xs pt-1">
                {inspectingMove.handholdType && (
                  <div className="rounded-xl border border-white/10 bg-[#14110F] p-2 sm:p-2.5 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Handhold &amp; Connection
                    </span>
                    <p className="font-semibold text-stone-200 text-xs">{inspectingMove.handholdType}</p>
                  </div>
                )}
                {inspectingMove.entryExitGeometry && (
                  <div className="rounded-xl border border-white/10 bg-[#14110F] p-2 sm:p-2.5 space-y-0.5">
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
    </div>
  );
}
