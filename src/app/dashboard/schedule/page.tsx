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
  CreditCard,
  ShieldCheck,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchedulePageProps {
  searchParams: Promise<{
    style?: string;
    level?: string;
    checkout?: string;
    pkg?: string;
  }>;
}

const VALID_STYLES = new Set<string>(Object.values(DanceStyle));
const VALID_LEVELS = new Set<string>(Object.values(DanceLevel));

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
  const scheduleItems: ClassScheduleItem[] = upcomingClasses.map((session) => {
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
            🎉 Pass activated! Your studio wallet has been updated ({user?.classCredits ?? 0} credits available). Select any class below to book your spot!
          </span>
          <Link href="/dashboard/schedule" className="underline ml-4 text-xs">
            Dismiss
          </Link>
        </div>
      )}

      {/* Guest Welcome Banner */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-background to-rose-500/10 p-4 sm:p-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-base text-white font-bold text-xs">
                🎁 First-Time Visitor Offer
              </Badge>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                1 Complimentary Welcome Class Credit
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground font-bold">
              Browse live Bournemouth classes below. No partner required — partner rotations are 100% ratio balanced!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs">
              <Link href="/sign-up">Claim Free Pass</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Header & Student Wallet / Progression Status Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Class Schedule
            </h1>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
              BOH Studios Bournemouth
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {user
              ? "Book your spot in upcoming Cuban Salsa (Casino & Rueda de Casino) classes."
              : "Live timetable. Select any class below to see Lead & Follow availability."}
          </p>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Level:</span>
              <Badge variant="secondary" className="font-bold">
                {user.currentLevel}
              </Badge>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium">
              {hasActiveSubscription ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Unlimited Member
                  </span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Credits:</span>
                  <Badge variant="default">{user.classCredits}</Badge>
                  <Link
                    href="/pricing"
                    className="ml-1 text-primary underline-offset-4 hover:underline"
                  >
                    Buy Pass
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <Button asChild size="sm" variant="outline" className="font-semibold text-xs border-primary-base/40 text-primary-hover">
            <Link href="/pricing">View Class Passes & Drop-ins →</Link>
          </Button>
        )}
      </div>

      {/* URL Search Param Filter Bar (Right at the Top!) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 max-w-full">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filter Classes:
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
                query: { ...(styleFilter ? { style: styleFilter } : {}) },
              }}
            >
              All Levels ({upcomingClasses.length})
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

      {/* Responsive Class Schedule Grid — Top of the page! */}
      {scheduleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-base font-medium">
            No upcoming classes match your selected filters.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing your style or level filters to view the full timetable.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dashboard/schedule">Reset Filters</Link>
          </Button>
        </div>
      ) : (
        <div
          id="schedule-classes-grid"
          data-testid="schedule-classes-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {scheduleItems.map((session) => (
            <ClassScheduleCard
              key={session.id}
              session={session}
              student={studentContext}
            />
          ))}
        </div>
      )}

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

          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
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
