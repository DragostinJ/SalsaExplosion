"use client";

import { useMemo } from "react";
import { Users, TrendingUp, Award, DollarSign, Download, CalendarPlus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CHART_PALETTE } from "@/lib/chart-palette";

interface AnalyticsData {
  revenueByMonth: { month: string; amount: number }[];
  roleDistribution: { role: string; count: number; percentage: number }[];
  levelDistribution: { level: string; count: number; percentage: number }[];
  totalRevenueInPounds: number;
  totalStudents: number;
  activeBookingsCount: number;
  pendingReviewsCount: number;
  coachingRevenuePounds?: number;
  merchRevenuePounds?: number;
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.revenueByMonth.map((m) => m.amount), 1);
  }, [data.revenueByMonth]);

  const handleExportCsv = () => {
    const rows = [
      ["Metric Category", "Label", "Value", "Share (%)"],
      ["Summary", "Total Revenue (GBP)", data.totalRevenueInPounds.toFixed(2), "100%"],
      ["Summary", "Enrolled Students", String(data.totalStudents), "-"],
      ["Summary", "Active Class Bookings", String(data.activeBookingsCount), "-"],
      ["Summary", "Pending Video Assessments", String(data.pendingReviewsCount), "-"],
      ...data.revenueByMonth.map((m) => ["Monthly Revenue", m.month, String(m.amount), "-"]),
      ...data.roleDistribution.map((r) => ["Partner Role", r.role, String(r.count), `${r.percentage}%`]),
      ...data.levelDistribution.map((l) => ["Syllabus Tier", l.level, String(l.count), `${l.percentage}%`]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "salsa-explosion-studio-analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="text-xs font-semibold"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export Studio CSV Report
        </Button>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              £{data.totalRevenueInPounds.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across credit packs, subs & events
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Enrolled Students
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.totalStudents}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active registered dancers
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Bookings
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.activeBookingsCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Class spots confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Assessments
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.pendingReviewsCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technique videos in review queue
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Coaching Pipeline
            </CardTitle>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
              <CalendarPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              £{(data.coachingRevenuePounds ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              1-on-1 private lessons & intensives
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Merch Desk Sales
            </CardTitle>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              £{(data.merchRevenuePounds ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Click & collect hoodies, tees & shoes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Monthly Revenue Bar Chart (4 Cols) */}
        <Card className="lg:col-span-4 border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Revenue & Ticket Volume</CardTitle>
                <CardDescription className="text-xs">
                  Monthly cash collection and subscription earnings
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                +18.4% vs last mo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex h-56 items-end gap-3 sm:gap-6 pt-6 pb-2">
              {data.revenueByMonth.map((item) => {
                const heightPercent = Math.max(
                  Math.round((item.amount / maxRevenue) * 100),
                  12
                );

                return (
                  <div key={item.month} className="group relative flex flex-1 flex-col items-center">
                    {/* Tooltip */}
                    <div
                      style={{
                        backgroundColor: CHART_PALETTE.tooltipBg,
                        borderColor: CHART_PALETTE.tooltipBorder,
                        color: CHART_PALETTE.text,
                      }}
                      className="absolute -top-9 opacity-0 transition-opacity group-hover:opacity-100 text-[11px] font-bold py-1 px-2.5 rounded-lg border shadow-lg pointer-events-none whitespace-nowrap"
                    >
                      £{item.amount.toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div className="w-full rounded-t-lg bg-surface-3 flex items-end overflow-hidden h-44">
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: CHART_PALETTE.brand,
                        }}
                        className="w-full transition-all duration-500 group-hover:brightness-110 rounded-t-lg"
                      />
                    </div>

                    <span className="mt-2 text-[11px] font-medium text-stone-400">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lead vs Follow Balance Donut / Ratio (3 Cols) */}
        <Card className="lg:col-span-3 border shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Dance Role Balance</CardTitle>
            <CardDescription className="text-xs">
              Lead vs. Follow distribution across all enrolled students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Balance Bar */}
            <div className="h-6 w-full rounded-full overflow-hidden flex bg-surface-3 p-1 gap-1">
              {data.roleDistribution.map((role) => {
                const roleColor =
                  role.role === "LEAD"
                    ? CHART_PALETTE.teal
                    : role.role === "FOLLOW"
                    ? CHART_PALETTE.rose
                    : CHART_PALETTE.gold;
                return (
                  <div
                    key={role.role}
                    style={{ width: `${role.percentage}%`, backgroundColor: roleColor }}
                    className="rounded-full transition-all duration-500"
                    title={`${role.role}: ${role.count} (${role.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Role Breakdown List */}
            <div className="space-y-3">
              {data.roleDistribution.map((role) => {
                const roleColor =
                  role.role === "LEAD"
                    ? CHART_PALETTE.teal
                    : role.role === "FOLLOW"
                    ? CHART_PALETTE.rose
                    : CHART_PALETTE.gold;
                return (
                  <div
                    key={role.role}
                    className="flex items-center justify-between text-xs rounded-xl border border-line bg-surface-2 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: roleColor }}
                      />
                      <span className="font-semibold capitalize">{role.role.toLowerCase()}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{role.count} dancers</span>
                      <span className="text-muted-foreground">({role.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuban Salsa Syllabus Progression Funnel */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Cuban Salsa Level Progression Funnel
          </CardTitle>
          <CardDescription className="text-xs">
            Distribution of dancers through the 4-tier Cuban Casino & Rueda syllabus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.levelDistribution.map((lvl) => {
              const levelColor =
                lvl.level === "BEGINNER"
                  ? CHART_PALETTE.emerald
                  : lvl.level === "IMPROVER"
                  ? CHART_PALETTE.teal
                  : lvl.level === "INTERMEDIATE"
                  ? CHART_PALETTE.gold
                  : CHART_PALETTE.brand;

              return (
                <div key={lvl.level} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize">{lvl.level.toLowerCase()} Tier</span>
                    <span className="text-muted-foreground">
                      {lvl.count} students ({lvl.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(lvl.percentage, 5)}%`,
                        backgroundColor: levelColor,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
