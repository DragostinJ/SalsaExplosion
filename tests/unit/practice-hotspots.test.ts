/**
 * Practice Hotspots Ranking & Telemetry Unit Suite
 *
 * Protects:
 * 1. Ranking order: Sections ordered strictly by total engagement (loops + replays) descending.
 * 2. Tie-breaking behavior: Preserves stable relative ordering when two sections have identical total counts.
 * 3. Graceful degradation: Filters out rows referencing nonexistent songs or removed section IDs.
 * 4. Bound enforcement: Enforces bounds on requested hotspot limits (min 1, max 50).
 */

import { describe, it, expect } from "vitest";
import {
  rankPracticeHotspots,
  type PracticeCountRow,
} from "@/lib/music/practice-hotspots";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

describe("practice-hotspots: Ranking Order & Telemetry Aggregation", () => {
  const sampleSong = TIMBA_SONG_ANATOMY_DATA[0];
  const sectionA = sampleSong.segments[0];
  const sectionB = sampleSong.segments[1];
  const sectionC = sampleSong.segments[2];

  it("ranks sections by combined loops + replays descending", () => {
    const rows: PracticeCountRow[] = [
      { songId: sampleSong.id, sectionId: sectionA.id, loops: 5, replays: 2 }, // Total: 7
      { songId: sampleSong.id, sectionId: sectionB.id, loops: 20, replays: 10 }, // Total: 30
      { songId: sampleSong.id, sectionId: sectionC.id, loops: 10, replays: 5 }, // Total: 15
    ];

    const ranked = rankPracticeHotspots(rows, 10);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].sectionId).toBe(sectionB.id);
    expect(ranked[0].loops + ranked[0].replays).toBe(30);

    expect(ranked[1].sectionId).toBe(sectionC.id);
    expect(ranked[1].loops + ranked[1].replays).toBe(15);

    expect(ranked[2].sectionId).toBe(sectionA.id);
    expect(ranked[2].loops + ranked[2].replays).toBe(7);
  });

  it("handles ties stably without reordering identical engagement totals", () => {
    // Both sections have identical total count: 12
    const rows: PracticeCountRow[] = [
      { songId: sampleSong.id, sectionId: sectionA.id, loops: 8, replays: 4 }, // 12
      { songId: sampleSong.id, sectionId: sectionB.id, loops: 6, replays: 6 }, // 12
    ];

    const ranked = rankPracticeHotspots(rows, 10);

    expect(ranked).toHaveLength(2);
    expect(ranked[0].loops + ranked[0].replays).toBe(12);
    expect(ranked[1].loops + ranked[1].replays).toBe(12);
    // Preserves input order for ties
    expect(ranked[0].sectionId).toBe(sectionA.id);
    expect(ranked[1].sectionId).toBe(sectionB.id);
  });

  it("skips rows referencing unknown songs or deleted section IDs", () => {
    const rows: PracticeCountRow[] = [
      { songId: "nonexistent-song", sectionId: "unknown-section", loops: 100, replays: 100 },
      { songId: sampleSong.id, sectionId: "removed-section-id", loops: 50, replays: 50 },
      { songId: sampleSong.id, sectionId: sectionA.id, loops: 3, replays: 2 },
    ];

    const ranked = rankPracticeHotspots(rows, 10);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].songId).toBe(sampleSong.id);
    expect(ranked[0].sectionId).toBe(sectionA.id);
    expect(ranked[0].sectionName).toBe(sectionA.sectionName);
    expect(ranked[0].startTimeSeconds).toBe(sectionA.startTimeSeconds);
  });

  it("clamps limit between minimum 1 and maximum 50", () => {
    const rows: PracticeCountRow[] = [
      { songId: sampleSong.id, sectionId: sectionA.id, loops: 10, replays: 1 },
      { songId: sampleSong.id, sectionId: sectionB.id, loops: 5, replays: 1 },
    ];

    // Request limit 0 -> clamped to 1
    const clampedMin = rankPracticeHotspots(rows, 0);
    expect(clampedMin).toHaveLength(1);

    // Request limit 1 -> returns 1
    const limitOne = rankPracticeHotspots(rows, 1);
    expect(limitOne).toHaveLength(1);
    expect(limitOne[0].sectionId).toBe(sectionA.id);
  });
});
