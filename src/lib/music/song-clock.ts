/**
 * Shared contract for every song clock (YouTube video or our own licensed audio).
 * The practice player only talks to this interface, so it behaves the same
 * whichever media is playing.
 */
export interface SongClock {
  isReady: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Cue time (media time minus latency offset), updated ~10x per second. */
  currentTime: number;
  /** Section index, updated on the exact frame the boundary is crossed. */
  segmentIndex: number;
  /** Real media duration, null until known. */
  actualDurationSeconds: number | null;
  /** Media error code, null when fine. */
  errorCode: number | null;
  playbackRate: number;
  /** Precise cue time right now. */
  getExactTime: () => number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  /** Seek to a cue time (the latency offset is applied for you). */
  seek: (cueSeconds: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export interface SongClockOptions {
  latencyOffsetSeconds?: number;
  /**
   * Called on every animation frame while ready, with the precise cue time.
   * Runs outside React render, so it may seek, pause or set state (loops, quiz).
   */
  onFrame?: (cueSeconds: number) => void;
}

/** Display state updates (currentTime) are throttled to this interval. */
export const DISPLAY_UPDATE_INTERVAL_MS = 100;
