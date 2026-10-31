/**
 * Tap-along beat fitting (groundwork for a beat-accurate count).
 *
 * One tap is ~30-50 ms off, too much for a visual pulse. Fitting a straight
 * line through many taps (time = phase + beatIndex x period, least squares)
 * averages that error down to roughly tapError / sqrt(taps). Missed beats are
 * handled by numbering taps from the median interval, and clear mis-taps are
 * dropped before the final fit.
 */

export const MIN_TAPS = 8;

export interface BeatFit {
  /** Seconds per beat */
  periodSeconds: number;
  bpm: number;
  /** Media time of the first fitted beat (beat index 0) */
  phaseSeconds: number;
  /** Root-mean-square distance of the taps from the fitted grid */
  rmsErrorMs: number;
  /** Standard error of the beat times predicted inside the tapped span */
  beatErrorMs: number;
  tapsUsed: number;
  tapsDropped: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function leastSquares(points: { x: number; y: number }[]) {
  const n = points.length;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
  const sxx = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  const sxy = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const residuals = points.map((p) => p.y - (intercept + slope * p.x));
  const ssr = residuals.reduce((sum, r) => sum + r * r, 0);
  return { slope, intercept, residuals, ssr, n, sxx };
}

/** Fit a steady beat grid to tap times (seconds, media clock). Null when there's too little to fit. */
export function fitBeatGrid(tapTimes: readonly number[]): BeatFit | null {
  const taps = [...tapTimes].filter(Number.isFinite).sort((a, b) => a - b);
  if (taps.length < MIN_TAPS) return null;

  const intervals = taps.slice(1).map((t, i) => t - taps[i]).filter((d) => d > 0.15);
  if (intervals.length < MIN_TAPS - 1) return null;
  const roughPeriod = median(intervals);
  // Musical tempo range for salsa/timba (and double/half-time taps): 60-240 BPM
  if (roughPeriod < 0.25 || roughPeriod > 1) return null;

  const numbered = taps.map((t) => ({ x: Math.round((t - taps[0]) / roughPeriod), y: t }));
  let fit = leastSquares(numbered);

  // Drop clear mis-taps (further than a quarter beat from the grid) and refit once
  const kept = numbered.filter((_, i) => Math.abs(fit.residuals[i]) <= fit.slope / 4);
  if (kept.length >= MIN_TAPS && kept.length < numbered.length) fit = leastSquares(kept);
  if (fit.n < MIN_TAPS || !(fit.slope > 0)) return null;

  const variance = fit.ssr / Math.max(1, fit.n - 2);
  // SE of a prediction at the centre of the tapped span (the most reliable point)
  const beatError = Math.sqrt(variance / fit.n);
  return {
    periodSeconds: fit.slope,
    bpm: 60 / fit.slope,
    phaseSeconds: fit.intercept,
    rmsErrorMs: Math.sqrt(fit.ssr / fit.n) * 1000,
    beatErrorMs: beatError * 1000,
    tapsUsed: fit.n,
    tapsDropped: numbered.length - fit.n,
  };
}

/** Salsa count (1-8) at a media time, counting from a section that starts on "1". */
export function salsaCountAt(timeSeconds: number, sectionStartSeconds: number, periodSeconds: number): number {
  const beats = Math.floor((timeSeconds - sectionStartSeconds) / periodSeconds + 1e-9);
  return (((beats % 8) + 8) % 8) + 1;
}

/** Nearest beat of a fit to a time, e.g. to snap a section start to the downbeat the taps found. */
export function nearestBeatTime(fit: Pick<BeatFit, "periodSeconds" | "phaseSeconds">, timeSeconds: number): number {
  const index = Math.round((timeSeconds - fit.phaseSeconds) / fit.periodSeconds);
  return fit.phaseSeconds + index * fit.periodSeconds;
}
