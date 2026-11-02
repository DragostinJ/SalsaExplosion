import { describe, it, expect } from "vitest";
import {
  parseClipTimestamp,
  parseClipBreakdownInput,
  parseClipReviewReport,
  applyClipReviewReport,
  getProClipsForMove,
  getProClipsForSong,
  type ClipBreakdown,
  type ClipReviewReport,
  type StoredProClip,
} from "@/lib/moves/pro-clips";

describe("Strict Clip Timestamp Parser", () => {
  it("parses valid M:SS, MM:SS, and H:MM:SS timestamps to exact seconds", () => {
    expect(parseClipTimestamp("1:18")).toEqual({ ok: true, seconds: 78 });
    expect(parseClipTimestamp("0:05")).toEqual({ ok: true, seconds: 5 });
    expect(parseClipTimestamp("00:42")).toEqual({ ok: true, seconds: 42 });
    expect(parseClipTimestamp("1:05.5")).toEqual({ ok: true, seconds: 65.5 });
    expect(parseClipTimestamp("1:02:15")).toEqual({ ok: true, seconds: 3735 });
    expect(parseClipTimestamp("0:00")).toEqual({ ok: true, seconds: 0 });
  });

  it("rejects timestamps missing colons, with invalid seconds, or negative values", () => {
    expect(parseClipTimestamp("118").ok).toBe(false);
    expect(parseClipTimestamp("1:78").ok).toBe(false);
    expect(parseClipTimestamp("0:60").ok).toBe(false);
    expect(parseClipTimestamp("-1:18").ok).toBe(false);
    expect(parseClipTimestamp("invalid").ok).toBe(false);
    expect(parseClipTimestamp(123 as unknown as string).ok).toBe(false);
  });
});

