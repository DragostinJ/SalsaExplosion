"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findSegmentIndexAt } from "@/lib/music/song-timing";
import { loadYouTubeIframeApi, YT_STATE, type YTPlayerInstance } from "@/lib/music/youtube-iframe-api";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Song clock driven ONLY by the YouTube player.
 *
 * - The video is the single source of truth: when it buffers, pauses or is
 *   scrubbed with YouTube's own controls, the clock follows. It never runs on a
 *   simulated timer, so cues can't drift ahead of the music on slow connections.
 * - YouTube reports currentTime only a few times per second, so between reports
 *   the time is interpolated with performance.now() while PLAYING. That makes
 *   section changes land within one animation frame instead of up to ~250ms late.
 * - `latencyOffsetSeconds` compensates for audio output delay (e.g. Bluetooth
 *   earbuds): cues are shown that many seconds later than the video clock.
 */

/** Never extrapolate further than this past the last YouTube report (guards against silent stalls). */
const MAX_EXTRAPOLATION_SECONDS = 0.6;
/** Reports this far behind the estimate are treated as latency, larger gaps as a real seek. */
const MAX_BACKWARD_CORRECTION_SECONDS = 0.35;
/** How often the coarse `currentTime` state re-renders the UI (section changes are per frame). */
const DISPLAY_UPDATE_INTERVAL_MS = 100;

interface UseYouTubeSongClockOptions {
  videoId: string;
  segments: readonly SongSegment[];
  latencyOffsetSeconds?: number;
}

export interface YouTubeSongClock {
  /** Attach to an empty element; the YouTube iframe is created inside it. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReady: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Cue time (video time minus latency offset), updated ~10x per second. */
  currentTime: number;
  /** Section index, updated on the exact frame the boundary is crossed. */
  segmentIndex: number;
  /** Real duration reported by YouTube, null until known. */
  actualDurationSeconds: number | null;
  /** YouTube error code (e.g. 101/150 = embedding disabled), null when fine. */
  errorCode: number | null;
  /** Precise cue time right now (for calibration marks). */
  getExactTime: () => number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  /** Seek to a cue time (the latency offset is applied for you). */
  seek: (cueSeconds: number) => void;
}

export function useYouTubeSongClock({
  videoId,
  segments,
  latencyOffsetSeconds = 0,
}: UseYouTubeSongClockOptions): YouTubeSongClock {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const stateRef = useRef<number>(YT_STATE.UNSTARTED);
  const lastReportRef = useRef<{ videoTime: number; at: number }>({ videoTime: 0, at: 0 });
  const offsetRef = useRef(latencyOffsetSeconds);
  const segmentsRef = useRef(segments);

  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<number>(YT_STATE.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [actualDurationSeconds, setActualDurationSeconds] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    offsetRef.current = latencyOffsetSeconds;
  }, [latencyOffsetSeconds]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const readVideoTime = useCallback((): number => {
    const player = playerRef.current;
    const now = performance.now();
    let reported = lastReportRef.current.videoTime;

    if (player && typeof player.getCurrentTime === "function") {
      try {
        const value = player.getCurrentTime();
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
          reported = value;
        }
      } catch {
        // Player not attached yet
      }
    }

    const isPlaying = stateRef.current === YT_STATE.PLAYING;
    const anchor = lastReportRef.current;
    const estimate = isPlaying
      ? anchor.videoTime + Math.min((now - anchor.at) / 1000, MAX_EXTRAPOLATION_SECONDS)
      : anchor.videoTime;

    if (reported === anchor.videoTime) {
      return estimate;
    }

    // A report slightly behind our estimate is report latency, not a rewind:
    // keep moving forward so a section boundary can't flicker back and forth.
    const lag = estimate - reported;
    if (isPlaying && lag > 0 && lag < MAX_BACKWARD_CORRECTION_SECONDS) {
      lastReportRef.current = { videoTime: reported, at: now - lag * 1000 };
      return estimate;
    }

    // Real seek, pause position or fresh report: snap to YouTube
    lastReportRef.current = { videoTime: reported, at: now };
    return reported;
  }, []);

  const getExactTime = useCallback(
    () => Math.max(0, readVideoTime() - offsetRef.current),
    [readVideoTime]
  );

  // Create / recreate the player when the video changes
  useEffect(() => {
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    // YouTube replaces this node with an iframe, so React must not own it
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.replaceChildren(mount);

    setIsReady(false);
    setErrorCode(null);
    setActualDurationSeconds(null);
    lastReportRef.current = { videoTime: 0, at: performance.now() };

    const readDuration = (player: YTPlayerInstance) => {
      const duration = player.getDuration?.();
      if (typeof duration === "number" && duration > 0) {
        setActualDurationSeconds(duration);
      }
    };

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            setIsReady(true);
            readDuration(event.target);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            stateRef.current = event.data;
            setPlayerState(event.data);
            // Re-anchor interpolation on every state change
            lastReportRef.current = { videoTime: readVideoTimeRaw(), at: performance.now() };
            if (event.data === YT_STATE.PLAYING && playerRef.current) {
              readDuration(playerRef.current);
            }
          },
          onError: (event) => {
            if (!cancelled) setErrorCode(event.data);
          },
        },
      });
    });

    function readVideoTimeRaw(): number {
      try {
        const value = playerRef.current?.getCurrentTime();
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
      } catch {
        return 0;
      }
    }

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // Already torn down
      }
      playerRef.current = null;
      stateRef.current = YT_STATE.UNSTARTED;
      host.replaceChildren();
    };
  }, [videoId]);

  // Frame loop: section index per frame, display time throttled
  useEffect(() => {
    if (!isReady) return;
    let frame = 0;
    let lastDisplayUpdate = 0;
    let lastIndex = -1;

    const tick = (now: number) => {
      const cueTime = Math.max(0, readVideoTime() - offsetRef.current);
      const index = findSegmentIndexAt(segmentsRef.current, cueTime);
      if (index !== lastIndex) {
        lastIndex = index;
        setSegmentIndex(index);
      }
      if (now - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL_MS) {
        lastDisplayUpdate = now;
        setCurrentTime(cueTime);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isReady, readVideoTime]);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch {
      // Not ready
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {
      // Not ready
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current === YT_STATE.PLAYING || stateRef.current === YT_STATE.BUFFERING) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const seek = useCallback((cueSeconds: number) => {
    const videoTime = Math.max(0, cueSeconds + offsetRef.current);
    try {
      playerRef.current?.seekTo(videoTime, true);
    } catch {
      return;
    }
    // Jump the UI immediately; YouTube's next report confirms it
    lastReportRef.current = { videoTime, at: performance.now() };
    setCurrentTime(Math.max(0, cueSeconds));
    setSegmentIndex(findSegmentIndexAt(segmentsRef.current, cueSeconds));
  }, []);

  return {
    containerRef,
    isReady,
    isPlaying: playerState === YT_STATE.PLAYING,
    isBuffering: playerState === YT_STATE.BUFFERING,
    currentTime,
    segmentIndex,
    actualDurationSeconds,
    errorCode,
    getExactTime,
    play,
    pause,
    togglePlay,
    seek,
  };
}
