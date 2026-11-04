"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarPlus,
  Sparkles,
  Users,
  ShieldCheck,
  QrCode,
  ClipboardList,
  Sun,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";

export function AdminNav() {
  const pathname = usePathname();

  // Plain words, in the order the owner needs them most
  const tabs = [
    {
      href: "/instructor",
      label: "Today",
      icon: Sun,
      active: pathname === "/instructor",
    },
    {
      href: "/instructor/roster",
      label: "Door check-in",
      icon: QrCode,
      active: pathname.startsWith("/instructor/roster"),
    },
    {
      href: "/admin/classes",
      label: "Classes",
      icon: CalendarPlus,
      active: pathname.startsWith("/admin/classes"),
    },
    {
      href: "/admin/events",
      label: "Festivals & tickets",
      icon: Sparkles,
      active: pathname.startsWith("/admin/events"),
    },
    {
      href: "/admin/operations",
      label: "Lesson requests & shop",
      icon: ClipboardList,
      active: pathname.startsWith("/admin/operations"),
    },
    {
      href: "/instructor/students",
      label: "Students",
      icon: Users,
      active: pathname.startsWith("/instructor/students"),
    },
    {
      href: "/admin/analytics",
      label: "Numbers",
      icon: BarChart3,
      active: pathname.startsWith("/admin/analytics"),
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton fallbackUrl="/classes" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/15 text-amber-300 font-extrabold px-3 py-1 flex items-center gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          Studio owner
        </Badge>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 p-2 shadow-xs overflow-x-auto no-scrollbar sm:flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
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