describe("Clip Breakdown Format & Parser (AI Studio Move Mapper)", () => {
  const validPaoloAlinaFixture: ClipBreakdown = {
    kind: "ritmoflow-clip-breakdown",
    version: 1,
    id: "paolo-alina-homenaje",
    youtubeVideoId: "Wh1zERcDWGM",
    title: "Paolo & Alina - Homenaje a la Música Cubana Live Performance",
    channelTitle: "World Latin Dance Cup",
    dancers: ["Paolo", "Alina"],
    songId: "homenaje-a-la-musica-cubana",
    analysis: {
      model: "gemini-2.5-pro",
      fps: 30,
      notes: "High fidelity tracking from front stage camera.",
    },
    rows: [
      {
        start: "0:00",
        end: "0:15",
        type: "figure",
        mechanics: "Open guapea basic step maintaining elastic hand connection on 1-2-3 and 5-6-7.",
        moveIds: ["guapea"],
        match: "same",
        confidence: "high",
        musicalMoment: "Intro piano tumbao setting the tempo.",
      },
      {
        start: "0:15",
        end: "0:30",
        type: "figure",
        mechanics: "Leader initiates Dile Que No cross-body lead with crisp circular rotation on 5-6-7.",
        moveIds: ["dile-que-no"],
        match: "same",
        confidence: "high",
      },
      {
        start: "0:30",
        end: "0:45",
        type: "figure",
        mechanics: "Leader presents follower into Exhibela turn with high left hand lead and hip accent.",
        moveIds: ["exhibela"],
        match: "variation",
        confidence: "medium",
      },
      {
        start: "0:45",
        end: "1:00",
        type: "figure",
        mechanics: "Two-hand hold entry into classic Setenta hammerlock wrap and continuous circular walk.",
        moveIds: ["setenta"],
        match: "same",
        confidence: "high",
      },
    ],
  };

  it("parses and validates a clean Paolo & Alina breakdown fixture", () => {
    const raw = JSON.stringify(validPaoloAlinaFixture);
    const result = parseClipBreakdownInput(raw);

    expect(result.ok).toBe(true);
    expect(result.clip?.id).toBe("paolo-alina-homenaje");
    expect(result.clip?.rows).toHaveLength(4);
    expect(result.errors).toBeUndefined();
  });

  it("cleanly strips ```json markdown fences returned by AI Studio", () => {
    const fenced = "```json\n" + JSON.stringify(validPaoloAlinaFixture, null, 2) + "\n```";
    const result = parseClipBreakdownInput(fenced);

    expect(result.ok).toBe(true);
    expect(result.clip?.youtubeVideoId).toBe("Wh1zERcDWGM");
  });

  it("never throws on corrupt JSON and returns helpful syntax error message", () => {
    const corrupt = "{\n  \"kind\": \"ritmoflow-clip-breakdown\",\n  INVALID_JSON...";
    const result = parseClipBreakdownInput(corrupt);

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toContain("JSON syntax error");
  });

  it("enforces start < end on every row with 1-based row identification", () => {
    const invalid = structuredClone(validPaoloAlinaFixture);
    invalid.rows[1]!.start = "0:35";
    invalid.rows[1]!.end = "0:20";

    const result = parseClipBreakdownInput(JSON.stringify(invalid));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Row 2, field "end": end time \(0:20\) must be greater than start time \(0:35\)/),
      ])
    );
  });

  it("enforces that rows are sorted chronologically without overlapping", () => {
    const overlapping = structuredClone(validPaoloAlinaFixture);
    overlapping.rows[1]!.start = "0:10"; // Row 0 ends at 0:15

    const result = parseClipBreakdownInput(JSON.stringify(overlapping));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Row 2, field "start": row start \(0:10\) overlaps with previous row end \(0:15\)/),
      ])
    );
  });

  it("allows rows to touch precisely (row N start equals row N-1 end)", () => {
    const touching = structuredClone(validPaoloAlinaFixture);
    touching.rows[0]!.start = "0:00";
    touching.rows[0]!.end = "0:15";
    touching.rows[1]!.start = "0:15";
    touching.rows[1]!.end = "0:30";

    const result = parseClipBreakdownInput(JSON.stringify(touching));
    expect(result.ok).toBe(true);
  });

  it("enforces that every moveId exists in the canonical move library and names unknown IDs", () => {
    const invalidIds = structuredClone(validPaoloAlinaFixture);
    invalidIds.rows[0]!.moveIds = ["guapea", "unknown-imaginary-move", "fake-move-id"];

    const result = parseClipBreakdownInput(JSON.stringify(invalidIds));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /Row 1, field "moveIds": unknown move ID\(s\): unknown-imaginary-move, fake-move-id/
        ),
      ])
    );
  });

  it("requires at least one moveId when match is 'same' or 'variation'", () => {
    const emptySame = structuredClone(validPaoloAlinaFixture);
    emptySame.rows[0]!.match = "same";
    emptySame.rows[0]!.moveIds = [];

    const resultSame = parseClipBreakdownInput(JSON.stringify(emptySame));
    expect(resultSame.ok).toBe(false);
    expect(resultSame.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Row 1, field "moveIds": match type "same" requires at least one moveId/),
      ])
    );

    const emptyVariation = structuredClone(validPaoloAlinaFixture);
    emptyVariation.rows[2]!.match = "variation";
    emptyVariation.rows[2]!.moveIds = [];

    const resultVar = parseClipBreakdownInput(JSON.stringify(emptyVariation));
    expect(resultVar.ok).toBe(false);
    expect(resultVar.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Row 3, field "moveIds": match type "variation" requires at least one moveId/),
      ])
    );
  });

  it("permits newMove only when match is 'not-in-library'", () => {
    const illegalNewMove = structuredClone(validPaoloAlinaFixture);
    illegalNewMove.rows[0]!.match = "same";
    illegalNewMove.rows[0]!.newMove = {
      name: "Guapea con Clave",
      category: "Casino figure",
      level: "Intermediate",
    };

    const result = parseClipBreakdownInput(JSON.stringify(illegalNewMove));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /Row 1, field "newMove": newMove can only be specified when match is "not-in-library"/
        ),
      ])
    );

    const legalNewMove = structuredClone(validPaoloAlinaFixture);
    legalNewMove.rows[0]!.match = "not-in-library";
    legalNewMove.rows[0]!.moveIds = [];
    legalNewMove.rows[0]!.newMove = {
      name: "Guapea con Clave",
      category: "Casino figure",
      level: "Intermediate",
    };

    const legalResult = parseClipBreakdownInput(JSON.stringify(legalNewMove));
    expect(legalResult.ok).toBe(true);
  });

  it("verifies songId against canonical TIMBA_SONG_ANATOMY_DATA", () => {
    const badSong = structuredClone(validPaoloAlinaFixture);
    badSong.songId = "non-existent-track";

    const result = parseClipBreakdownInput(JSON.stringify(badSong));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Field "songId": song "non-existent-track" not found in TIMBA_SONG_ANATOMY_DATA/),
      ])
    );
  });
});

