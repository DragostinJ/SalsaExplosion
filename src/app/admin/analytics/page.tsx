import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  Role,
  SubmissionStatus,
} from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ONLY } from "@/lib/auth-user";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { CsvExportToolbar } from "@/components/admin/csv-export-toolbar";
import { AuditTrailTable } from "@/components/admin/audit-trail-table";

export const metadata = {
  title: "Studio Analytics & Executive Intelligence | Salsa Explosion",
  description:
    "Real-time metrics on studio revenue, student retention, role balance, and syllabus level progression.",
};

export default async function AdminAnalyticsPage() {
  await requireRole(ADMIN_ONLY);

  // Aggregate Key Business Metrics & Audit Log from PostgreSQL
  const [
    totalStudents,
    activeBookingsCount,
    pendingReviewsCount,
    roleCounts,
    levelCounts,
    eventRegistrations,
    auditLogs,
    coachingBookings,
    merchReservations,
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
      select: { amountPaidInCents: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.privateLessonBooking.findMany({
      select: { totalPricePounds: true, status: true },
    }),
    prisma.merchReservation.findMany({
      select: { pricePounds: true, status: true },
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

  // Online revenue only (festival passes, private lessons, merch). Weekly classes are paid at the
  // door and never pass through the site, and class packs / memberships are retired.
  const eventRevenuePounds =
    eventRegistrations.reduce((acc, curr) => acc + curr.amountPaidInCents, 0) /
    100;

  const coachingRevenuePounds = coachingBookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((acc, curr) => acc + curr.totalPricePounds, 0);

  const merchRevenuePounds = merchReservations
    .filter((m) => m.status === "COLLECTED" || m.status === "RESERVED")
    .reduce((acc, curr) => acc + curr.pricePounds, 0);

  const currentMonthDynamicPounds =
    eventRevenuePounds +
    coachingRevenuePounds +
    merchRevenuePounds;

  const totalRevenueInPounds = currentMonthDynamicPounds;

  // Festival pass sales per month for the last six months, from real paid registrations
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Europe/London" });
  const monthKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Europe/London" });
  const nowForChart = new Date();
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(nowForChart.getFullYear(), nowForChart.getMonth() - (5 - i), 15);
    const key = monthKey.format(d);
    const pence = eventRegistrations
      .filter((r) => monthKey.format(r.createdAt) === key)
      .reduce((acc, r) => acc + r.amountPaidInCents, 0);
    return { month: monthLabel.format(d), amount: Math.round(pence / 100) };
  });

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
            <Badge className="bg-primary-base text-white font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Intelligence
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Financial analytics, student retention curves, lead/follow balance, and assessment queue throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
            Cuban Salsa Academy
          </Badge>
        </div>
      </div>

      {/* CSV Accountant & Data Exporter */}
      <CsvExportToolbar />

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
          coachingRevenuePounds,
          merchRevenuePounds,
        }}
      />

      {/* Immutable Forensic Audit Trail */}
      <AuditTrailTable logs={auditLogs} />
    </main>
  );
}
