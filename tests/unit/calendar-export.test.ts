/**
 * Calendar Export (iCalendar / Google Calendar) Unit Suite
 *
 * Protects:
 * 1. Valid iCalendar RFC 5545 structure: VCALENDAR/VEVENT headers, CRLF line endings, alarms.
 * 2. Proper UTC timestamps with 'Z' suffix across UK daylight saving clock changes.
 * 3. Text formatting: Multiline descriptions correctly serialized with escaped newlines.
 * 4. Google Calendar event creation URL generation with URL-encoded parameters.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildIcsContent,
  downloadIcsFile,
  escapeIcsText,
  foldIcsLine,
  getGoogleCalendarUrl,
  type CalendarEventDetails,
} from "@/lib/calendar-export";
import { studioTimeToUtc } from "@/lib/schedule/weekly-sessions";

describe("calendar-export: iCalendar (.ics) Generation", () => {
  let capturedIcs = "";
  let downloadedFileName = "";

  const mockAnchor = {
    href: "",
    setAttribute: vi.fn((name: string, value: string) => {
      if (name === "download") downloadedFileName = value;
    }),
    click: vi.fn(),
  };

  beforeEach(() => {
    capturedIcs = "";
    downloadedFileName = "";
    vi.clearAllMocks();

    const OriginalBlob = globalThis.Blob;
    class MockBlob extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        if (parts && typeof parts[0] === "string") {
          capturedIcs = parts[0];
        }
      }
    }
    vi.stubGlobal("Blob", MockBlob);

    globalThis.window = {
      URL: {
        createObjectURL: vi.fn().mockReturnValue("blob:mock-calendar-url"),
        revokeObjectURL: vi.fn(),
      },
    } as never;

    globalThis.document = {
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as never;
  });

  it("generates valid iCalendar lines conforming to VCALENDAR / VEVENT specification with CRLF endings", () => {
    const event: CalendarEventDetails = {
      title: "Cuban Salsa Beginners Foundation",
      description: "First session of Cuban Salsa Level 0 at BOH Studios.",
      location: "BOH Studios Bournemouth, 104 Commercial Rd, BH2 5LR",
      startDate: new Date("2026-11-05T19:00:00.000Z"),
      endDate: new Date("2026-11-05T20:15:00.000Z"),
    };

    downloadIcsFile(event);

    expect(capturedIcs).toBeDefined();
    expect(capturedIcs.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(capturedIcs.endsWith("\r\nEND:VCALENDAR")).toBe(true);

    const lines = capturedIcs.split("\r\n");
    expect(lines).toContain("VERSION:2.0");
    expect(lines).toContain("PRODID:-//Salsa Explosion UK//EN");
    expect(lines).toContain("CALSCALE:GREGORIAN");
    expect(lines).toContain("METHOD:PUBLISH");
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("SUMMARY:Cuban Salsa Beginners Foundation");
    // RFC 5545 §3.3.11: commas in TEXT values are escaped
    expect(lines).toContain("LOCATION:BOH Studios Bournemouth\\, 104 Commercial Rd\\, BH2 5LR");
    expect(lines).toContain("BEGIN:VALARM");
    expect(lines).toContain("TRIGGER:-PT2H");
    expect(lines).toContain("ACTION:DISPLAY");
    expect(lines).toContain("END:VALARM");
    expect(lines).toContain("END:VEVENT");

    // Filename sanitized
    expect(downloadedFileName).toBe("cuban-salsa-beginners-foundation.ics");
  });

  it("formats timestamps strictly in UTC with 'Z' suffix across UK clock changes", () => {
    // 1. Winter GMT (UTC+0): Thursday 5 November 2026 at 19:00 London is 19:00Z
    const winterClass = {
      title: "Winter Class",
      description: "Winter timing",
      location: "BOH Studios",
      startDate: studioTimeToUtc(2026, 11, 5, "19:00"),
      endDate: studioTimeToUtc(2026, 11, 5, "20:15"),
    };
    downloadIcsFile(winterClass);
    expect(capturedIcs).toContain("DTSTART:20261105T190000Z");
    expect(capturedIcs).toContain("DTEND:20261105T201500Z");

    // 2. Spring clock change day: Sunday 28 March 2027
    // Clocks jump forward at 01:00 UTC. An evening masterclass at 18:30 BST is 17:30 UTC
    const springClockChangeClass = {
      title: "Spring Clock Change Masterclass",
      description: "Clock change timing",
      location: "BOH Studios",
      startDate: studioTimeToUtc(2027, 3, 28, "18:30"),
      endDate: studioTimeToUtc(2027, 3, 28, "19:30"),
    };
    downloadIcsFile(springClockChangeClass);
    expect(capturedIcs).toContain("DTSTART:20270328T173000Z");
    expect(capturedIcs).toContain("DTEND:20270328T183000Z");

    // 3. Peak British Summer Time (UTC+1): Thursday 1 July 2027
    // 19:00 BST is 18:00 UTC
    const summerClass = {
      title: "Summer Class",
      description: "Summer timing",
      location: "BOH Studios",
      startDate: studioTimeToUtc(2027, 7, 1, "19:00"),
      endDate: studioTimeToUtc(2027, 7, 1, "20:15"),
    };
    downloadIcsFile(summerClass);
    expect(capturedIcs).toContain("DTSTART:20270701T180000Z");
    expect(capturedIcs).toContain("DTEND:20270701T191500Z");
  });

  it("escapes newlines in description field", () => {
    const event: CalendarEventDetails = {
      title: "Cuban Salsa & Rueda",
      description: "Line 1: Warmup & Pasitos\nLine 2: Rueda de Casino calls\nLine 3: Social dancing",
      location: "BOH Studios Bournemouth",
      startDate: new Date("2026-11-05T19:00:00.000Z"),
      endDate: new Date("2026-11-05T21:30:00.000Z"),
    };

    downloadIcsFile(event);

    // The line is over 75 octets, so it is folded (RFC 5545 §3.1); unfold before checking
    expect(capturedIcs.replace(/\r\n /g, "")).toContain(
      "DESCRIPTION:Line 1: Warmup & Pasitos\\nLine 2: Rueda de Casino calls\\nLine 3: Social dancing"
    );
  });
});

describe("calendar-export: Google Calendar URL Builder", () => {
  it("builds a valid Google Calendar web template link with properly formatted UTC dates", () => {
    const event: CalendarEventDetails = {
      title: "Sunday Masterclass & Social",
      description: "Join Maestro Enrique at BOH Studios.",
      location: "BOH Studios Bournemouth",
      startDate: new Date("2026-11-08T18:30:00.000Z"),
      endDate: new Date("2026-11-08T22:00:00.000Z"),
    };

    const url = getGoogleCalendarUrl(event);
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);

    const parsed = new URL(url);
    expect(parsed.searchParams.get("action")).toBe("TEMPLATE");
    expect(parsed.searchParams.get("text")).toBe("Sunday Masterclass & Social");
    expect(parsed.searchParams.get("dates")).toBe("20261108T183000Z/20261108T220000Z");
    expect(parsed.searchParams.get("details")).toBe("Join Maestro Enrique at BOH Studios.");
    expect(parsed.searchParams.get("location")).toBe("BOH Studios Bournemouth");
  });
});

describe("calendar-export: RFC 5545 text rules", () => {
  const unfold = (ics: string) => ics.replace(/\r\n /g, "");

  it("escapes backslash first, then semicolons, commas and line breaks", () => {
    expect(escapeIcsText("Salsa, Rueda; Son")).toBe("Salsa\\, Rueda\\; Son");
    expect(escapeIcsText("a\\b")).toBe("a\\\\b");
    // A backslash already in the text is doubled; the one added for the comma is not
    expect(escapeIcsText("\\,")).toBe("\\\\\\,");
    expect(escapeIcsText("one\r\ntwo\nthree\rfour")).toBe("one\\ntwo\\nthree\\nfour");
  });

  it("escapes SUMMARY, DESCRIPTION and LOCATION in the file", () => {
    const ics = unfold(
      buildIcsContent({
        title: "Salsa, Rueda & Son",
        description: "Bring water; wear soft shoes",
        location: "BOH Studios, 104 Commercial Rd",
        startDate: new Date("2026-11-05T19:00:00.000Z"),
        endDate: new Date("2026-11-05T20:15:00.000Z"),
      })
    );
    const lines = ics.split("\r\n");
    expect(lines).toContain("SUMMARY:Salsa\\, Rueda & Son");
    expect(lines).toContain("DESCRIPTION:Bring water\\; wear soft shoes");
    expect(lines).toContain("LOCATION:BOH Studios\\, 104 Commercial Rd");
  });

  it("folds lines over 75 octets without splitting a multi-byte character", () => {
    const encoder = new TextEncoder();
    const long = "DESCRIPTION:" + "Clase de casino en Bournemouth con Enrique y Moé. ".repeat(4);
    const folded = foldIcsLine(long);
    const physical = folded.split("\r\n");

    expect(physical.length).toBeGreaterThan(1);
    for (const line of physical) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
    physical.slice(1).forEach((line) => expect(line.startsWith(" ")).toBe(true));
    expect(folded.replace(/\r\n /g, "")).toBe(long);
    expect(foldIcsLine("SUMMARY:Short")).toBe("SUMMARY:Short");

    // "é" is 2 bytes: at byte 75 it would straddle the limit, so it moves whole to the next line
    expect(foldIcsLine("X".repeat(74) + "é")).toBe("X".repeat(74) + "\r\n é");
    // Exactly 75 octets stays on one line
    expect(foldIcsLine("X".repeat(75))).toBe("X".repeat(75));
  });

  it("keeps the same UID for the same class, so adding it twice does not duplicate it", () => {
    const event: CalendarEventDetails = {
      title: "Thursday Improvers",
      description: "Casino",
      location: "BOH Studios",
      startDate: new Date("2026-11-05T19:00:00.000Z"),
      endDate: new Date("2026-11-05T20:15:00.000Z"),
    };
    const uid = (ics: string) => ics.split("\r\n").find((l) => l.startsWith("UID:"));

    const first = uid(buildIcsContent(event, new Date("2026-11-01T10:00:00.000Z")));
    const second = uid(buildIcsContent(event, new Date("2026-11-03T18:00:00.000Z")));
    const nextWeek = uid(
      buildIcsContent({
        ...event,
        startDate: new Date("2026-11-12T19:00:00.000Z"),
        endDate: new Date("2026-11-12T20:15:00.000Z"),
      })
    );

    expect(first).toBe("UID:20261105T190000Z-thursday-improvers@salsaexplosion.co.uk");
    expect(second).toBe(first);
    expect(nextWeek).not.toBe(first);
  });
});
