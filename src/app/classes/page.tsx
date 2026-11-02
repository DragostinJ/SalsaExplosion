import Image from "next/image";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cuban Salsa Classes: Thursday & Sunday",
  description:
    "Cuban salsa and rueda classes every Thursday and Sunday at BOH Studios, Bournemouth. Beginners welcome, no partner needed, £12 at the door.",
  alternates: { canonical: "/classes" },
};
import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  DanceStyle,
  Role,
  SubscriptionStatus,
} from "@prisma/client";
import {
  Sparkles,
  Users,
  Video,
  QrCode,
  BarChart3,
  CalendarPlus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, canSwitchRoles, isFallbackUser } from "@/lib/auth-user";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";
import {
  ClassScheduleCard,
  ClassScheduleItem,
  StudentContext,
} from "@/components/schedule/class-schedule-card";
import { NewDancerOnboarding } from "@/components/schedule/new-dancer-onboarding";
import { reportError } from "@/lib/monitoring";
import dynamic from "next/dynamic";

const BeginnerSafetyHub = dynamic(
  () =>
    import("@/components/beginners/beginner-safety-hub").then(
      (m) => m.BeginnerSafetyHub
    ),
  {
    loading: () => <div className="h-64 rounded-3xl bg-muted/40 animate-pulse my-6" />,
  }
);

import { MultiAgeReassuranceBanner } from "@/components/marketing/multi-age-reassurance-banner";
import { TwoDayExhibitionTimetable } from "@/components/home/TwoDayExhibitionTimetable";
import { LevelMatcherQuiz } from "@/components/marketing/level-matcher-quiz";
import { VENUE_INFO } from "@/lib/academy-data";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

interface SchedulePageProps {
  searchParams: Promise<{
    style?: string;
    level?: string;
    day?: string;
    checkout?: string;
    pkg?: string;
  }>;
}

const VALID_STYLES = new Set<string>(Object.values(DanceStyle));
const VALID_LEVELS = new Set<string>(Object.values(DanceLevel));

const DAY_TABS = [
  { id: "all", label: "All BOH Sessions" },
  { id: "thursday", label: "Thursdays Only" },
  { id: "sunday", label: "Sundays Only" },
];

