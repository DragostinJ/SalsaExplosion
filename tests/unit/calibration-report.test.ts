import { describe, it, expect } from "vitest";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { applyCalibrationReport, parseCalibrationReports, type CalibrationReport } from "@/lib/music/calibration-report";

const song = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "temba-tumba-timba")!;
const third = song.segments[2];

function report(overrides: Partial<CalibrationReport> = {}): CalibrationReport {
  return {
    songId: song.id,
    videoId: song.youtubeVideoId,
    authoredDurationSeconds: song.durationSeconds,
    actualDurationSeconds: song.durationSeconds,
    changes: [{ section: third.id, sectionName: third.sectionName, from: third.startTimeSeconds, to: third.startTimeSeconds + 1.5, shift: 1.5 }],
    beatFits: [],
    marks: [],
    ...overrides,
  };
}

describe("calibration reports", () => {
  it("moves a section start and keeps the timeline continuous", () => {
    const result = applyCalibrationReport(song, report());
    expect(result.errors).toEqual([]);
    const moved = result.song.segments[2];
    expect(moved.startTimeSeconds).toBe(third.startTimeSeconds + 1.5);
    expect(result.song.segments[1].endTimeSeconds).toBe(moved.startTimeSeconds);
    expect(result.applied).toHaveLength(1);
    // the original data object is untouched
    expect(song.segments[2].startTimeSeconds).toBe(third.startTimeSeconds);
  });

  it("refuses stale reports, other songs, other videos and unknown sections", () => {
    const stale = applyCalibrationReport(song, report({ changes: [{ section: third.id, from: third.startTimeSeconds + 4, to: 99 }] }));
    expect(stale.errors.join(" ")).toContain("stale");
    expect(stale.song).toBe(song);

    expect(applyCalibrationReport(song, report({ songId: "me-dicen-cuba" })).errors.join(" ")).toContain("not");
    expect(applyCalibrationReport(song, report({ videoId: "AAAAAAAAAAA" })).errors.join(" ")).toContain("video");
    expect(applyCalibrationReport(song, report({ changes: [{ section: "nope-seg-9", from: 1, to: 2 }] })).errors.join(" ")).toContain(
      "isn't in the current map"
    );
  });

  it("rejects a move that would break the timeline", () => {
    const next = song.segments[3];
    const result = applyCalibrationReport(song, report({ changes: [{ section: third.id, from: third.startTimeSeconds, to: next.endTimeSeconds + 5 }] }));
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.song).toBe(song);
  });

  it("warns when the video length differs from the map and about stored-later beat fits", () => {
    const result = applyCalibrationReport(
      song,
      report({
        actualDurationSeconds: song.durationSeconds + 5,
        beatFits: [{ section: third.id, bpm: 104.2, phaseSeconds: 31.3, beatErrorMs: 6.1, taps: 24 }],
      })
    );
    expect(result.errors).toEqual([]);
    expect(result.warnings.join(" ")).toContain("check every boundary");
    expect(result.warnings.join(" ")).toContain("Beat fits");
  });

  it("parses one report, several pasted together, arrays and fenced JSON", () => {
    const one = JSON.stringify(report());
    expect(parseCalibrationReports(one).reports).toHaveLength(1);
    expect(parseCalibrationReports(`${one}\n\n${one}`).reports).toHaveLength(2);
    expect(parseCalibrationReports(`[${one}, ${one}]`).reports).toHaveLength(2);
    expect(parseCalibrationReports("Here:\n```json\n" + one + "\n```").reports).toHaveLength(1);
    // a section name containing braces doesn't confuse the splitter
    const tricky = JSON.stringify(report({ changes: [{ section: third.id, sectionName: "Coro {1}", from: third.startTimeSeconds, to: third.startTimeSeconds + 1 }] }));
    expect(parseCalibrationReports(tricky).reports).toHaveLength(1);
    expect(parseCalibrationReports("hello").errors[0]).toContain("No calibration report");
    expect(parseCalibrationReports('{"songId": 3}').errors[0]).toContain("Not a calibration report");
  });
});
