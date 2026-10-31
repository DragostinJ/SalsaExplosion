import type { ClassSongSummary } from "@/lib/music/class-songs";
import type { PracticeHotspot } from "@/lib/music/practice-hotspots";
import { buildSectionLink } from "@/lib/music/section-link";

/** Plain, inline-styled emails (email clients ignore stylesheets). Every value is escaped. */

const TIME_ZONE = "Europe/London";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const wrap = (body: string, footer: string) =>
  `<!doctype html><html><body style="margin:0;background:#080706;color:#F5F2EB;font-family:Arial,Helvetica,sans-serif">` +
  `<div style="max-width:560px;margin:0 auto;padding:24px 16px">${body}` +
  `<p style="margin-top:32px;font-size:12px;color:#a8a29e">${footer}</p></div></body></html>`;

const link = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}" style="color:#F59E0B;font-weight:bold">${escapeHtml(label)}</a>`;

export interface ClassReminderInput {
  firstName: string;
  classTitle: string;
  startTime: Date;
  room: string;
  instructorName: string;
  songs: readonly ClassSongSummary[];
  appUrl: string;
  unsubscribeUrl: string;
}

export function classReminderEmail(input: ClassReminderInput) {
  const time = input.startTime.toLocaleTimeString("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });
  const day = input.startTime.toLocaleDateString("en-GB", { timeZone: TIME_ZONE, weekday: "long" });
  const app = input.appUrl.replace(/\/$/, "");
  const subject = `${day} ${time}: ${input.classTitle}`;
  const songLines = input.songs.map((song) => ({ label: `${song.title} (${song.artist})`, href: `${app}/music/${song.id}` }));

  const html = wrap(
    `<p style="font-size:16px">Hi ${escapeHtml(input.firstName)},</p>` +
      `<p style="font-size:16px">You're booked for <strong>${escapeHtml(input.classTitle)}</strong> ` +
      `${escapeHtml(day)} at <strong>${escapeHtml(time)}</strong>, ${escapeHtml(input.room)}, with ${escapeHtml(input.instructorName)}.</p>` +
      `<p style="font-size:14px;color:#d6d3d1">Pay at the door as usual (cash or card).</p>` +
      (songLines.length
        ? `<p style="font-size:14px;margin-top:20px"><strong style="color:#F59E0B">Songs for this class</strong> (open one to see what to dance in every section):</p><ul>` +
          songLines.map((song) => `<li style="margin:6px 0">${link(song.href, song.label)}</li>`).join("") +
          `</ul>`
        : "") +
      `<p style="font-size:14px">Can't make it? ${link(`${app}/dashboard/schedule`, "Cancel your booking")} so someone else can dance.</p>`,
    `You get this because you booked a class at Salsa Explosion. ${link(input.unsubscribeUrl, "Stop class reminders")}`
  );

  const text = [
    `Hi ${input.firstName},`,
    `You're booked for ${input.classTitle} ${day} at ${time}, ${input.room}, with ${input.instructorName}.`,
    "Pay at the door as usual (cash or card).",
    ...(songLines.length ? ["", "Songs for this class:", ...songLines.map((song) => `- ${song.label}: ${song.href}`)] : []),
    "",
    `Can't make it? Cancel so someone else can dance: ${app}/dashboard/schedule`,
    "",
    `Stop class reminders: ${input.unsubscribeUrl}`,
  ].join("\n");

  return {
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

export interface DigestNumbers {
  classesHeld: number;
  checkIns: number;
  uniqueDancers: number;
  newSignUps: number;
  festivalTickets: number;
  festivalRevenueCents: number;
}

/** "+12%", "-5%", "new" (from zero) or "same". */
export function formatChange(current: number, previous: number): string {
  if (current === previous) return "same";
  if (previous === 0) return "new";
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

const pounds = (cents: number) => `£${(cents / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

export interface OwnerDigestInput {
  periodLabel: string;
  current: DigestNumbers;
  previous: DigestNumbers;
  hotspots: readonly PracticeHotspot[];
  appUrl: string;
}

export function ownerDigestEmail(input: OwnerDigestInput) {
  const { current, previous } = input;
  const app = input.appUrl.replace(/\/$/, "");
  const rows: [string, string, string][] = [
    ["Classes held", String(current.classesHeld), formatChange(current.classesHeld, previous.classesHeld)],
    ["Check-ins at the door", String(current.checkIns), formatChange(current.checkIns, previous.checkIns)],
    ["Different dancers", String(current.uniqueDancers), formatChange(current.uniqueDancers, previous.uniqueDancers)],
    ["New sign-ups", String(current.newSignUps), formatChange(current.newSignUps, previous.newSignUps)],
    ["Festival tickets sold", String(current.festivalTickets), formatChange(current.festivalTickets, previous.festivalTickets)],
    [
      "Festival ticket revenue",
      pounds(current.festivalRevenueCents),
      formatChange(current.festivalRevenueCents, previous.festivalRevenueCents),
    ],
  ];
  const subject = `Salsa Explosion weekly: ${current.checkIns} check-ins (${formatChange(current.checkIns, previous.checkIns)} vs last week)`;

  const html = wrap(
    `<h1 style="font-size:20px;margin:0 0 4px">Your week at Salsa Explosion</h1>` +
      `<p style="font-size:13px;color:#a8a29e;margin:0 0 16px">${escapeHtml(input.periodLabel)} · change vs the week before</p>` +
      `<table style="width:100%;border-collapse:collapse;font-size:14px">` +
      rows
        .map(
          ([label, value, change]) =>
            `<tr><td style="padding:8px 0;border-bottom:1px solid #292524">${escapeHtml(label)}</td>` +
            `<td style="padding:8px 0;border-bottom:1px solid #292524;text-align:right;font-weight:bold">${escapeHtml(value)}</td>` +
            `<td style="padding:8px 0 8px 12px;border-bottom:1px solid #292524;text-align:right;color:#F59E0B">${escapeHtml(change)}</td></tr>`
        )
        .join("") +
      `</table>` +
      (input.hotspots.length
        ? `<p style="font-size:14px;margin-top:20px"><strong>Where students struggle</strong> (most looped in the practice player, last 7 days):</p><ol style="font-size:14px">` +
          input.hotspots
            .map(
              (spot) =>
                `<li style="margin:6px 0">${link(`${app}${buildSectionLink("", spot.songId, spot.sectionId)}`, `${spot.sectionName}, ${spot.songTitle}`)}</li>`
            )
            .join("") +
          `</ol>`
        : "") +
      `<p style="font-size:14px">${link(`${app}/admin/analytics`, "Open full analytics")}</p>`,
    "Sent every Monday to the studio admins (ADMIN_EMAILS)."
  );

  const text = [
    `Your week at Salsa Explosion (${input.periodLabel}), change vs the week before:`,
    ...rows.map(([label, value, change]) => `- ${label}: ${value} (${change})`),
    ...(input.hotspots.length
      ? ["", "Where students struggle:", ...input.hotspots.map((spot) => `- ${spot.sectionName}, ${spot.songTitle}`)]
      : []),
    "",
    `Full analytics: ${app}/admin/analytics`,
  ].join("\n");

  return { subject, html, text };
}
