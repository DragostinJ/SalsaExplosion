import { describe, it, expect } from "vitest";
import { SongStyleSchema, TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { buildArgusPrompt, parseSongMapInput, toSongDataEntry } from "@/lib/music/song-map-import";
import { displaySongTitle, isTimba, SONG_STYLE_HINTS } from "@/lib/music/song-style";
import { normalizeRuedaCall } from "@/lib/music/rueda-calls";

const existing = TIMBA_SONG_ANATOMY_DATA.find((s) => s.id === "me-dicen-cuba")!;
const freshSong = {
  ...existing,
  id: "test-new-song",
  title: "Test Song (Official Video)",
  youtubeVideoId: "TestVideo01",
  youtubeUrl: "https://www.youtube.com/watch?v=TestVideo01",
};

describe("Argus song map import", () => {
  it("accepts a valid song, including JSON wrapped in a markdown fence", () => {
    const result = parseSongMapInput("Here you go:\n```json\n" + JSON.stringify(freshSong) + "\n```");
    expect(result.errors).toEqual([]);
    expect(result.song?.id).toBe("test-new-song");
  });

  it("accepts { song: {...} } and arrays (first song, with a warning)", () => {
    expect(parseSongMapInput(JSON.stringify({ song: freshSong })).song?.id).toBe("test-new-song");
    const fromArray = parseSongMapInput(JSON.stringify([freshSong, freshSong]));
    expect(fromArray.song?.id).toBe("test-new-song");
    expect(fromArray.warnings.join(" ")).toContain("only the first");
  });

  it("reports invalid JSON and schema errors with field paths", () => {
    expect(parseSongMapInput("{ nope").errors[0]).toContain("Not valid JSON");
    const badGear = {
      ...freshSong,
      segments: [{ ...freshSong.segments[0], danceGear: "Hip Hop" }, ...freshSong.segments.slice(1)],
    };
    const result = parseSongMapInput(JSON.stringify(badGear));
    expect(result.song).toBeNull();
    expect(result.errors.join(" ")).toContain("segments.0.danceGear");
  });

  it("rejects timelines with gaps or a wrong final end", () => {
    const gappy = {
      ...freshSong,
      segments: freshSong.segments.map((segment, index) =>
        index === 1 ? { ...segment, startTimeSeconds: segment.startTimeSeconds + 3 } : segment
      ),
    };
    const result = parseSongMapInput(JSON.stringify(gappy));
    expect(result.song).toBeNull();
    expect(result.errors.join(" ")).toContain("gap between");

    const wrongEnd = { ...freshSong, durationSeconds: freshSong.durationSeconds + 10 };
    expect(parseSongMapInput(JSON.stringify(wrongEnd)).errors.join(" ")).toContain("last section ends");
  });

  it("rejects duplicate section ids", () => {
    const dup = {
      ...freshSong,
      segments: freshSong.segments.map((segment, index) => (index === 1 ? { ...segment, id: freshSong.segments[0].id } : segment)),
    };
    expect(parseSongMapInput(JSON.stringify(dup)).errors.join(" ")).toContain("Duplicate section ids");
  });

  it("warns about replacing an existing song, unknown moves and fixes formattedRange", () => {
    const tweaked = {
      ...existing,
      segments: existing.segments.map((segment, index) =>
        index === 0 ? { ...segment, formattedRange: "wrong", recommendedMoveSlugs: ["not-a-move"] } : segment
      ),
    };
    const result = parseSongMapInput(JSON.stringify(tweaked));
    const warnings = result.warnings.join(" ");
    expect(warnings).toContain("already exists");
    expect(warnings).toContain("not-a-move");
    expect(warnings).toContain("formattedRange");
    expect(result.song?.segments[0].formattedRange).toBe("0:00 - 0:18");
  });

  it("produces a data entry that round-trips through the importer", () => {
    const entry = toSongDataEntry(freshSong);
    expect(entry).toContain("timings from Argus");
    const json = entry.slice(entry.indexOf("{"), entry.lastIndexOf("}") + 1);
    expect(parseSongMapInput(json).song?.id).toBe("test-new-song");
  });

  it("gives Argus every allowed gear, timing mode and move id", () => {
    const prompt = buildArgusPrompt();
    expect(prompt).toContain('"Casino (Flow)"');
    expect(prompt).toContain('"Contratiempo (On2)"');
    expect(prompt).toContain("beg-solo-1");
    expect(prompt).toContain("no gaps, no overlaps");
    expect(prompt).toContain('"Puerto Rican Salsa"');
  });

  it("requires a style and warns about despelote outside timba", () => {
    const noStyle: Record<string, unknown> = { ...freshSong };
    delete noStyle.style;
    expect(parseSongMapInput(JSON.stringify(noStyle)).errors.join(" ")).toContain("style");

    const salsa = { ...freshSong, style: "Puerto Rican Salsa" };
    const withDespelote = {
      ...salsa,
      segments: salsa.segments.map((segment, index) =>
        index === 1 ? { ...segment, danceGear: "Despelote / Reparto" } : segment
      ),
    };
    expect(parseSongMapInput(JSON.stringify(withDespelote)).warnings.join(" ")).toContain("despelote belongs to timba");
    expect(parseSongMapInput(JSON.stringify(salsa)).warnings.join(" ")).not.toContain("despelote");
  });
});

describe("song style", () => {
  it("only timba songs use the despelote gear", () => {
    for (const song of TIMBA_SONG_ANATOMY_DATA) {
      if (isTimba(song.style)) continue;
      const despelote = song.segments.filter((segment) => segment.danceGear === "Despelote / Reparto");
      expect(despelote.map((segment) => segment.id), song.id).toEqual([]);
    }
  });

  it("has a dancer hint for every style", () => {
    for (const style of SongStyleSchema.options) {
      expect(SONG_STYLE_HINTS[style].length, style).toBeGreaterThan(20);
    }
  });

  it("strips YouTube upload tags from titles", () => {
    expect(displaySongTitle("Me Dicen Cuba (Official Video)")).toBe("Me Dicen Cuba");
    expect(displaySongTitle("Toda Una Vida (Video Oficial)")).toBe("Toda Una Vida");
    expect(displaySongTitle("Tremenda Pinta (Studio Video)")).toBe("Tremenda Pinta");
    expect(displaySongTitle("537 C.U.B.A.")).toBe("537 C.U.B.A.");
  });
});

describe("song maker output guards", () => {
  it("rejects a new song on a video another song already uses (copied from an earlier chat)", () => {
    const copied = { ...freshSong, youtubeVideoId: existing.youtubeVideoId };
    const result = parseSongMapInput(JSON.stringify(copied));
    expect(result.song).toBeNull();
    expect(result.errors.join(" ")).toContain(`already used by "${existing.id}"`);
    // Re-importing the same song on its own video is fine
    expect(parseSongMapInput(JSON.stringify(existing)).errors).toEqual([]);
  });

  it("keeps real rueda calls and drops adjectives and 'none'", () => {
    expect(normalizeRuedaCall("Dedo")).toBe("Dedo");
    expect(normalizeRuedaCall("Dedo (Index finger pointing straight up)")).toBe("Dedo (Index finger pointing straight up)");
    expect(normalizeRuedaCall("vacilala")).toBe("vacilala");
    expect(normalizeRuedaCall("Enchufla Doble")).toBe("Enchufla Doble");
    for (const junk of ["relaxed", "dramatic", "none", "", undefined, "Dedos everywhere"]) {
      expect(normalizeRuedaCall(junk), String(junk)).toBeUndefined();
    }
    const withJunk = {
      ...freshSong,
      segments: freshSong.segments.map((segment, index) => ({ ...segment, handGesture: index === 0 ? "dramatic" : "Setenta" })),
    };
    const result = parseSongMapInput(JSON.stringify(withJunk));
    expect(result.warnings.join(" ")).toContain('"dramatic" isn\'t a rueda call');
    expect(result.song?.segments[0].handGesture).toBeUndefined();
    expect(result.song?.segments[1].handGesture).toBe("Setenta");
  });

  it("flags bar counts that don't fit the section length", () => {
    const segment = freshSong.segments[1];
    const expected = ((segment.endTimeSeconds - segment.startTimeSeconds) * freshSong.bpm) / 240;
    const withBars = (bars: number) => ({
      ...freshSong,
      segments: freshSong.segments.map((s, index) => (index === 1 ? { ...s, bars } : s)),
    });
    expect(parseSongMapInput(JSON.stringify(withBars(Math.round(expected)))).warnings.join(" ")).not.toContain("bars but");
    expect(parseSongMapInput(JSON.stringify(withBars(Math.round(expected) + 4))).warnings.join(" ")).toContain("bars but");
  });
});
