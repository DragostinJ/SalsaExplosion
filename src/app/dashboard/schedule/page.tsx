import Link from "next/link";
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
import { getOrProvisionCurrentUser, canSwitchRoles } from "@/lib/auth-user";
import {
  ClassScheduleCard,
  ClassScheduleItem,
  StudentContext,
} from "@/components/schedule/class-schedule-card";
import { NewDancerOnboarding } from "@/components/schedule/new-dancer-onboarding";
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

const PartnerMatchWaitlist = dynamic(
  () =>
    import("@/components/schedule/partner-match-waitlist").then(
      (m) => m.PartnerMatchWaitlist
    ),
  {
    loading: () => <div className="h-48 rounded-3xl bg-muted/40 animate-pulse my-6" />,
  }
);

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { WeeklyCalendarOverview } from "@/components/schedule/weekly-calendar-overview";
import { MultiAgeReassuranceBanner } from "@/components/marketing/multi-age-reassurance-banner";
import { TwoDayExhibitionTimetable } from "@/components/home/TwoDayExhibitionTimetable";
import { LevelMatcherQuiz } from "@/components/marketing/level-matcher-quiz";

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

  // 4. Query Upcoming Classes with Active Bookings for Role Tallies (Optimized column projection)
  const upcomingClasses = await prisma.classSession.findMany({
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
      instructor: session.instructor,
      userBooking,
    };
  });

  const userCanManage = user?.role === Role.INSTRUCTOR || user?.role === Role.ADMIN || canSwitchRoles(user?.email);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden w-full">
      {(checkoutStatus === "success" || checkoutStatus === "demo_success") && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <span>
            Pass activated! Your studio wallet has been updated ({user?.classCredits ?? 0} credits available). Select any class below to book your spot!
          </span>
          <Link href="/dashboard/schedule" className="underline ml-4 text-xs">
            Dismiss
          </Link>
        </div>
      )}

      {/* "The Place" Havana Nocturne Architectural PageHeader & Door-Pay Policy Bar */}
      <PageHeader
        eyebrowLeft="BOH STUDIOS BOURNEMOUTH • PAY AT THE DOOR"
        eyebrowRight="104 COMMERCIAL RD • BH2 5LR"
        title="THU & SUN"
        highlight="programme"
        description="Weekly Cuban Salsa & Rueda classes are paid directly at the door (£12 for 1 class, £14 for 2 classes — includes the late-night Havana Social Fiesta). No pre-booking or partner required. Lead & Follow partner rotations are 100% ratio balanced."
        badge={
          user ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-3 px-3 py-1.5 text-xs">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-stone-300">Dancer:</span>
              <span className="font-bold text-gold">{user.currentLevel}</span>
              <span className="text-stone-400 font-mono">({user.classCredits} credits)</span>
            </div>
          ) : undefined
        }
        actions={
          <>
            <Button asChild size="sm" className="bg-brand hover:bg-brand-hover text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-xs">
              <Link href="/events">
                <span>Book Festivals Online →</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-line bg-surface-3 hover:bg-surface-2 text-ivory font-bold text-xs h-9 px-3.5 rounded-xl">
              <Link href="/venues">Directions &amp; Parking</Link>
            </Button>
          </>
        }
      />

      {/* Day & Level Filter Bars */}
      <div className="space-y-3 border-b pb-4">
        {/* Day of Week Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Day:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
            {DAY_TABS.map((tab) => {
              const isActive = (!dayParam && tab.id === "all") || dayParam === tab.id;
              return (
                <Button
                  key={tab.id}
                  asChild
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs font-bold min-h-8 shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-primary-base text-white hover:bg-primary-hover shadow-xs"
                      : "border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <Link
                    href={{
                      pathname: "/dashboard/schedule",
                      query: {
                        ...(styleFilter ? { style: styleFilter } : {}),
                        ...(levelFilter ? { level: levelFilter } : {}),
                        ...(tab.id !== "all" ? { day: tab.id } : {}),
                      },
                    }}
                  >
                    {tab.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Syllabus Level Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Syllabus Level:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
            <Button
              asChild
              variant={!levelFilter ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-bold min-h-8 shrink-0 whitespace-nowrap"
            >
              <Link
                href={{
                  pathname: "/dashboard/schedule",
                  query: {
                    ...(styleFilter ? { style: styleFilter } : {}),
                    ...(dayParam ? { day: dayParam } : {}),
                  },
                }}
              >
                All Levels ({filteredClasses.length})
              </Link>
            </Button>
            {Object.values(DanceLevel).map((level) => (
              <Button
                key={level}
                asChild
                variant={levelFilter === level ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs font-semibold min-h-8 shrink-0 whitespace-nowrap"
              >
                <Link
                  href={{
                    pathname: "/dashboard/schedule",
                    query: {
                      ...(styleFilter ? { style: styleFilter } : {}),
                      ...(dayParam ? { day: dayParam } : {}),
                      level,
                    },
                  }}
                >
                  {level}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Thursday & Sunday Exhibition Timetable (Primary Schedule Grid with id="schedule-classes-grid") */}
      <div id="schedule-classes-grid" data-testid="schedule-classes-grid" className="space-y-8">
        <TwoDayExhibitionTimetable />

        {/* Live Interactive Database Sessions (When Scheduled) */}
        {scheduleItems.length > 0 ? (
          <div className="space-y-4 pt-6 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                  Live Interactive Sessions &amp; Ratio Capacity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select your dance role (Lead / Follow) for live ratio-balanced reservation.
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border">
                {scheduleItems.length} Sessions Available
              </span>
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
          <div className="rounded-xl border border-dashed py-8 text-center bg-card">
            <p className="text-sm font-semibold">
              No live database sessions match your current filter selection.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 text-xs font-bold">
              <Link href="/dashboard/schedule">Reset Filters</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Interactive Level Matcher & First-Timer Quick Guide (Moved from Landing Page) */}
      <section className="rounded-3xl border border-border/70 bg-card p-5 sm:p-8 shadow-xs space-y-6">
        <LevelMatcherQuiz />

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs">
          <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 text-center sm:text-left">
            First-Timer Quick Guide
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground">
              <span className="font-bold text-amber-800 dark:text-amber-400">Footwear</span>
              <span className="text-muted-foreground">Comfortable flat shoes or trainers</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground">
              <span className="font-bold text-amber-800 dark:text-amber-400">No Partner Needed</span>
              <span className="text-muted-foreground">Zero partner required (we rotate continuously)</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground">
              <span className="font-bold text-amber-800 dark:text-amber-400">Studio Bar &amp; Lounge</span>
              <span className="text-muted-foreground">Refreshments &amp; social lounge at BOH Studios</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-xs text-foreground">
              <span className="font-bold text-amber-800 dark:text-amber-400">Town-Centre Parking</span>
              <span className="text-muted-foreground">Easy parking nearby (The Triangle, BH2 5LR)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Calendar Overview: Days of the Week Only */}
      <div className="pt-6 border-t">
        <WeeklyCalendarOverview />
      </div>

      {/* Multi-Generational UX: Fast-Track Arrival Essentials & 60+ Senior Reassurance */}
      <div className="pt-6 border-t">
        <MultiAgeReassuranceBanner />
      </div>

      {/* Instructor & Studio Admin Quick-Access Command Bar (Shown only to Staff/Admin) */}
      {userCanManage && (
        <div className="grid gap-4 md:grid-cols-2 pt-4">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Instructor Portal
              </span>
              <h2 className="text-sm font-bold">
                Teaching Desk, Progression & QR Roster
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/instructor/students">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Students
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/instructor/submissions">
                  <Video className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  Video Queue
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/instructor/roster">
                  <QrCode className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                  QR Roster
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Studio Owner Admin
              </span>
              <h2 className="text-sm font-bold">
                Revenue Charts, Classes & Events
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/admin/analytics">
                  <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  Analytics
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/admin/classes">
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  Classes
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                <Link href="/admin/events">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
                  Events Admin
                </Link>
              </Button>
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
          classCredits={user.classCredits}
          hasActiveBooking={scheduleItems.some((s) => s.userBooking !== null)}
        />
      )}

      {/* Beginner Psychological Safety & Comfort Hub */}
      <BeginnerSafetyHub />

      {/* Partner-Match Priority Waitlist & Bypass Protocol */}
      <PartnerMatchWaitlist
        userRole={user?.preferredRole ?? DanceRole.LEAD}
        userName={user?.firstName ?? "Dancer"}
      />
    </main>
  );
}
