import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  DanceStyle,
  Role,
  SubscriptionStatus,
} from "@prisma/client";
import { Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ClassScheduleCard,
  ClassScheduleItem,
  StudentContext,
} from "@/components/schedule/class-schedule-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchedulePageProps {
  searchParams: Promise<{
    style?: string;
    level?: string;
  }>;
}

const VALID_STYLES = new Set<string>(Object.values(DanceStyle));
const VALID_LEVELS = new Set<string>(Object.values(DanceLevel));

export default async function StudentSchedulePage({
  searchParams,
}: SchedulePageProps) {
  // 1. Authenticate Request
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // 2. Await Next.js 15 Async searchParams
  const resolvedParams = await searchParams;
  const styleFilter =
    resolvedParams.style && VALID_STYLES.has(resolvedParams.style)
      ? (resolvedParams.style as DanceStyle)
      : undefined;

  const levelFilter =
    resolvedParams.level && VALID_LEVELS.has(resolvedParams.level)
      ? (resolvedParams.level as DanceLevel)
      : undefined;

  // 3. Fetch Student Profile & Subscription State (with auto-provision fallback)
  let user = await prisma.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses[0]?.emailAddress || `${clerkId}@example.com`;

    user = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        firstName: clerkUser?.firstName || "Salsero",
        lastName: clerkUser?.lastName || "Dancer",
        role: Role.STUDENT,
        currentLevel: DanceLevel.BEGINNER,
        preferredRole: DanceRole.LEAD,
        classCredits: 1,
      },
      include: { subscription: true },
    });
  }

  const now = new Date();
  const hasActiveSubscription =
    user.subscription !== null &&
    user.subscription.status === SubscriptionStatus.ACTIVE &&
    user.subscription.currentPeriodEnd > now;

  const studentContext: StudentContext = {
    currentLevel: user.currentLevel,
    preferredRole: user.preferredRole,
    classCredits: user.classCredits,
    hasActiveSubscription,
  };

  // 4. Query Upcoming Classes with Active Bookings for Role Tallies
  const upcomingClasses = await prisma.classSession.findMany({
    where: {
      startTime: { gt: now },
      isCancelled: false,
      ...(styleFilter ? { style: styleFilter } : {}),
      ...(levelFilter ? { minLevel: levelFilter } : {}),
    },
    orderBy: { startTime: "asc" },
    take: 36,
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      bookings: {
        where: { status: BookingStatus.CONFIRMED },
        select: {
          id: true,
          userId: true,
          danceRole: true,
        },
      },
    },
  });

  // 5. Transform Database Records into Serializable Client Props
  const scheduleItems: ClassScheduleItem[] = upcomingClasses.map((session) => {
    let currentLeadsCount = 0;
    let currentFollowsCount = 0;
    let userBooking: { id: string; danceRole: DanceRole } | null = null;

    for (const b of session.bookings) {
      if (b.danceRole === DanceRole.LEAD) currentLeadsCount++;
      if (b.danceRole === DanceRole.FOLLOW) currentFollowsCount++;
      if (b.userId === user.id) {
        userBooking = { id: b.id, danceRole: b.danceRole };
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

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Student Wallet / Progression Status Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Class Schedule
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book your spot in upcoming Cuban Salsa (Casino & Rueda de Casino) classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3.5 py-2 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Unlocked Level:</span>
            <Badge variant="secondary" className="font-bold">
              {user.currentLevel}
            </Badge>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3.5 py-2 text-xs font-medium">
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
      </div>

      {/* URL Search Param Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            Cuban Salsa & Rueda de Casino
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Level:
          </span>
          <Button
            asChild
            variant={!levelFilter ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
          >
            <Link
              href={{
                pathname: "/dashboard/schedule",
                query: { ...(styleFilter ? { style: styleFilter } : {}) },
              }}
            >
              All Levels
            </Link>
          </Button>
          {Object.values(DanceLevel).map((level) => (
            <Button
              key={level}
              asChild
              variant={levelFilter === level ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs"
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

      {/* Responsive Class Schedule Grid */}
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scheduleItems.map((session) => (
            <ClassScheduleCard
              key={session.id}
              session={session}
              student={studentContext}
            />
          ))}
        </div>
      )}
    </main>
  );
}