export default async function StudentSchedulePage({
  searchParams,
}: SchedulePageProps) {
  // 1 & 2. Concurrently Authenticate/Provision User and Await searchParams
  const [user, resolvedParams] = await Promise.all([
    getOrProvisionCurrentUser(),
    searchParams,
  ]);

  const styleFilter =
    resolvedParams.style && VALID_STYLES.has(resolvedParams.style)
      ? (resolvedParams.style as DanceStyle)
      : undefined;

  const levelFilter =
    resolvedParams.level && VALID_LEVELS.has(resolvedParams.level)
      ? (resolvedParams.level as DanceLevel)
      : undefined;

  const dayParam = resolvedParams.day?.toLowerCase();
  const validDays: Record<string, number> = {
    thursday: 4,
    sunday: 0,
  };
  const targetDayOfWeek =
    dayParam && validDays[dayParam] !== undefined ? validDays[dayParam] : undefined;

  const checkoutStatus = resolvedParams.checkout;

  const now = new Date();
  const hasActiveSubscription =
    user?.subscription !== null &&
    user?.subscription !== undefined &&
    user?.subscription.status === SubscriptionStatus.ACTIVE &&
    user?.subscription.currentPeriodEnd > now;

  const studentContext: StudentContext | null = user
    ? {
        currentLevel: user.currentLevel,
        preferredRole: user.preferredRole,
        classCredits: user.classCredits,
        hasActiveSubscription,
      }
    : {
        currentLevel: DanceLevel.BEGINNER,
        preferredRole: DanceRole.LEAD,
        classCredits: 0,
        hasActiveSubscription: false,
        isGuest: true,
      };

  // 4. Query Upcoming Classes with Active Bookings for Role Tallies (Optimized column projection with fail-soft safety)
  let loadFailed = user ? isFallbackUser(user) : false;
  let upcomingClasses: Array<{
    id: string;
    title: string;
    description: string | null;
    style: DanceStyle;
    minLevel: DanceLevel;
    startTime: Date;
    endTime: Date;
    room: string;
    maxCapacity: number;
    maxLeads: number | null;
    maxFollows: number | null;
    bookedCount: number;
    creditCost: number;
    isCancelled: boolean;
    instructor: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
    bookings: Array<{
      id: string;
      userId: string;
      danceRole: DanceRole;
      status: BookingStatus;
    }>;
  }> = [];

  try {
    upcomingClasses = await prisma.classSession.findMany({
      where: {
        startTime: { gt: now },
        isCancelled: false,
        ...(styleFilter ? { style: styleFilter } : {}),
        ...(levelFilter ? { minLevel: levelFilter } : {}),
      },
      orderBy: { startTime: "asc" },
      take: 36,
      select: {
        id: true,
        title: true,
        description: true,
        style: true,
        minLevel: true,
        startTime: true,
        endTime: true,
        room: true,
        maxCapacity: true,
        maxLeads: true,
        maxFollows: true,
        bookedCount: true,
        creditCost: true,
        isCancelled: true,
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
          },
          select: {
            id: true,
            userId: true,
            danceRole: true,
            status: true,
          },
        },
      },
    });
  } catch (classQueryErr) {
    loadFailed = true;
    reportError("StudentSchedulePage:classesQuery", classQueryErr);
  }

  // 5. Transform Database Records into Serializable Client Props
  const filteredClasses =
    targetDayOfWeek !== undefined
      ? upcomingClasses.filter((s) => s.startTime.getDay() === targetDayOfWeek)
      : upcomingClasses.filter((s) => s.startTime.getDay() === 4 || s.startTime.getDay() === 0);

  const scheduleItems: ClassScheduleItem[] = filteredClasses.map((session) => {
    let currentLeadsCount = 0;
    let currentFollowsCount = 0;
    let userBooking: {
      id: string;
      danceRole: DanceRole;
      status: BookingStatus;
    } | null = null;

    for (const b of session.bookings) {
      if (b.danceRole === DanceRole.LEAD) currentLeadsCount++;
      if (b.danceRole === DanceRole.FOLLOW) currentFollowsCount++;
      if (user && b.userId === user.id) {
        userBooking = {
          id: b.id,
          danceRole: b.danceRole,
          status: b.status,
        };
      }
    }

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      style: session.style,
      minLevel: session.minLevel,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      room: session.room,
      maxCapacity: session.maxCapacity,
      maxLeads: session.maxLeads,
      maxFollows: session.maxFollows,
      bookedCount: session.bookedCount,
      currentLeadsCount,
      currentFollowsCount,
      creditCost: session.creditCost,
      isCancelled: session.isCancelled,
      instructor: {
        firstName: session.instructor?.firstName ?? "Enrique",
        lastName: session.instructor?.lastName ?? "Perez Valdes",
        avatarUrl: session.instructor?.avatarUrl ?? null,
      },
      userBooking,
    };
  });

  const userCanManage = user?.role === Role.INSTRUCTOR || user?.role === Role.ADMIN || canSwitchRoles(user?.email);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 py-4 sm:py-8 overflow-x-hidden w-full">
      {loadFailed && <DataUnavailableNotice />}
      {(checkoutStatus === "success" || checkoutStatus === "demo_success") && (
        <div className="flex items-center justify-between border-4 border-ink bg-poster-teal p-4 text-xs sm:text-sm font-bold text-ink shadow-[4px_4px_0_0_#161311]">
          <span>
            Pass activated! Your studio wallet has been updated ({user?.classCredits ?? 0} credits available). Select any class below to book your spot!
          </span>
          <Link href="/classes" className="underline ml-4 text-xs font-black">
            Dismiss
          </Link>
        </div>
      )}

      {/* Cartelera Poster Hero Header & Door-Pay Policy Bar */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>{VENUE_INFO.shortName} BOURNEMOUTH • PAY AT THE DOOR</span>
          <span className="opacity-70">{VENUE_INFO.streetAddress} • {VENUE_INFO.postcode}</span>
        </div>
        <Image
          src={MEDIA_MANIFEST.mockupGraphics.clock.src}
          alt=""
          width={MEDIA_MANIFEST.mockupGraphics.clock.width}
          height={MEDIA_MANIFEST.mockupGraphics.clock.height}
          sizes="9rem"
          className="pointer-events-none absolute right-6 top-16 hidden w-28 rotate-6 sm:block md:right-10 md:w-36"
        />

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className={KICKER}>Thursdays &amp; Sundays · BOH Studios</p>
            <h1 className={`${TYPE.section} text-ink`}>
              THU &amp; SUN <span className="text-accent-red">Programme</span>
            </h1>
            <p className="max-w-2xl text-sm font-semibold text-ink leading-relaxed">
              Weekly Cuban Salsa &amp; Rueda classes are paid directly at the door (£12 for 1 class, £14 for 2 classes — includes the late-night Havana Social Fiesta). No booking or partner required: everyone dances, even when the class is uneven, because the teachers rotate partners.
            </p>
            {user && (
              <div className="inline-flex items-center gap-2 border-2 border-ink bg-poster-mustard px-3 py-1 text-xs font-bold shadow-[2px_2px_0_0_#161311]">
                <Sparkles className="h-4 w-4 text-accent-red" />
                <span>Dancer:</span>
                <span className="font-black uppercase">{user.currentLevel}</span>
                <span className="opacity-80">({user.classCredits} credits)</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className={`${POSTER_BUTTON} border-poster-red bg-poster-red text-ink hover:bg-ink hover:text-ink text-xs font-bold min-h-[40px] px-3.5 inline-flex items-center justify-center`}
            >
              Book Festivals Online →
            </Link>
            <Link
              href="/venues"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold min-h-[40px] px-3.5 inline-flex items-center justify-center`}
            >
              Directions &amp; Parking
            </Link>
          </div>
        </div>
      </section>

      {/* Thursday & Sunday Exhibition Timetable (Primary Schedule Grid with id="schedule-classes-grid") */}
      <div id="schedule-classes-grid" data-testid="schedule-classes-grid" className="space-y-8">
        <TwoDayExhibitionTimetable />

        {/* Live Interactive Database Sessions (When Scheduled) */}
        {scheduleItems.length > 0 ? (
          <div className="space-y-4 pt-6 border-t-4 border-ink">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
                  Tell the teachers you&apos;re coming
                </h3>
                <p className="text-xs text-ink font-medium">
                  Optional and free: pick Lead or Follow so the teachers know who to expect. It never stops anyone from coming in.
                </p>
              </div>
              <span className="text-xs font-bold text-ink bg-poster-mustard px-3 py-1 border border-ink shadow-[2px_2px_0_0_#161311]">
                {scheduleItems.length} Sessions Available
              </span>
            </div>
            {/* Day & level filters for the "I'm coming" cards (the printed timetable above always shows everything) */}
            <div className="space-y-4 border-4 border-ink bg-paper p-4 sm:p-5 text-ink shadow-[4px_4px_0_0_#161311]">
              {/* Day of Week Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Select Day:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {DAY_TABS.map((tab) => {
                    const isActive = (!dayParam && tab.id === "all") || dayParam === tab.id;
                    return (
                      <Link
                        key={tab.id}
                        href={{
                          pathname: "/classes",
                          query: {
                            ...(styleFilter ? { style: styleFilter } : {}),
                            ...(levelFilter ? { level: levelFilter } : {}),
                            ...(tab.id !== "all" ? { day: tab.id } : {}),
                          },
                        }}
                        className={`${POSTER_BUTTON} ${
                          isActive
                            ? POSTER_BUTTON_COLORS.ink
                            : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                        } text-xs font-bold min-h-[40px] px-3 py-1 flex items-center justify-center`}
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Syllabus Level Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-ink">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Syllabus Level:
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={{
                      pathname: "/classes",
                      query: {
                        ...(styleFilter ? { style: styleFilter } : {}),
                        ...(dayParam ? { day: dayParam } : {}),
                      },
                    }}
                    className={`${POSTER_BUTTON} ${
                      !levelFilter
                        ? POSTER_BUTTON_COLORS.mustard
                        : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                    } text-xs font-bold min-h-[40px] px-3 py-1 flex items-center justify-center`}
                  >
                    All Levels ({filteredClasses.length})
                  </Link>
                  {Object.values(DanceLevel).map((level) => (
                    <Link
                      key={level}
                      href={{
                        pathname: "/classes",
                        query: {
                          ...(styleFilter ? { style: styleFilter } : {}),
                          ...(dayParam ? { day: dayParam } : {}),
                          level,
                        },
                      }}
                      className={`${POSTER_BUTTON} ${
                        levelFilter === level
                          ? POSTER_BUTTON_COLORS.mustard
                          : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                      } text-xs font-bold min-h-[40px] px-3 py-1 flex items-center justify-center`}
                    >
                      {level}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scheduleItems.map((session) => (
                <ClassScheduleCard
                  key={session.id}
                  session={session}
                  student={studentContext}
                />
              ))}
            </div>
          </div>
        ) : (styleFilter || levelFilter || dayParam) ? (
          <div className="border-4 border-dashed border-ink p-8 text-center bg-paper text-ink">
            <p className="text-sm font-bold">
              No classes match these filters.
            </p>
            <Link
              href="/classes"
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} mt-3 text-xs inline-flex items-center`}
            >
              Show all classes
            </Link>
          </div>
        ) : null}
      </div>

      {/* Interactive Level Matcher & First-Timer Quick Guide */}
      <section className="border-4 border-ink bg-paper p-5 sm:p-8 text-ink shadow-[6px_6px_0_0_#161311] space-y-6">
        <LevelMatcherQuiz />

        <div className="border-2 border-ink bg-poster-mustard/20 p-4 shadow-[3px_3px_0_0_#161311]">
          <div className="text-xs font-bold uppercase tracking-wider text-ink mb-3 text-center sm:text-left">
            First-Timer Quick Guide
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border-2 border-ink bg-paper p-3 text-xs text-ink">
              <span className="font-bold text-accent-red block">Footwear</span>
              <span className="text-ink font-medium">Comfortable flat shoes or trainers</span>
            </div>
            <div className="border-2 border-ink bg-paper p-3 text-xs text-ink">
              <span className="font-bold text-accent-red block">No Partner Needed</span>
              <span className="text-ink font-medium">Zero partner required (we rotate continuously)</span>
            </div>
            <div className="border-2 border-ink bg-paper p-3 text-xs text-ink">
              <span className="font-bold text-accent-red block">Studio Bar &amp; Lounge</span>
              <span className="text-ink font-medium">Refreshments &amp; social lounge at BOH Studios</span>
            </div>
            <div className="border-2 border-ink bg-paper p-3 text-xs text-ink">
              <span className="font-bold text-accent-red block">Town-Centre Parking</span>
              <span className="text-ink font-medium">Easy parking nearby (The Triangle, BH2 5LR)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Generational UX: Fast-Track Arrival Essentials & 60+ Senior Reassurance */}
      <div className="pt-6 border-t-4 border-ink">
        <MultiAgeReassuranceBanner />
      </div>

      {/* Instructor & Studio Admin Quick-Access Command Bar (Shown only to Staff/Admin) */}
      {userCanManage && (
        <div className="grid gap-4 md:grid-cols-2 pt-4">
          <div className="flex flex-col justify-between gap-3 border-4 border-ink bg-poster-teal p-4 text-ink sm:flex-row sm:items-center shadow-[4px_4px_0_0_#161311]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                Instructor Portal
              </span>
              <h2 className="text-sm font-bold">
                Teaching Desk, Progression &amp; QR Roster
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href="/instructor/students"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Students
              </Link>
              <Link
                href="/instructor/submissions"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <Video className="mr-1.5 h-3.5 w-3.5" />
                Video Queue
              </Link>
              <Link
                href="/instructor/roster"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <QrCode className="mr-1.5 h-3.5 w-3.5" />
                QR Roster
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 border-4 border-ink bg-poster-mustard p-4 text-ink sm:flex-row sm:items-center shadow-[4px_4px_0_0_#161311]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                Studio Owner Admin
              </span>
              <h2 className="text-sm font-bold">
                Revenue Charts, Classes &amp; Events
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href="/admin/analytics"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                Analytics
              </Link>
              <Link
                href="/admin/classes"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                Classes
              </Link>
              <Link
                href="/admin/events"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs px-2.5 py-1 min-h-[40px] flex items-center`}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Events Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* First 60 Seconds: New Dancer Interactive Onboarding Guide (Signed in students) */}
      {user && (
        <NewDancerOnboarding
          studentName={user.firstName}
          currentRole={user.preferredRole}
          currentLevel={user.currentLevel}
          hasActiveBooking={scheduleItems.some((s) => s.userBooking !== null)}
        />
      )}

      {/* Beginner Psychological Safety & Comfort Hub */}
      <BeginnerSafetyHub />
    </main>
  );
}
