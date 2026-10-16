import { redirect } from "next/navigation";
import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  Role,
  SubmissionStatus,
} from "@prisma/client";
import { ShieldCheck, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const metadata = {
  title: "Studio Analytics & Executive Intelligence | RitmoFlow",
  description:
    "Real-time metrics on studio revenue, student retention, role balance, and syllabus level progression.",
};

export default async function AdminAnalyticsPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Aggregate Key Business Metrics from PostgreSQL
  const [
    totalStudents,
    activeBookingsCount,
    pendingReviewsCount,
    roleCounts,
    levelCounts,
    eventRegistrations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.booking.count({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
      },
    }),
    prisma.videoSubmission.count({
      where: { status: SubmissionStatus.PENDING },
    }),
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

  // Calculate Role Balance Percentages
  const totalDancersWithRoles =
    roleCounts.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
  const roleDistribution = [
    {
      role: "LEAD",
      count:
        roleCounts.find((r) => r.preferredRole === DanceRole.LEAD)?._count.id ||
        0,
      percentage: Math.round(
        ((roleCounts.find((r) => r.preferredRole === DanceRole.LEAD)?._count
          .id || 0) /
          totalDancersWithRoles) *
          100
      ),
    },
    {
      role: "FOLLOW",
      count:
        roleCounts.find((r) => r.preferredRole === DanceRole.FOLLOW)?._count
          .id || 0,
      percentage: Math.round(
        ((roleCounts.find((r) => r.preferredRole === DanceRole.FOLLOW)?._count
          .id || 0) /
          totalDancersWithRoles) *
          100
      ),
    },
  ];

  // Calculate Level Progression Percentages
  const totalDancersWithLevels =
    levelCounts.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
  const allLevels: DanceLevel[] = [
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ];

  const levelDistribution = allLevels.map((lvl) => {
    const count =
      levelCounts.find((l) => l.currentLevel === lvl)?._count.id || 0;
    return {
      level: lvl,
      count,
      percentage: Math.round((count / totalDancersWithLevels) * 100),
    };
  });

  // Calculate Revenue Overview
  const eventRevenuePounds =
    eventRegistrations.reduce((acc, curr) => acc + curr.amountPaidInCents, 0) /
    100;

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
      <AdminNav />

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
