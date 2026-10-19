"use client";

import { useMemo } from "react";
import { Users, TrendingUp, Award, DollarSign, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalyticsData {
  revenueByMonth: { month: string; amount: number }[];
  roleDistribution: { role: string; count: number; percentage: number }[];
  levelDistribution: { level: string; count: number; percentage: number }[];
  totalRevenueInPounds: number;
  totalStudents: number;
  activeBookingsCount: number;
  pendingReviewsCount: number;
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

      {/* 4 Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    <div className="absolute -top-9 opacity-0 transition-opacity group-hover:opacity-100 bg-foreground text-background text-[11px] font-bold py-1 px-2 rounded shadow pointer-events-none whitespace-nowrap">
                      £{item.amount.toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div className="w-full rounded-t-lg bg-muted flex items-end overflow-hidden h-44">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-amber-600 to-orange-500 transition-all duration-500 group-hover:brightness-110 rounded-t-lg"
                      />
                    </div>

                    <span className="mt-2 text-[11px] font-medium text-muted-foreground">
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
            <div className="h-6 w-full rounded-full overflow-hidden flex bg-muted p-1 gap-1">
              {data.roleDistribution.map((role) => {
                const colorClass =
                  role.role === "LEAD"
                    ? "bg-blue-600"
                    : role.role === "FOLLOW"
                    ? "bg-rose-500"
                    : "bg-amber-500";
                return (
                  <div
                    key={role.role}
                    style={{ width: `${role.percentage}%` }}
                    className={`${colorClass} rounded-full transition-all duration-500`}
                    title={`${role.role}: ${role.count} (${role.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Role Breakdown List */}
            <div className="space-y-3">
              {data.roleDistribution.map((role) => {
                const indicatorColor =
                  role.role === "LEAD"
                    ? "bg-blue-600"
                    : role.role === "FOLLOW"
                    ? "bg-rose-500"
                    : "bg-amber-500";
                return (
                  <div
                    key={role.role}
                    className="flex items-center justify-between text-xs rounded-lg border p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${indicatorColor}`} />
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
              const barColor =
                lvl.level === "BEGINNER"
                  ? "bg-emerald-500"
                  : lvl.level === "IMPROVER"
                  ? "bg-blue-500"
                  : lvl.level === "INTERMEDIATE"
                  ? "bg-amber-500"
                  : "bg-purple-600";

              return (
                <div key={lvl.level} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize">{lvl.level.toLowerCase()} Tier</span>
                    <span className="text-muted-foreground">
                      {lvl.count} students ({lvl.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${Math.max(lvl.percentage, 5)}%` }}
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
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
