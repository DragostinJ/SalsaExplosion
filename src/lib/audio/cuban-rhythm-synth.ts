import { ClaveType } from "../constants/timba-song-anatomy";

/**
 * Returns the exact 8-count cycle beat positions for each Cuban Clave type.
 * Cycle runs from Beat 1.0 to Beat 8.0.
 */
export function getClaveStrokeBeats(claveType: ClaveType): number[] {
  switch (claveType) {
    case "2-3 Son":
      // Bar 1 (2-side): Beat 2, Beat 3
      // Bar 2 (3-side): Beat 5, Beat 6.5, Beat 8
      return [2, 3, 5, 6.5, 8];

    case "3-2 Son":
      // Bar 1 (3-side): Beat 1, Beat 2.5, Beat 4
      // Bar 2 (2-side): Beat 6, Beat 7
      return [1, 2.5, 4, 6, 7];

    case "2-3 Rumba":
      // Bar 1 (2-side): Beat 2, Beat 3
      // Bar 2 (3-side): Beat 5, Beat 6.5, Beat 8.5 (delayed 3rd stroke)
      return [2, 3, 5, 6.5, 8.5];

    case "3-2 Rumba":
      // Bar 1 (3-side): Beat 1, Beat 2.5, Beat 4.5
      // Bar 2 (2-side): Beat 6, Beat 7
      return [1, 2.5, 4.5, 6, 7];

    default:
      return [2, 3, 5, 6.5, 8];
  }
}

export interface CubanRhythmSynthOptions {
  bpm?: number;
  claveType?: ClaveType;
  volume?: number;
  onBeat?: (count: number) => void;
}

/**
 * Browser-native Web Audio API synthesizer for Cuban Clave and Metronome Cues.
 * Operates at £0/month, 100% offline, with zero external audio assets.
 */
export class CubanRhythmSynth {
  private audioCtx: AudioContext | null = null;
  private isRunning = false;
  private isMuted = false;
  private bpm: number;
  private claveType: ClaveType;
  private volume: number;
  private onBeat?: (count: number) => void;
  private timerId: number | null = null;
  private currentStep = 0; // 0 to 15 (sixteenth note subdivisions across 8 counts, or 0-7 quarter beats)

  constructor(options: CubanRhythmSynthOptions = {}) {
    this.bpm = options.bpm ?? 90;
    this.claveType = options.claveType ?? "2-3 Son";
    this.volume = options.volume ?? 0.3;
    this.onBeat = options.onBeat;
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(60, Math.min(140, newBpm));
  }

  public setClaveType(newClave: ClaveType) {
    this.claveType = newClave;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Synthesize a resonant Cuban Rosewood Clave stroke using a fast exponential decay.
   */
  private playClaveStroke(pitch = 2400) {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      // Slight pitch glide to mimic cylindrical wood resonance
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.92, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // AudioContext policy or headless environment fallback
    }
  }

  /**
   * Synthesize a subtle soft click for dancer count markers (Beat 1 accent).
   */
  private playBeatClick(isBeatOne = false) {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(isBeatOne ? 880 : 440, ctx.currentTime);

      const clickVolume = (isBeatOne ? this.volume * 0.45 : this.volume * 0.2);
      gain.gain.setValueAtTime(clickVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext policy or headless environment fallback
    }
  }

  public start() {
    if (this.isRunning) return;
    this.initAudioContext();
    this.isRunning = true;
    this.currentStep = 0;

    // We step every half-beat (eighth notes) to accurately capture 2.5, 4.5, 6.5, 8.5
    // There are 16 eighth-note steps in an 8-beat cycle.
    const intervalMs = (60 / this.bpm / 2) * 1000;

    const tick = () => {
      if (!this.isRunning) return;

      const eighthStep = this.currentStep % 16;
      // Convert step index (0-15) to dancer beat (1.0 to 8.5)
      const currentBeat = 1 + eighthStep * 0.5;

      // Check if this beat is an integer count (1, 2, 3, 4, 5, 6, 7, 8)
      if (eighthStep % 2 === 0) {
        const integerCount = 1 + eighthStep / 2;
        if (this.onBeat) {
          this.onBeat(integerCount);
        }
        // Play subtle beat click (accenting 1 and 5)
        if (integerCount === 1) {
          this.playBeatClick(true);
        }
      }

      // Check if current beat is a Clave hit
      const claveHits = getClaveStrokeBeats(this.claveType);
      if (claveHits.includes(currentBeat)) {
        this.playClaveStroke(2400);
      }

      this.currentStep++;
      if (typeof window !== "undefined") {
        this.timerId = window.setTimeout(tick, (60 / this.bpm / 2) * 1000);
      }
    };

    if (typeof window !== "undefined") {
      this.timerId = window.setTimeout(tick, intervalMs);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null && typeof window !== "undefined") {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
  }
}
