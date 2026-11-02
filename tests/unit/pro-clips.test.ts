import { describe, it, expect } from "vitest";
import {
  parseClipTimestamp,
  parseClipBreakdownInput,
  type ClipBreakdown,
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
