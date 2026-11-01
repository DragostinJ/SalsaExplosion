import { describe, it, expect } from "vitest";
import {
  parseYouTubeCandidateResponses,
  formatDuration,
  formatCandidatesMarkdownTable,
} from "@/lib/moves/youtube-candidate-parser";

describe("youtube-candidate-parser: formatDuration", () => {
  it("formats duration in seconds to m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(252)).toBe("4:12");
    expect(formatDuration(3605)).toBe("60:05");
  });
});

describe("youtube-candidate-parser: parseYouTubeCandidateResponses", () => {
  // Realistic mock fixture matching YouTube Data API v3 search.list response
  const fixtureSearchResponse = {
    items: [
      {
        id: { kind: "youtube#video", videoId: "abc123xyz89" },
        snippet: {
          title: "Dile Que No - Cuban Salsa Casino Tutorial",
          channelTitle: "Salsa Masterclass",
          description: "Learn how to lead and follow Dile Que No in Cuban Salsa.",
        },
      },
      {
        id: { kind: "youtube#video", videoId: "def456uvw01" },
        snippet: {
          title: "Guapea & Dile Que No Full Breakdown",
          channelTitle: "Havana Dance Academy",
          description: "Step-by-step Cuban salsa mechanics.",
        },
      },
    ],
  };

  // Realistic mock fixture matching YouTube Data API v3 videos.list response
  const fixtureVideosResponse = {
    items: [
      {
        id: "abc123xyz89",
        snippet: {
          title: "Dile Que No - Cuban Salsa Casino Tutorial",
          channelTitle: "Salsa Masterclass",
        },
        contentDetails: {
          duration: "PT3M45S", // 225 seconds
        },
        status: {
          embeddable: true,
          privacyStatus: "public",
        },
      },
      {
        id: "def456uvw01",
        snippet: {
          title: "Guapea & Dile Que No Full Breakdown",
          channelTitle: "Havana Dance Academy",
        },
        contentDetails: {
          duration: "PT5M10S", // 310 seconds
        },
        status: {
          embeddable: false, // Uploader disabled embedding
          privacyStatus: "public",
        },
      },
    ],
  };

  it("parses valid fixture responses into candidate video objects preserving search order", () => {
    const candidates = parseYouTubeCandidateResponses(
      fixtureSearchResponse,
      fixtureVideosResponse
    );

    expect(candidates).toHaveLength(2);

    expect(candidates[0]).toEqual({
      videoId: "abc123xyz89",
      title: "Dile Que No - Cuban Salsa Casino Tutorial",
      channelTitle: "Salsa Masterclass",
      durationSeconds: 225,
      formattedDuration: "3:45",
      embeddable: true,
      link: "https://www.youtube.com/watch?v=abc123xyz89",
    });

    expect(candidates[1]).toEqual({
      videoId: "def456uvw01",
      title: "Guapea & Dile Que No Full Breakdown",
      channelTitle: "Havana Dance Academy",
      durationSeconds: 310,
      formattedDuration: "5:10",
      embeddable: false,
      link: "https://www.youtube.com/watch?v=def456uvw01",
    });
  });

  it("handles empty search items gracefully", () => {
    const candidates = parseYouTubeCandidateResponses({ items: [] }, { items: [] });
    expect(candidates).toEqual([]);
  });

  it("throws a descriptive error when videos response payload is invalid", () => {
    expect(() =>
      parseYouTubeCandidateResponses(fixtureSearchResponse, { invalid: true })
    ).toThrow(/Failed to parse YouTube videos response/);
  });
});

describe("youtube-candidate-parser: formatCandidatesMarkdownTable", () => {
  it("formats candidate videos into a clean markdown table", () => {
    const candidates = [
      {
        videoId: "abc123xyz89",
        title: "Dile Que No Tutorial | Salsa Explosion",
        channelTitle: "Salsa Explosion",
        durationSeconds: 150,
        formattedDuration: "2:30",
        embeddable: true,
        link: "https://www.youtube.com/watch?v=abc123xyz89",
      },
    ];

    const markdown = formatCandidatesMarkdownTable("Dile Que No (dile-que-no)", candidates);

    expect(markdown).toContain("### Dile Que No (dile-que-no)");
    expect(markdown).toContain("| Title | Channel | Length | Link | Embeddable |");
    expect(markdown).toContain("Dile Que No Tutorial \\| Salsa Explosion");
    expect(markdown).toContain("2:30");
    expect(markdown).toContain("[Watch](https://www.youtube.com/watch?v=abc123xyz89)");
    expect(markdown).toContain("Yes");
  });

  it("outputs placeholder row when candidates array is empty", () => {
    const markdown = formatCandidatesMarkdownTable("Guapea (guapea)", []);
    expect(markdown).toContain("*(No embeddable candidates found)*");
  });
});
