export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

function formatDateToIcs(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event";
}

/**
 * RFC 5545 §3.3.11: in TEXT values a backslash, semicolon and comma are escaped and a
 * line break becomes "\n". The backslash goes first so the escapes added later stay single.
 * Without this, "104 Commercial Rd, BH2 5LR" is read as a list by strict calendar apps.
 */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * RFC 5545 §3.1: content lines longer than 75 octets are folded with CRLF and one space.
 * Counts UTF-8 bytes and never splits a character (an "é" or an emoji in a class title).
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  let limit = 75;

  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (currentBytes + bytes > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
      // A continuation line starts with the folding space, which counts towards its 75.
      limit = 74;
    }
    current += char;
    currentBytes += bytes;
  }
  parts.push(current);

  return parts.join("\r\n ");
}

/**
 * The .ics text for one event. The UID comes from the start time and title, so adding
 * the same class twice updates the calendar entry instead of creating a duplicate.
 */
export function buildIcsContent(event: CalendarEventDetails, now: Date = new Date()): string {
  const startIso = formatDateToIcs(event.startDate);
  const endIso = formatDateToIcs(event.endDate);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Salsa Explosion UK//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${startIso}-${slugify(event.title)}@salsaexplosion.co.uk`,
    `DTSTAMP:${formatDateToIcs(now)}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Salsa Explosion Cuban Dance Session",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldIcsLine)
    .join("\r\n");
}

/**
 * Generates and triggers browser download of an .ics file for Apple Calendar, Outlook, and mobile devices
 */
export function downloadIcsFile(event: CalendarEventDetails) {
  const icsContent = buildIcsContent(event);

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", `${slugify(event.title)}.ics`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * Builds direct Google Calendar web event creation link
 */
export function getGoogleCalendarUrl(event: CalendarEventDetails): string {
  const startIso = formatDateToIcs(event.startDate);
  const endIso = formatDateToIcs(event.endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
