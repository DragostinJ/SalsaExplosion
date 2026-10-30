"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findSegmentIndexAt } from "@/lib/music/song-timing";
import { loadYouTubeIframeApi, YT_STATE, type YTPlayerInstance } from "@/lib/music/youtube-iframe-api";
import { DISPLAY_UPDATE_INTERVAL_MS, type SongClock, type SongClockOptions } from "@/lib/music/song-clock";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Song clock driven ONLY by the YouTube player.
 *
 * - The video is the single source of truth: when it buffers, pauses or is
 *   scrubbed with YouTube's own controls, the clock follows. It never runs on a
 *   simulated timer, so cues can't drift ahead of the music on slow connections.
 * - YouTube reports currentTime only a few times per second, so between reports
 *   the time is interpolated with performance.now() (scaled by playback rate)
 *   while PLAYING. Section changes land within one animation frame.
 * - `latencyOffsetSeconds` compensates for audio output delay (e.g. Bluetooth
 *   earbuds). It is real time, so it is scaled by the playback rate.
 */

/** Never extrapolate further than this past the last YouTube report (guards against silent stalls). */
const MAX_EXTRAPOLATION_SECONDS = 0.6;
/** Reports this far behind the estimate are treated as latency, larger gaps as a real seek. */
const MAX_BACKWARD_CORRECTION_SECONDS = 0.35;

interface UseYouTubeSongClockOptions extends SongClockOptions {
  videoId: string;
  segments: readonly SongSegment[];
}

export interface YouTubeSongClock extends SongClock {
  /** Callback ref for an empty element; the YouTube iframe is created inside it. */
  containerRef: (node: HTMLDivElement | null) => void;
}

export function useYouTubeSongClock({
  videoId,
  segments,
  latencyOffsetSeconds = 0,
  onFrame,
}: UseYouTubeSongClockOptions): YouTubeSongClock {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const stateRef = useRef<number>(YT_STATE.UNSTARTED);
  const lastReportRef = useRef<{ videoTime: number; at: number }>({ videoTime: 0, at: 0 });
  const offsetRef = useRef(latencyOffsetSeconds);
  const rateRef = useRef(1);
  const segmentsRef = useRef(segments);
  const onFrameRef = useRef(onFrame);

  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<number>(YT_STATE.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [actualDurationSeconds, setActualDurationSeconds] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);

  useEffect(() => {
    offsetRef.current = latencyOffsetSeconds;
  }, [latencyOffsetSeconds]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  /** Latency offset converted from real seconds to media seconds. */
  const mediaOffset = () => offsetRef.current * rateRef.current;

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
      ? anchor.videoTime + Math.min(((now - anchor.at) / 1000) * rateRef.current, MAX_EXTRAPOLATION_SECONDS)
      : anchor.videoTime;

    if (reported === anchor.videoTime) {
      return estimate;
    }

    // A report slightly behind our estimate is report latency, not a rewind:
    // keep moving forward so a section boundary can't flicker back and forth.
    const lag = estimate - reported;
    if (isPlaying && lag > 0 && lag < MAX_BACKWARD_CORRECTION_SECONDS) {
      lastReportRef.current = { videoTime: reported, at: now - (lag / rateRef.current) * 1000 };
      return estimate;
    }

    // Real seek, pause position or fresh report: snap to YouTube
    lastReportRef.current = { videoTime: reported, at: now };
    return reported;
  }, []);

  const getExactTime = useCallback(() => Math.max(0, readVideoTime() - mediaOffset()), [readVideoTime]);

  // Create / recreate the player when the video changes
  useEffect(() => {
    let cancelled = false;
    if (!host) return;

    // YouTube replaces this node with an iframe, so React must not own it
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.replaceChildren(mount);

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
          onPlaybackRateChange: (event) => {
            if (cancelled) return;
            lastReportRef.current = { videoTime: readVideoTimeRaw(), at: performance.now() };
            rateRef.current = event.data;
            setPlaybackRateState(event.data);
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
      rateRef.current = 1;
      host.replaceChildren();
      // Reset for the next video (state starts in this shape on first mount)
      setIsReady(false);
      setPlayerState(YT_STATE.UNSTARTED);
      setErrorCode(null);
      setActualDurationSeconds(null);
      setPlaybackRateState(1);
    };
  }, [videoId, host]);

  // Frame loop: section index per frame, display time throttled, onFrame hook
  useEffect(() => {
    if (!isReady) return;
    let frame = 0;
    let lastDisplayUpdate = 0;
    let lastIndex = -1;

    const tick = (now: number) => {
      const cueTime = Math.max(0, readVideoTime() - mediaOffset());
      const index = findSegmentIndexAt(segmentsRef.current, cueTime);
      if (index !== lastIndex) {
        lastIndex = index;
        setSegmentIndex(index);
      }
      if (now - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL_MS) {
        lastDisplayUpdate = now;
        setCurrentTime(cueTime);
      }
      onFrameRef.current?.(cueTime);
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
    const videoTime = Math.max(0, cueSeconds + offsetRef.current * rateRef.current);
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

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      // Confirmed through onPlaybackRateChange, which re-anchors interpolation
      playerRef.current?.setPlaybackRate?.(rate);
    } catch {
      // Not ready
    }
  }, []);

  return {
    containerRef: setHost,
    isReady,
    isPlaying: playerState === YT_STATE.PLAYING,
    isBuffering: playerState === YT_STATE.BUFFERING,
    currentTime,
    segmentIndex,
    actualDurationSeconds,
    errorCode,
    playbackRate,
    getExactTime,
    play,
    pause,
    togglePlay,
    seek,
    setPlaybackRate,
  };
}
