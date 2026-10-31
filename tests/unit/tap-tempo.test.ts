import { describe, it, expect } from "vitest";
import { fitBeatGrid, nearestBeatTime, salsaCountAt, MIN_TAPS } from "@/lib/music/tap-tempo";

/** Deterministic pseudo-random noise in [-1, 1] */
function noise(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return (state / 2147483648) * 2 - 1;
  };
}

function taps(bpm: number, start: number, count: number, jitterMs: number, seed = 7): number[] {
  const period = 60 / bpm;
  const rand = noise(seed);
  return Array.from({ length: count }, (_, i) => start + i * period + (rand() * jitterMs) / 1000);
}

describe("tap tempo fitting", () => {
  it("recovers BPM and phase from 32 human-noisy taps (±40 ms) to a few ms", () => {
    const fit = fitBeatGrid(taps(104, 61.2, 32, 40))!;
    expect(fit.bpm).toBeCloseTo(104, 0);
    expect(Math.abs(fit.phaseSeconds - 61.2) * 1000).toBeLessThan(25);
    expect(fit.beatErrorMs).toBeLessThan(10);
    expect(fit.tapsUsed).toBe(32);
  });

  it("predicts beats far better than any single tap", () => {
    const fit = fitBeatGrid(taps(96, 10, 32, 40, 3))!;
    const period = 60 / 96;
    const worstGridError = Math.max(
      ...Array.from({ length: 32 }, (_, i) => Math.abs(fit.phaseSeconds + i * fit.periodSeconds - (10 + i * period)))
    );
    expect(worstGridError * 1000).toBeLessThan(25);
  });

  it("copes with missed beats and drops a clear mis-tap", () => {
    const clean = taps(100, 5, 24, 10);
    const withGaps = clean.filter((_, i) => i !== 5 && i !== 12); // two missed beats
    withGaps.push(clean[18] + 0.27); // a stray tap ~0.45 beat late
    const fit = fitBeatGrid(withGaps)!;
    expect(fit.bpm).toBeCloseTo(100, 0);
    expect(fit.tapsDropped).toBe(1);
  });

  it("refuses to guess from too few taps or out-of-range tempos", () => {
    expect(fitBeatGrid(taps(104, 0, MIN_TAPS - 1, 0))).toBeNull();
    expect(fitBeatGrid(taps(30, 0, 16, 0))).toBeNull();
    expect(fitBeatGrid([])).toBeNull();
  });

  it("counts 1-8 from a section that starts on 1, and snaps to the nearest beat", () => {
    const period = 0.6;
    expect(salsaCountAt(20, 20, period)).toBe(1);
    expect(salsaCountAt(20 + 0.59, 20, period)).toBe(1);
    expect(salsaCountAt(20 + 0.6, 20, period)).toBe(2);
    expect(salsaCountAt(20 + 7 * 0.6, 20, period)).toBe(8);
    expect(salsaCountAt(20 + 8 * 0.6, 20, period)).toBe(1);
    expect(salsaCountAt(19.5, 20, period)).toBe(8); // just before the section
    expect(nearestBeatTime({ periodSeconds: 0.6, phaseSeconds: 10 }, 13.1)).toBeCloseTo(13.0, 6);
  });
});
