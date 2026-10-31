import { describe, it, expect } from "vitest";
import {
  availabilityFromOembedStatus,
  describeVideoProblem,
  parseIsoDurationSeconds,
  type SongVideoCheck,
} from "@/lib/music/video-health";

const base: SongVideoCheck = {
  songId: "x",
  title: "X",
  videoId: "abcdefghijk",
  availability: "ok",
  authoredSeconds: 300,
  actualSeconds: null,
};

describe("weekly song video check", () => {
  it("parses YouTube ISO 8601 durations", () => {
    expect(parseIsoDurationSeconds("PT5M43S")).toBe(343);
    expect(parseIsoDurationSeconds("PT1H2M3S")).toBe(3723);
    expect(parseIsoDurationSeconds("PT45S")).toBe(45);
    expect(parseIsoDurationSeconds("PT4M")).toBe(240);
    expect(parseIsoDurationSeconds("P0D")).toBe(0);
    expect(parseIsoDurationSeconds("PT")).toBeNull();
    expect(parseIsoDurationSeconds("5:43")).toBeNull();
  });

  it("maps oEmbed status codes", () => {
    expect(availabilityFromOembedStatus(200)).toBe("ok");
    expect(availabilityFromOembedStatus(401)).toBe("not-embeddable");
    expect(availabilityFromOembedStatus(404)).toBe("unavailable");
    expect(availabilityFromOembedStatus(0)).toBe("unknown");
  });

  it("flags removed, blocked or re-cut videos only", () => {
    expect(describeVideoProblem(base)).toBeNull();
    expect(describeVideoProblem({ ...base, actualSeconds: 301.5 })).toBeNull();
    expect(describeVideoProblem({ ...base, actualSeconds: 310 })).toContain("10.0s longer");
    expect(describeVideoProblem({ ...base, availability: "unavailable" })).toContain("removed");
    expect(describeVideoProblem({ ...base, availability: "not-embeddable" })).toContain("embedding disabled");
  });
});
