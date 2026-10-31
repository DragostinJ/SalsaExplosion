import { NextResponse } from "next/server";
import { Role, TicketPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isEmailConfigured, sendEmail } from "@/lib/email/send-email";
import { ownerDigestEmail, type DigestNumbers } from "@/lib/email/templates";
import { rankPracticeHotspots } from "@/lib/music/practice-hotspots";
import { reportError } from "@/lib/monitoring";

/**
 * Weekly (Mondays, vercel.json): a one-screen email to the studio admins
 * (ADMIN_EMAILS) with the last 7 days vs the 7 before: classes, door
 * check-ins, dancers, sign-ups, festival tickets and the most-looped sections.
 */

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

async function numbersBetween(from: Date, to: Date): Promise<DigestNumbers> {
  const range = { gte: from, lt: to };
  const [classesHeld, checkIns, dancers, newSignUps, festival] = await Promise.all([
    prisma.classSession.count({ where: { isCancelled: false, startTime: range } }),
    prisma.booking.count({ where: { checkedInAt: range } }),
    prisma.booking.groupBy({ by: ["userId"], where: { checkedInAt: range } }),
    prisma.user.count({ where: { role: Role.STUDENT, createdAt: range } }),
    prisma.eventRegistration.aggregate({
      where: { paymentStatus: TicketPaymentStatus.PAID, createdAt: range },
      _count: { _all: true },
      _sum: { amountPaidInCents: true },
    }),
  ]);
  return {
    classesHeld,
    checkIns,
    uniqueDancers: dancers.length,
    newSignUps,
    festivalTickets: festival._count._all,
    festivalRevenueCents: festival._sum.amountPaidInCents ?? 0,
  };
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const recipients = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
  if (recipients.length === 0) return NextResponse.json({ error: "ADMIN_EMAILS is empty" }, { status: 500 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://salsaexplosion.co.uk").trim();
  const end = new Date();
  const start = new Date(end.getTime() - 7 * DAY_MS);
  const previousStart = new Date(start.getTime() - 7 * DAY_MS);

  try {
    const [current, previous, hotspotRows] = await Promise.all([
      numbersBetween(start, end),
      numbersBetween(previousStart, start),
      prisma.practiceSectionStat.groupBy({
        by: ["songId", "sectionId"],
        where: { day: { gte: start } },
        _sum: { loops: true, replays: true },
      }),
    ]);
    const hotspots = rankPracticeHotspots(
      hotspotRows.map((row) => ({
        songId: row.songId,
        sectionId: row.sectionId,
        loops: row._sum.loops ?? 0,
        replays: row._sum.replays ?? 0,
      })),
      3
    );
    const fmt = (date: Date) => date.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short" });
    const email = ownerDigestEmail({ periodLabel: `${fmt(start)} – ${fmt(end)}`, current, previous, hotspots, appUrl });

    const results = await Promise.all(recipients.map((to) => sendEmail({ to, ...email })));
    return NextResponse.json({
      dryRun: !isEmailConfigured(),
      recipients: recipients.length,
      sent: results.filter((result) => result.sent).length,
      current,
    });
  } catch (error) {
    reportError("cron:owner-digest", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
