"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findSegmentIndexAt } from "@/lib/music/song-timing";
import { DISPLAY_UPDATE_INTERVAL_MS, type SongClock, type SongClockOptions } from "@/lib/music/song-clock";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";

/**
 * Song clock for rights-cleared audio we host ourselves (song.licensedAudio).
 *
 * An HTMLAudioElement reports a precise currentTime on every read, so no
 * interpolation is needed. Slowing down keeps the pitch (preservesPitch), so
 * 0.5x practice still sounds like the real song. Does nothing when `audioUrl`
 * is null, so it can sit next to the YouTube clock without side effects.
 */

interface UseAudioSongClockOptions extends SongClockOptions {
  audioUrl: string | null;
  segments: readonly SongSegment[];
}

export function useAudioSongClock({
  audioUrl,
  segments,
  latencyOffsetSeconds = 0,
  onFrame,
}: UseAudioSongClockOptions): SongClock {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const offsetRef = useRef(latencyOffsetSeconds);
  const segmentsRef = useRef(segments);
  const onFrameRef = useRef(onFrame);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
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

  const cueTimeNow = useCallback((): number => {
    const audio = audioRef.current;
    if (!audio) return 0;
    return Math.max(0, audio.currentTime - offsetRef.current * audio.playbackRate);
  }, []);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.preservesPitch = true;
    audioRef.current = audio;

    const onLoaded = () => {
      setIsReady(true);
      if (Number.isFinite(audio.duration)) setActualDurationSeconds(audio.duration);
    };
    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onRate = () => setPlaybackRateState(audio.playbackRate);
    const onError = () => setErrorCode(audio.error?.code ?? -1);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ratechange", onRate);
    audio.addEventListener("error", onError);
    audio.src = audioUrl;

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("ratechange", onRate);
      audio.removeEventListener("error", onError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      // Reset for the next source (state starts in this shape on first mount)
      setIsReady(false);
      setIsPlaying(false);
      setIsBuffering(false);
      setErrorCode(null);
      setActualDurationSeconds(null);
      setPlaybackRateState(1);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isReady) return;
    let frame = 0;
    let lastDisplayUpdate = 0;
    let lastIndex = -1;

    const tick = (now: number) => {
      const cueTime = cueTimeNow();
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
  }, [isReady, cueTimeNow]);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {
      // Autoplay blocked until a user gesture; the next tap will work
    });
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const togglePlay = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) pause();
    else play();
  }, [pause, play]);

  const seek = useCallback((cueSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, cueSeconds + offsetRef.current * audio.playbackRate);
    setCurrentTime(Math.max(0, cueSeconds));
    setSegmentIndex(findSegmentIndexAt(segmentsRef.current, cueSeconds));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  return {
    isReady,
    isPlaying,
    isBuffering,
    currentTime,
    segmentIndex,
    actualDurationSeconds,
    errorCode,
    playbackRate,
    getExactTime: cueTimeNow,
    play,
    pause,
    togglePlay,
    seek,
    setPlaybackRate,
  };
}
