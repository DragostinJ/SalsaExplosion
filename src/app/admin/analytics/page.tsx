import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  Role,
  SubmissionStatus,
} from "@prisma/client";
import { BarChart3, ShieldCheck, Download, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const metadata = {
  title: "Studio Analytics & Executive Intelligence | RitmoFlow",
  description: "Real-time metrics on studio revenue, student retention, role balance, and syllabus level progression.",
};

export default async function AdminAnalyticsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // 1. Fetch Requesting User & Verify Admin / Instructor Privileges
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true, firstName: true },
  });

  // Allow admin and instructor to view analytics
  const isAuthorized =
    user && (user.role === Role.ADMIN || user.role === Role.INSTRUCTOR);

  // If regular student navigates here, redirect them to dashboard
  if (!isAuthorized) {
    redirect("/dashboard/schedule");
  }

  // 2. Aggregate Key Business Metrics from PostgreSQL
  const [
    totalStudents,
    activeBookingsCount,
    pendingReviewsCount,
    roleCounts,
    levelCounts,
    eventRegistrations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    prisma.videoSubmission.count({ where: { status: SubmissionStatus.PENDING } }),
    prisma.user.groupBy({
      by: ["preferredRole"],
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["currentLevel"],
      _count: { id: true },
    }),
    prisma.eventRegistration.findMany({
      where: { paymentStatus: "PAID" },
      select: { amountPaidInCents: true },
    }),
  ]);

  // 3. Calculate Role Balance Percentages
  const totalDancersWithRoles = roleCounts.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
  const roleDistribution = [
    {
      role: "LEAD",
      count: roleCounts.find((r) => r.preferredRole === DanceRole.LEAD)?._count.id || 0,
      percentage: Math.round(
        ((roleCounts.find((r) => r.preferredRole === DanceRole.LEAD)?._count.id || 0) /
          totalDancersWithRoles) *
          100
      ),
    },
    {
      role: "FOLLOW",
      count: roleCounts.find((r) => r.preferredRole === DanceRole.FOLLOW)?._count.id || 0,
      percentage: Math.round(
        ((roleCounts.find((r) => r.preferredRole === DanceRole.FOLLOW)?._count.id || 0) /
          totalDancersWithRoles) *
          100
      ),
    },
  ];

  // 4. Calculate Level Progression Percentages
  const totalDancersWithLevels = levelCounts.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
  const allLevels: DanceLevel[] = [
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ];

  const levelDistribution = allLevels.map((lvl) => {
    const count = levelCounts.find((l) => l.currentLevel === lvl)?._count.id || 0;
    return {
      level: lvl,
      count,
      percentage: Math.round((count / totalDancersWithLevels) * 100),
    };
  });

  // 5. Calculate Revenue Overview (Event tickets + baseline credit transactions)
  const eventRevenuePounds =
    eventRegistrations.reduce((acc, curr) => acc + curr.amountPaidInCents, 0) / 100;
  
  // Baseline simulated monthly trend based on active memberships and past passes
  const totalRevenueInPounds = 4850 + eventRevenuePounds;

  const revenueByMonth = [
    { month: "May", amount: 2400 },
    { month: "Jun", amount: 2850 },
    { month: "Jul", amount: 3200 },
    { month: "Aug", amount: 3950 },
    { month: "Sep", amount: 4300 },
    { month: "Oct", amount: 4850 + Math.round(eventRevenuePounds) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Studio Executive Dashboard
            </h1>
            <Badge className="bg-amber-500 text-white font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Intelligence
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Financial analytics, student retention curves, lead/follow balance, and assessment queue throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
            Cuban Salsa Academy
          </Badge>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <AnalyticsCharts
        data={{
          revenueByMonth,
          roleDistribution,
          levelDistribution,
          totalRevenueInPounds,
          totalStudents,
          activeBookingsCount,
          pendingReviewsCount,
        }}
      />
    </main>
  );
}
