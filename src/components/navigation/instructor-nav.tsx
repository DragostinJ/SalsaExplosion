"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Video,
  QrCode,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";

export function InstructorNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/instructor/students",
      label: "Student Progression & Credits",
      icon: Users,
      active: pathname.startsWith("/instructor/students"),
    },
    {
      href: "/instructor/submissions",
      label: "Video Assessments Queue",
      icon: Video,
      active: pathname.startsWith("/instructor/submissions"),
    },
    {
      href: "/instructor/roster",
      label: "Live Class Roster & QR Check-In",
      icon: QrCode,
      active: pathname.startsWith("/instructor/roster"),
    },
    {
      href: "/admin/analytics",
      label: "Studio Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin/analytics"),
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Instructor & Teaching Desk Portal
        </Badge>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 p-2 shadow-xs overflow-x-auto no-scrollbar sm:flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                tab.active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border font-bold"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  tab.active ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
