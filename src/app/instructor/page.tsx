import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatus, DanceRole, EventStatus, Prisma, SubmissionStatus, TicketPaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, TYPE } from "@/components/poster/poster-kit";
import { getAllMoves, getMoveReviewState } from "@/lib/moves/move-library";
import { hasUnsureNote } from "@/lib/moves/move-categories";
import { studioDayBounds, STUDIO_TIME_ZONE } from "@/lib/schedule/weekly-sessions";
import { reportError } from "@/lib/monitoring";

export const metadata: Metadata = {
  title: "Today | Salsa Explosion Teachers",
  robots: { index: false, follow: false },
};

const time = (d: Date) => d.toLocaleTimeString("en-GB", { timeZone: STUDIO_TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const dayName = (d: Date) =>
  d.toLocaleDateString("en-GB", { timeZone: STUDIO_TIME_ZONE, weekday: "long", day: "numeric", month: "long" });

const CLASS_SELECT = {
  id: true,
  title: true,
  startTime: true,
  instructor: { select: { firstName: true } },
  bookings: {
    where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] } },
    select: { danceRole: true, status: true },
  },
} satisfies Prisma.ClassSessionSelect;

function loadClasses(from: Date, to: Date | null, take: number) {
  return prisma.classSession.findMany({
    where: { isCancelled: false, startTime: to ? { gte: from, lt: to } : { gte: from } },
    orderBy: { startTime: "asc" },
    take,
    select: CLASS_SELECT,
  });
}
type ClassRow = Awaited<ReturnType<typeof loadClasses>>[number];

/**
 * The teachers' and owner's first screen: tonight's classes and who's coming, then only the
 * things that need someone, each with a count and one link. Everything else is in the menu.
 */
export default async function TodayPage() {
  await requireRole(STAFF_ROLES);

  const now = new Date();
  const { start, end } = studioDayBounds(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let loadFailed = false;
  let tonight: ClassRow[] = [];
  let upcoming: ClassRow[] = [];
  let counts = { lessonRequests: 0, recapsMissing: 0, assessments: 0, merch: 0 };
  let festival: { title: string; startDate: Date; sold: number } | null = null;

  try {
    const [today, next, lessonRequests, recapsMissing, assessments, merch, nextFestival] = await Promise.all([
      loadClasses(start, end, 10),
      loadClasses(end, null, 6),
      prisma.privateLessonBooking.count({ where: { status: "PENDING" } }),
      prisma.classSession.count({ where: { isCancelled: false, recapRecordedAt: null, endTime: { gte: weekAgo, lt: now } } }),
      prisma.videoSubmission.count({ where: { status: SubmissionStatus.PENDING } }),
      prisma.merchReservation.count({ where: { status: "RESERVED" } }),
      prisma.event.findFirst({
        where: { status: EventStatus.PUBLISHED, endDate: { gte: now } },
        orderBy: { startDate: "asc" },
        select: {
          title: true,
          startDate: true,
          _count: { select: { registrations: { where: { paymentStatus: TicketPaymentStatus.PAID } } } },
        },
      }),
    ]);
    tonight = today;
    // When nothing is on today, show the next class day
    const nextDay = next[0] ? studioDayBounds(next[0].startTime) : null;
    upcoming = nextDay ? next.filter((c) => c.startTime < nextDay.end) : [];
    counts = { lessonRequests, recapsMissing, assessments, merch };
    festival = nextFestival
      ? { title: nextFestival.title, startDate: nextFestival.startDate, sold: nextFestival._count.registrations }
      : null;
  } catch (error) {
    loadFailed = true;
    reportError("TodayPage", error);
  }

  const drafts = getAllMoves().filter((m) => (getMoveReviewState(m.id)?.status ?? "draft") === "draft");
  const unsure = drafts.filter(hasUnsureNote).length;

  const shown = tonight.length > 0 ? tonight : upcoming;
  const todo = [
    { count: counts.lessonRequests, label: "private lesson requests to answer", href: "/admin/operations" },
    { count: counts.recapsMissing, label: "classes this week without a recap", href: "/dashboard/recaps" },
    { count: counts.assessments, label: "video assessments waiting", href: "/instructor/submissions" },
    { count: counts.merch, label: "shop items waiting to be collected", href: "/admin/operations" },
    { count: drafts.length, label: `moves to check (start with the ${unsure} where Gemini wasn't sure)`, href: "/instructor/moves" },
  ].filter((item) => item.count > 0);

  const classesHeading =
    tonight.length > 0 ? "Tonight" : shown.length > 0 ? `Next classes · ${dayName(shown[0].startTime)}` : "No classes coming up";

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <InstructorNav />

        <header>
          <p className={KICKER}>Hoy · {dayName(now)}</p>
          <h1 className={`mt-2 font-display ${TYPE.section}`}>Today</h1>
        </header>

        {loadFailed && (
          <p role="alert" className="border-4 border-ink bg-poster-mustard p-4 font-bold text-ink">
            Couldn&apos;t load today&apos;s numbers. Try again in a minute; the menu above still works.
          </p>
        )}

        <section aria-labelledby="classes-heading" className="space-y-4">
          <h2 id="classes-heading" className={TYPE.card}>
            {classesHeading}
          </h2>
          {shown.length === 0 ? (
            <p className="text-sm">
              Classes are added automatically every morning from the timetable.{" "}
              <Link href="/admin/classes" className="font-bold underline underline-offset-4">
                Add the next 4 weeks now
              </Link>
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {shown.map((c) => {
                const leads = c.bookings.filter((b) => b.danceRole === DanceRole.LEAD).length;
                const follows = c.bookings.filter((b) => b.danceRole === DanceRole.FOLLOW).length;
                const inDoor = c.bookings.filter((b) => b.status === BookingStatus.ATTENDED).length;
                return (
                  <li key={c.id} className="border-4 border-ink bg-paper p-4 text-ink shadow-[6px_6px_0_var(--color-ink)]">
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {time(c.startTime)} · {c.instructor.firstName}
                    </p>
                    <p className="mt-1 text-lg font-bold leading-tight">{c.title}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-bold">{c.bookings.length} coming</span>
                      {c.bookings.length > 0 && ` · ${leads} leads · ${follows} follows`}
                      {inDoor > 0 && ` · ${inDoor} checked in`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Link href="/instructor/roster" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
              Door check-in
            </Link>
            <Link href="/admin/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper`}>
              Classes
            </Link>
          </div>
        </section>

        <section aria-labelledby="todo-heading" className="space-y-3">
          <h2 id="todo-heading" className={TYPE.card}>
            Needs you
          </h2>
          {todo.length === 0 ? (
            <p className="text-sm">Nothing waiting. Enjoy the class.</p>
          ) : (
            <ul className="divide-y-2 divide-line border-4 border-ink">
              {todo.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex min-h-[56px] items-center gap-4 px-4 py-3 hover:bg-surface-2">
                    <span className="font-display text-3xl leading-none tabular-nums">{item.count}</span>
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span aria-hidden="true" className="ml-auto font-bold">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {festival && (
          <section aria-labelledby="festival-heading" className="space-y-2 border-4 border-ink bg-poster-mustard p-4 text-ink">
            <p className={KICKER}>Next festival · {dayName(festival.startDate)}</p>
            <h2 id="festival-heading" className="text-lg font-bold">
              {festival.title}
            </h2>
            <p className="text-sm">
              <span className="font-bold">{festival.sold}</span> passes sold online.{" "}
              <Link href="/admin/events" className="font-bold underline underline-offset-4">
                Festivals &amp; tickets
              </Link>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
