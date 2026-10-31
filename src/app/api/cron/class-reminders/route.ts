import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isEmailConfigured, sendEmail } from "@/lib/email/send-email";
import { classReminderEmail } from "@/lib/email/templates";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe-token";
import { summarizeClassSongs } from "@/lib/music/class-songs";
import { reportError } from "@/lib/monitoring";

/**
 * Daily (vercel.json): reminds booked dancers about classes starting in the
 * next REMINDER_WINDOW_HOURS, with that class's practice songs. One email per
 * booking (Booking.reminderSentAt). Skips dancers who unsubscribed. Without
 * RESEND_API_KEY it reports what it would send and marks nothing.
 */

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_HOURS = 16;
const MAX_EMAILS_PER_RUN = 200;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://salsaexplosion.co.uk").trim();
  const now = new Date();
  const until = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 3_600_000);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        reminderSentAt: null,
        user: { classRemindersOptOut: false },
        classSession: { isCancelled: false, startTime: { gte: now, lte: until } },
      },
      take: MAX_EMAILS_PER_RUN,
      select: {
        id: true,
        user: { select: { id: true, email: true, firstName: true } },
        classSession: {
          select: {
            title: true,
            startTime: true,
            room: true,
            practiceSongIds: true,
            instructor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const dryRun = !isEmailConfigured();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const booking of bookings) {
      const unsubscribeUrl = buildUnsubscribeUrl(appUrl, booking.user.id);
      if (!unsubscribeUrl) {
        // No EMAIL_LINK_SECRET: never send without a working unsubscribe link
        skipped++;
        continue;
      }
      const email = classReminderEmail({
        firstName: booking.user.firstName,
        classTitle: booking.classSession.title,
        startTime: booking.classSession.startTime,
        room: booking.classSession.room,
        instructorName: `${booking.classSession.instructor.firstName} ${booking.classSession.instructor.lastName}`,
        songs: summarizeClassSongs(booking.classSession.practiceSongIds),
        appUrl,
        unsubscribeUrl,
      });
      const result = await sendEmail({ to: booking.user.email, ...email });
      if (result.sent) {
        sent++;
        await prisma.booking.update({ where: { id: booking.id }, data: { reminderSentAt: new Date() } });
      } else if (result.reason === "dry-run") {
        skipped++;
      } else {
        failed++;
        reportError("cron:class-reminders:send", new Error(result.detail ?? "send failed"));
      }
    }

    return NextResponse.json({ dryRun, due: bookings.length, sent, skipped, failed });
  } catch (error) {
    reportError("cron:class-reminders", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
