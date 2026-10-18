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

/**
 * Generates and triggers browser download of an .ics file for Apple Calendar, Outlook, and mobile devices
 */
export function downloadIcsFile(event: CalendarEventDetails) {
  const startIso = formatDateToIcs(event.startDate);
  const endIso = formatDateToIcs(event.endDate);
  const nowIso = formatDateToIcs(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Salsa Explosion UK//RitmoFlow//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@salsaexplosion.co.uk`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Salsa Explosion Cuban Dance Session",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute(
    "download",
    `${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`
  );
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
