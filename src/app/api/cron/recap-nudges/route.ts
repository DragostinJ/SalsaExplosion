import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isEmailConfigured, sendEmail } from "@/lib/email/send-email";
import { recapNudgeEmail } from "@/lib/email/templates";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe-token";
import { reportError } from "@/lib/monitoring";
import { getSiteOrigin } from "@/lib/safe-url";

/**
 * Daily (through /api/cron/daily): the morning after class, one email per teacher listing their
 * classes from the last 24 hours that have no recap yet, with a link to add it. The window is one
 * day wide, so with one run a day each class is nudged once. Teachers who stopped reminders are
 * skipped. Without RESEND_API_KEY it reports what it would send.
 */

export const dynamic = "force-dynamic";

const DAY = 24 * 3_600_000;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const appUrl = getSiteOrigin();
  const now = Date.now();

  try {
    const classes = await prisma.classSession.findMany({
      where: {
        isCancelled: false,
        recapRecordedAt: null,
        endTime: { gte: new Date(now - DAY), lt: new Date(now) },
        instructor: { classRemindersOptOut: false },
      },
      orderBy: { startTime: "asc" },
      select: {
        title: true,
        startTime: true,
        instructor: { select: { id: true, email: true, firstName: true } },
        _count: { select: { bookings: { where: { status: BookingStatus.ATTENDED } } } },
      },
    });

    const byTeacher = new Map<string, { email: string; firstName: string; classes: { title: string; startTime: Date; checkedIn: number }[] }>();
    for (const c of classes) {
      const entry = byTeacher.get(c.instructor.id) ?? { email: c.instructor.email, firstName: c.instructor.firstName, classes: [] };
      entry.classes.push({ title: c.title, startTime: c.startTime, checkedIn: c._count.bookings });
      byTeacher.set(c.instructor.id, entry);
    }

    const dryRun = !isEmailConfigured();
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    for (const [teacherId, teacher] of byTeacher) {
      const unsubscribeUrl = buildUnsubscribeUrl(appUrl, teacherId);
      if (!unsubscribeUrl) {
        skipped++;
        continue;
      }
      const email = recapNudgeEmail({ firstName: teacher.firstName, classes: teacher.classes, recapsUrl: `${appUrl}/dashboard/recaps`, unsubscribeUrl });
      const result = await sendEmail({ to: teacher.email, ...email });
      if (result.sent) sent++;
      else if (result.reason === "dry-run") skipped++;
      else {
        failed++;
        reportError("cron:recap-nudges:send", new Error(result.detail ?? "send failed"));
      }
    }

    return NextResponse.json({ dryRun, classes: classes.length, teachers: byTeacher.size, sent, skipped, failed });
  } catch (error) {
    reportError("cron:recap-nudges", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