describe("Pro Clip Review Application & Query Helpers", () => {
  const baseBreakdown: ClipBreakdown = {
    kind: "ritmoflow-clip-breakdown",
    version: 1,
    id: "paolo-alina-homenaje",
    youtubeVideoId: "Wh1zERcDWGM",
    title: "Paolo & Alina - Homenaje a la Música Cubana",
    channelTitle: "World Latin Dance Cup",
    dancers: ["Paolo", "Alina"],
    songId: "homenaje-a-la-musica-cubana",
    rows: [
      {
        start: "0:00",
        end: "0:15",
        type: "figure",
        mechanics: "Open guapea basic step maintaining elastic hand connection.",
        moveIds: ["guapea"],
        match: "same",
        confidence: "high",
      },
      {
        start: "0:15",
        end: "0:30",
        type: "figure",
        mechanics: "Leader initiates Dile Que No cross-body lead with crisp rotation.",
        moveIds: ["dile-que-no"],
        match: "same",
        confidence: "high",
      },
      {
        start: "0:30",
        end: "0:45",
        type: "figure",
        mechanics: "Leader presents follower into Exhibela turn with high hand lead.",
        moveIds: ["exhibela"],
        match: "variation",
        confidence: "medium",
      },
      {
        start: "0:45",
        end: "1:00",
        type: "figure",
        mechanics: "Two-hand hold entry into classic Setenta hammerlock wrap.",
        moveIds: ["setenta"],
        match: "same",
        confidence: "high",
      },
    ],
  };

  const sampleReport: ClipReviewReport = {
    kind: "ritmoflow-clip-review",
    version: 1,
    reviewedBy: "Enrique Perez Valdes",
    reviewedAt: "2026-11-02T22:00:00.000Z",
    clip: baseBreakdown,
    decisions: [
      { row: 0, decision: "confirmed", moveIds: ["guapea"] },
      { row: 1, decision: "unsure", moveIds: ["dile-que-no"], note: "Check timing on count 3" },
      { row: 2, decision: "rejected", moveIds: ["exhibela"], note: "Hand hold is non-standard" },
      { row: 3, decision: "confirmed", moveIds: ["setenta", "setenta-complicado"] },
    ],
  };

  it("parses valid clip review report and strips markdown fences", () => {
    const raw = "```json\n" + JSON.stringify(sampleReport) + "\n```";
    const res = parseClipReviewReport(raw);
    expect(res.ok).toBe(true);
    expect(res.report?.reviewedBy).toBe("Enrique Perez Valdes");
  });

  it("only confirmed rows are stored, and decisions counts are reported accurately", () => {
    const res = applyClipReviewReport({
      report: sampleReport,
      existingClips: [],
      validMoveIds: new Set(["guapea", "dile-que-no", "exhibela", "setenta", "setenta-complicado"]),
    });

    expect(res.ok).toBe(true);
    expect(res.counts).toEqual({ confirmed: 2, unsure: 1, rejected: 1 });
    expect(res.updatedClips).toHaveLength(1);

    const storedClip = res.updatedClips[0]!;
    expect(storedClip.rows).toHaveLength(2);
    expect(storedClip.rows[0]!.moveIds).toEqual(["guapea"]);
    expect(storedClip.rows[0]!.startSeconds).toBe(0);
    expect(storedClip.rows[0]!.endSeconds).toBe(15);
    expect(storedClip.rows[1]!.moveIds).toEqual(["setenta", "setenta-complicado"]);
  });

  it("the teacher's edited moveIds win over the AI's", () => {
    const editedReport = structuredClone(sampleReport);
    // AI proposed ["guapea"], teacher overrides with ["exhibela", "dile-que-no"]
    editedReport.decisions[0]!.moveIds = ["exhibela", "dile-que-no"];

    const res = applyClipReviewReport({
      report: editedReport,
      existingClips: [],
      validMoveIds: new Set(["guapea", "dile-que-no", "exhibela", "setenta", "setenta-complicado"]),
    });

    expect(res.ok).toBe(true);
    const storedRow0 = res.updatedClips[0]!.rows[0]!;
    expect(storedRow0.moveIds).toEqual(["exhibela", "dile-que-no"]);
  });

  it("unknown move ids in a review report are refused without modifying existing clips", () => {
    const badReport = structuredClone(sampleReport);
    badReport.decisions[0]!.moveIds = ["unknown-invented-figure"];

    const existing: StoredProClip[] = [
      {
        id: "existing-clip",
        youtubeVideoId: "12345678901",
        title: "Existing Clip",
        channelTitle: "Channel",
        dancers: ["Dancer A"],
        reviewedBy: "Teacher",
        reviewedAt: "2026-11-01T00:00:00Z",
        rows: [],
      },
    ];

    const res = applyClipReviewReport({
      report: badReport,
      existingClips: existing,
      validMoveIds: new Set(["guapea", "dile-que-no", "exhibela", "setenta"]),
    });

    expect(res.ok).toBe(false);
    expect(res.errors[0]).toContain('unknown move ID(s) in report decision: unknown-invented-figure');
    expect(res.updatedClips).toEqual(existing);
  });

  it("idempotently replaces an existing clip sharing the same clip id", () => {
    const firstApply = applyClipReviewReport({
      report: sampleReport,
      existingClips: [],
      validMoveIds: new Set(["guapea", "dile-que-no", "exhibela", "setenta", "setenta-complicado"]),
    });
    expect(firstApply.updatedClips).toHaveLength(1);

    const reReport = structuredClone(sampleReport);
    reReport.reviewedAt = "2026-11-02T23:30:00.000Z";
    reReport.decisions[0]!.note = "Updated teacher note on guapea";

    const secondApply = applyClipReviewReport({
      report: reReport,
      existingClips: firstApply.updatedClips,
      validMoveIds: new Set(["guapea", "dile-que-no", "exhibela", "setenta", "setenta-complicado"]),
    });

    expect(secondApply.updatedClips).toHaveLength(1);
    expect(secondApply.updatedClips[0]!.reviewedAt).toBe("2026-11-02T23:30:00.000Z");
    expect(secondApply.updatedClips[0]!.rows[0]!.note).toBe("Updated teacher note on guapea");
  });

  it("query helpers filter and sort matching rows chronologically by start time", () => {
    const mockClips: StoredProClip[] = [
      {
        id: "clip-b",
        youtubeVideoId: "Wh1zERcDWGM",
        title: "Paolo & Alina Clip",
        channelTitle: "WLDC",
        dancers: ["Paolo", "Alina"],
        songId: "homenaje-a-la-musica-cubana",
        reviewedBy: "Enrique",
        reviewedAt: "2026-11-02T00:00:00Z",
        rows: [
          {
            startSeconds: 45,
            endSeconds: 60,
            type: "figure",
            moveIds: ["setenta"],
            mechanics: "Setenta hammerlock",
          },
          {
            startSeconds: 5,
            endSeconds: 20,
            type: "figure",
            moveIds: ["guapea"],
            mechanics: "Guapea basic step",
          },
        ],
      },
      {
        id: "clip-a",
        youtubeVideoId: "abcdefghijk",
        title: "Other Social Clip",
        channelTitle: "Social Dance TV",
        dancers: ["Yoandi", "Diana"],
        songId: "otra-cancion",
        reviewedBy: "Justyna",
        reviewedAt: "2026-11-02T00:00:00Z",
        rows: [
          {
            startSeconds: 30,
            endSeconds: 45,
            type: "figure",
            moveIds: ["guapea"],
            mechanics: "Guapea variation",
          },
          {
            startSeconds: 10,
            endSeconds: 25,
            type: "figure",
            moveIds: ["guapea"],
            mechanics: "Guapea intro",
          },
        ],
      },
    ];

    // Query for move "guapea": both clips have guapea rows
    const guapeaClips = getProClipsForMove("guapea", mockClips);
    expect(guapeaClips).toHaveLength(2);

    // Rows must be ordered by startSeconds
    expect(guapeaClips[0]!.matchingRows).toHaveLength(1);
    expect(guapeaClips[0]!.matchingRows[0]!.startSeconds).toBe(5);

    expect(guapeaClips[1]!.matchingRows).toHaveLength(2);
    expect(guapeaClips[1]!.matchingRows[0]!.startSeconds).toBe(10);
    expect(guapeaClips[1]!.matchingRows[1]!.startSeconds).toBe(30);

    // Query for move "setenta": only clip-b matches
    const setentaClips = getProClipsForMove("setenta", mockClips);
    expect(setentaClips).toHaveLength(1);
    expect(setentaClips[0]!.id).toBe("clip-b");

    // Query for non-existent move
    expect(getProClipsForMove("non-existent-move", mockClips)).toEqual([]);

    // Query for song
    const songClips = getProClipsForSong("homenaje-a-la-musica-cubana", mockClips);
    expect(songClips).toHaveLength(1);
    expect(songClips[0]!.id).toBe("clip-b");
    expect(songClips[0]!.matchingRows[0]!.startSeconds).toBe(5); // sorted 5s < 45s
    expect(songClips[0]!.matchingRows[1]!.startSeconds).toBe(45);
  });
});
