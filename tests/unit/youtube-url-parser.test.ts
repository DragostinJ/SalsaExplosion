import { describe, it, expect } from "vitest";
import {
  parseYouTubeVideoId,
  parseTimeStringToSeconds,
} from "@/lib/moves/youtube-url-parser";

describe("youtube-url-parser", () => {
  it("extracts 11-char ID from standard watch URL", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
    expect(
      parseYouTubeVideoId("https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ")
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtu.be short URL", () => {
    expect(parseYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=42")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from shorts URL", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("extracts ID from embed URL", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("accepts bare 11-character video ID", () => {
    expect(parseYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for invalid inputs", () => {
    expect(parseYouTubeVideoId("")).toBeNull();
    expect(parseYouTubeVideoId("not-a-youtube-url")).toBeNull();
    expect(parseYouTubeVideoId("https://vimeo.com/12345678")).toBeNull();
  });

  it("parses m:ss and seconds time strings", () => {
    expect(parseTimeStringToSeconds("1:30")).toBe(90);
    expect(parseTimeStringToSeconds("0:45")).toBe(45);
    expect(parseTimeStringToSeconds("2:05")).toBe(125);
    expect(parseTimeStringToSeconds("45")).toBe(45);
    expect(parseTimeStringToSeconds("")).toBeNull();
    expect(parseTimeStringToSeconds("invalid")).toBeNull();
  });
});
