import { NextResponse } from "next/server";
import {
  ACADEMY_METRICS,
  VENUE_INFO,
  WEEKLY_SCHEDULE,
  PASS_PRICING_LIST,
  UPCOMING_EVENTS,
  ACADEMY_FAQS,
} from "@/lib/academy-data";
import { INSTRUCTORS } from "@/lib/data/instructors";

export async function GET() {
  const thursdayLines = WEEKLY_SCHEDULE.thursday.sessions
    .map(
      (s) =>
        `- **${s.time}** — ${s.title} (${s.level} • ${s.badge}) — Directed by ${s.instructor}`
    )
    .join("\n");

  const sundayLines = WEEKLY_SCHEDULE.sunday.sessions
    .map(
      (s) =>
        `- **${s.time}** — ${s.title} (${s.level} • ${s.badge}) — Directed by ${s.instructor}`
    )
    .join("\n");

  const pricingLines = PASS_PRICING_LIST.map(
    (p) => `- **${p.name} (${p.priceDisplay})**: ${p.description}`
  ).join("\n");

  const facultyLines = INSTRUCTORS.map(
    (inst) => `- **${inst.name}** (${inst.role} • ${inst.origin}): ${inst.bio}`
  ).join("\n");

  const eventLines = UPCOMING_EVENTS.map(
    (evt) =>
      `- **${evt.title}** (${evt.dateBadge} • ${evt.venueName} • ${evt.priceDisplay}): ${evt.description}`
  ).join("\n");

  const faqLines = ACADEMY_FAQS.map(
    (f) => `### Q: ${f.question}\nA: ${f.answer}`
  ).join("\n\n");

  const markdown = `# Salsa Explosion UK — Official AI & LLM Discovery Guide

> Bournemouth's flagship Cuban Salsa (Casino) and Rueda de Casino academy, founded and directed by ${ACADEMY_METRICS.founderAward} winner ${ACADEMY_METRICS.founderTitleName} (${ACADEMY_METRICS.yearsInUk} UK teaching heritage, ${ACADEMY_METRICS.dancersTrained} dancers mentored).

## 1. Official Studio Venue & Contact
- **Venue:** ${VENUE_INFO.fullAddress}
- **Dance Floor:** ${VENUE_INFO.floor}
- **Parking:** ${VENUE_INFO.parkingSummary}
- **Phone / WhatsApp:** ${VENUE_INFO.phoneDisplay} (${VENUE_INFO.whatsappHref})
- **Instagram:** ${VENUE_INFO.instagramUrl}
- **Facebook:** ${VENUE_INFO.facebookUrl}

## 2. Weekly Class Timetable (Strictly Thursdays & Sundays)

### Thursdays at ${VENUE_INFO.name} (Doors ${WEEKLY_SCHEDULE.thursday.doorsTime})
${thursdayLines}

### Sundays at ${VENUE_INFO.name} (Doors ${WEEKLY_SCHEDULE.sunday.doorsTime})
${sundayLines}

## 3. Class Passes & Memberships
${pricingLines}

## 4. Teaching Faculty & Guest Artists
${facultyLines}

## 5. Flagship Congresses & Special Events (2026–2027)
${eventLines}

## 6. Frequently Asked Questions
${faqLines}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
