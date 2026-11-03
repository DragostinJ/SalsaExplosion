import { NextResponse } from "next/server";
import { EventStatus, TicketPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isEmailConfigured, sendEmail } from "@/lib/email/send-email";
import { eventReminderEmail } from "@/lib/email/templates";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribe-token";
import { reportError } from "@/lib/monitoring";
import { getSiteOrigin } from "@/lib/safe-url";

/**
 * Daily (through /api/cron/daily): two days before a festival or party, one email per dancer with a
 * paid pass, listing their passes. The window is exactly one day wide (events starting 36 to 60 hours
 * from now), so with one run a day every event is reminded once and nothing needs marking as sent.
 * Skips dancers who stopped reminders. Without RESEND_API_KEY it reports what it would send.
 */

export const dynamic = "force-dynamic";

const HOUR = 3_600_000;
const EVENT_REMINDER_WINDOW = { fromHours: 36, toHours: 60 } as const;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const appUrl = getSiteOrigin();
  const now = Date.now();

  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        startDate: {
          gte: new Date(now + EVENT_REMINDER_WINDOW.fromHours * HOUR),
          lt: new Date(now + EVENT_REMINDER_WINDOW.toHours * HOUR),
        },
      },
      select: {
        slug: true,
        title: true,
        startDate: true,
        venueName: true,
        venueAddress: true,
        registrations: {
          where: { paymentStatus: TicketPaymentStatus.PAID, user: { classRemindersOptOut: false } },
          select: {
            user: { select: { id: true, email: true, firstName: true } },
            ticketTier: { select: { name: true } },
          },
        },
      },
    });

    const dryRun = !isEmailConfigured();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const event of events) {
      // One email per dancer, however many passes they bought
      const byDancer = new Map<string, { email: string; firstName: string; passes: string[] }>();
      for (const r of event.registrations) {
        const entry = byDancer.get(r.user.id) ?? { email: r.user.email, firstName: r.user.firstName, passes: [] };
        if (!entry.passes.includes(r.ticketTier.name)) entry.passes.push(r.ticketTier.name);
        byDancer.set(r.user.id, entry);
      }

      for (const [userId, dancer] of byDancer) {
        const unsubscribeUrl = buildUnsubscribeUrl(appUrl, userId);
        if (!unsubscribeUrl) {
          // No EMAIL_LINK_SECRET: never send without a working unsubscribe link
          skipped++;
          continue;
        }
        const email = eventReminderEmail({
          firstName: dancer.firstName,
          eventTitle: event.title,
          startDate: event.startDate,
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          passNames: dancer.passes,
          appUrl,
          eventSlug: event.slug,
          unsubscribeUrl,
        });
        const result = await sendEmail({ to: dancer.email, ...email });
        if (result.sent) sent++;
        else if (result.reason === "dry-run") skipped++;
        else {
          failed++;
          reportError("cron:event-reminders:send", new Error(result.detail ?? "send failed"));
        }
      }
    }

    return NextResponse.json({ dryRun, events: events.length, sent, skipped, failed });
  } catch (error) {
    reportError("cron:event-reminders", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
