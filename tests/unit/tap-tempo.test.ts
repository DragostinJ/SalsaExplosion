import { describe, it, expect } from "vitest";
import type { SongSegment } from "@/lib/constants/timba-song-anatomy";
import {
  countAt,
  fitBeatGrid,
  nearestBeatTime,
  salsaCountAt,
  sectionStartAnchor,
  shiftAnchor,
  MIN_TAPS,
} from "@/lib/music/tap-tempo";

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

  it("counts from a fitted anchor, and moving the 1 swaps 1 and 5 or shifts a beat", () => {
    const anchor = { oneAtSeconds: 61.2, periodSeconds: 0.6 };
    expect(countAt(anchor, 61.2)).toEqual({ count: 1, beat: 0 });
    expect(countAt(anchor, 61.2 + 4 * 0.6)).toEqual({ count: 5, beat: 4 });
    expect(countAt(anchor, 61.2 + 9 * 0.6 + 0.1).count).toBe(2);
    // taps that started on a 5: shifting the 1 by 4 beats turns that 5 into a 1
    const swapped = shiftAnchor(anchor, 4);
    expect(countAt(swapped, 61.2 + 4 * 0.6).count).toBe(1);
    expect(countAt(swapped, 61.2).count).toBe(5);
    expect(countAt(shiftAnchor(anchor, -1), 61.2).count).toBe(2);
    // the beat number keeps increasing (used to re-render once per beat)
    expect(countAt(anchor, 61.2 + 20 * 0.6 + 0.01).beat).toBe(20);
  });

  it("the map count restarts on 1 at each section start, and stays blank where there's no count", () => {
    const section = (id: string, start: number, end: number, extra: Partial<SongSegment> = {}) =>
      ({ id, startTimeSeconds: start, endTimeSeconds: end, ...extra }) as SongSegment;
    const segments = [
      section("intro", 0, 8, { timingMode: "Ambient (No Beat)" }),
      section("verse", 8, 20),
      section("pickup", 20, 22, { startsOnOne: false }),
      section("coro", 22, 40),
    ];
    expect(sectionStartAnchor(segments, 100, 4)).toBeNull();
    expect(sectionStartAnchor(segments, 100, 21)).toBeNull();
    expect(sectionStartAnchor(segments, 0, 10)).toBeNull();
    expect(sectionStartAnchor(segments, 100, 10)).toEqual({ oneAtSeconds: 8, periodSeconds: 0.6 });
    const coro = sectionStartAnchor(segments, 100, 30)!;
    expect(countAt(coro, 22).count).toBe(1);
    expect(countAt(coro, 22 + 4 * 0.6).count).toBe(5);
  });

  it("an anchor from fitted taps lands on the true beats of a steady song", () => {
    const fit = fitBeatGrid(taps(102, 11.5, 32, 30))!;
    const anchor = { oneAtSeconds: fit.phaseSeconds, periodSeconds: fit.periodSeconds };
    // 8 bars later the grid's "1" is still within 25 ms of the true downbeat
    const trueOne = 11.5 + 64 * (60 / 102);
    const predictedOne = anchor.oneAtSeconds + 64 * anchor.periodSeconds;
    expect(Math.abs(predictedOne - trueOne) * 1000).toBeLessThan(25);
    expect(countAt(anchor, trueOne + 0.01).count).toBe(1);
  });
});
