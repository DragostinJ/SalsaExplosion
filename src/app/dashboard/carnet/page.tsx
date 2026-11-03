import Image from "next/image";
import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import { TicketStub } from "@/components/carnet/ticket-stub";
import { KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, TYPE, halftone, POSTER_INK } from "@/components/poster/poster-kit";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { DOOR_PRICING, VENUE_INFO } from "@/lib/academy-data";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import { weeklyStreak } from "@/lib/carnet-streak";
import { reportError } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mi carnet | Salsa Explosion Bournemouth",
  description: "Your festival passes, class reservations and the season of classes you've danced, in one place.",
  robots: { index: false },
};

const ART = MEDIA_MANIFEST.mockupGraphics;

/** Stub counts that earn a stamp on the carnet */
const MILESTONES = [10, 25, 50, 100] as const;
/** How many collected stubs the season grid shows */
const SEASON_STUBS = 60;

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
const weekdayTime = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});
const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default async function CarnetPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
        <h1 className={TYPE.section}>Mi carnet</h1>
        <p className="mt-4 text-lg">Sign in to see your passes and the classes you&apos;ve danced.</p>
        <Link href="/sign-in?redirect_url=/dashboard/carnet" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} mt-6`}>
          Sign in
        </Link>
      </main>
    );
  }

  const now = new Date();
  let loadFailed = isFallbackUser(user);
  let passes: Awaited<ReturnType<typeof loadPasses>> = [];
  let upcoming: Awaited<ReturnType<typeof loadUpcoming>> = [];
  let attended: Awaited<ReturnType<typeof loadAttended>> = [];
  let attendedCount = 0;

  if (!loadFailed) {
    try {
      [passes, upcoming, attended, attendedCount] = await Promise.all([
        loadPasses(user.id, now),
        loadUpcoming(user.id, now),
        loadAttended(user.id),
        prisma.booking.count({ where: { userId: user.id, status: BookingStatus.ATTENDED } }),
      ]);
    } catch (err) {
      loadFailed = true;
      reportError("CarnetPage:dataFetch", err);
    }
  }

  const nextMilestone = MILESTONES.find((m) => m > attendedCount);
  // Weeks in a row with a class danced: a gentle reason to come back next Thursday or Sunday
  const streak = weeklyStreak(attended.map((booking) => booking.classSession.startTime));
  const stamps = MILESTONES.filter((m) => m <= attendedCount);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl space-y-12 px-4 py-8 sm:px-6">
      {loadFailed && <DataUnavailableNotice />}

      {/* THE CARNET: a digital dancer carnet in poster colours */}
      <section className="relative overflow-hidden border-[6px] border-ink bg-poster-mustard p-6 text-ink shadow-[12px_12px_0_var(--color-ink)] md:p-10">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-poster-red md:h-72 md:w-72" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 h-24 w-1/2" style={halftone(POSTER_INK.mustard)} />
        <div className="relative">
          <p className={KICKER}>Salsa Explosion · {VENUE_INFO.shortName}</p>
          <h1 className={`mt-3 ${TYPE.section}`}>
            Mi carnet
            <span className="mt-2 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Dancer"} · {titleCase(user.currentLevel)}
            </span>
          </h1>
          <div className="mt-8 flex items-end justify-between gap-4">
          <dl className="grid max-w-lg flex-1 grid-cols-3 gap-4 border-t-4 border-ink pt-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">Clases bailadas</dt>
              <dd className={`font-display ${TYPE.number}`}>{attendedCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">Semanas seguidas</dt>
              <dd className={`font-display ${TYPE.number}`}>{streak}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider">Pases de fiesta</dt>
              <dd className={`font-display ${TYPE.number}`}>{passes.length}</dd>
            </div>
          </dl>
          <Image src={ART.medal.src} alt="" width={ART.medal.width} height={ART.medal.height} sizes="9rem" className="w-20 shrink-0 md:w-32" />
          </div>
          <p className="mt-4 text-sm font-semibold">
            {nextMilestone
              ? `${nextMilestone - attendedCount} more ${nextMilestone - attendedCount === 1 ? "class" : "classes"} to your ${nextMilestone}-class stamp.`
              : "Every stamp collected. ¡Eres de la casa!"}
          </p>
          {stamps.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stamps">
              {stamps.map((m) => (
                <li key={m} className="flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-full border-4 border-ink bg-paper font-display text-xl">
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* FESTIVAL AND PARTY PASSES (bought online) */}
      <section aria-labelledby="passes-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={KICKER}>Fiestas · show the code at the door</p>
            <h2 id="passes-heading" className={TYPE.section}>Tus pases</h2>
          </div>
          <Image src={ART.phone.src} alt="" width={ART.phone.width} height={ART.phone.height} sizes="7rem" className="w-20 shrink-0 md:w-28" />
        </div>
        {passes.length === 0 ? (
          <p className="max-w-xl">
            No festival or party passes yet.{" "}
            <Link href="/events" className="font-bold underline underline-offset-4">
              See what&apos;s on →
            </Link>
          </p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {passes.map((pass) => (
              <li key={pass.id}>
                <TicketStub
                  strip={dayMonth.format(pass.event.startDate)}
                  tone="paper"
                  aside={<ScannableQrCode value={pass.qrCodeHash} size={112} label={pass.qrCodeHash} />}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{pass.ticketTier.name}</p>
                  <h3 className={`font-display ${TYPE.card}`}>{pass.event.title}</h3>
                  <p className="text-sm">
                    {pass.event.venueName} · {titleCase(pass.role)}
                  </p>
                  <Link href={`/events/${pass.event.slug}`} className="mt-auto inline-flex min-h-[40px] items-center text-sm font-bold underline underline-offset-4">
                    Event details →
                  </Link>
                </TicketStub>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CLASS RESERVATIONS (free; paid at the door) */}
      <section aria-labelledby="classes-heading" className="space-y-4">
        <p className={KICKER}>
          Clases · pay at the door, £{DOOR_PRICING.oneClassPounds} / £{DOOR_PRICING.twoClassesPounds}
        </p>
        <h2 id="classes-heading" className={TYPE.section}>Próximas clases</h2>
        {upcoming.length === 0 ? (
          <p className="max-w-xl">
            No class reserved. You don&apos;t need to: just come on Thursday or Sunday.{" "}
            <Link href="/classes" className="font-bold underline underline-offset-4">
              Timetable →
            </Link>
          </p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {upcoming.map((booking) => (
              <li key={booking.id}>
                <TicketStub strip={dayMonth.format(booking.classSession.startTime)} tone="teal">
                  <p className="text-xs font-bold uppercase tracking-wider">{weekdayTime.format(booking.classSession.startTime)}</p>
                  <h3 className={`font-display ${TYPE.card}`}>{booking.classSession.title}</h3>
                  <p className="text-sm">
                    Reserved as {titleCase(booking.danceRole)} · {titleCase(booking.classSession.minLevel)}
                  </p>
                </TicketStub>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* THE SEASON: one torn stub per class danced */}
      <section aria-labelledby="season-heading" className="space-y-4">
        <p className={KICKER}>La temporada · {attendedCount} stubs</p>
        <h2 id="season-heading" className={TYPE.section}>Tus funciones</h2>
        {attended.length === 0 ? (
          <p className="max-w-xl">
            Every class you&apos;re checked in at adds a stub here. Your first one is waiting on Thursday.
          </p>
        ) : (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {attended.map((booking, index) => (
              <li
                key={booking.id}
                className={`border-2 border-dashed border-ink px-3 py-2 ${index % 3 === 0 ? "rotate-[-1deg]" : index % 3 === 1 ? "rotate-[1deg]" : ""}`}
              >
                <p className="font-display text-xl leading-none">{dayMonth.format(booking.checkedInAt ?? booking.classSession.startTime)}</p>
                <p className="truncate text-xs font-semibold">{booking.classSession.title}</p>
              </li>
            ))}
          </ol>
        )}
        {attendedCount > SEASON_STUBS && <p className="text-sm">Showing your latest {SEASON_STUBS}.</p>}
      </section>

      <nav aria-label="More" className="flex flex-wrap gap-3 border-t-4 border-ink pt-6">
        <Link href="/dashboard/progression" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
          Level &amp; syllabus
        </Link>
        <Link href="/dashboard/wallet" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
          Receipts &amp; history
        </Link>
      </nav>
    </main>
  );
}

// Every query is scoped to the signed-in dancer's own id (no IDOR)

function loadPasses(userId: string, now: Date) {
  return prisma.eventRegistration.findMany({
    where: { userId, paymentStatus: "PAID", event: { endDate: { gte: now } } },
    select: {
      id: true,
      qrCodeHash: true,
      role: true,
      ticketTier: { select: { name: true } },
      event: { select: { title: true, slug: true, startDate: true, venueName: true } },
    },
    orderBy: { event: { startDate: "asc" } },
  });
}

function loadUpcoming(userId: string, now: Date) {
  return prisma.booking.findMany({
    where: {
      userId,
      status: BookingStatus.CONFIRMED,
      classSession: { startTime: { gte: now }, isCancelled: false },
    },
    select: {
      id: true,
      danceRole: true,
      classSession: { select: { title: true, startTime: true, minLevel: true } },
    },
    orderBy: { classSession: { startTime: "asc" } },
    take: 6,
  });
}

function loadAttended(userId: string) {
  return prisma.booking.findMany({
    where: { userId, status: BookingStatus.ATTENDED },
    select: {
      id: true,
      checkedInAt: true,
      classSession: { select: { title: true, startTime: true } },
    },
    orderBy: { classSession: { startTime: "desc" } },
    take: SEASON_STUBS,
  });
}
