"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Video,
  QrCode,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Music,
  Flame,
  Image as ImageIcon,
  CheckSquare,
  Sun,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";

export function InstructorNav() {
  const pathname = usePathname();

  // Plain words, in the order teachers need them most
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
      href: "/instructor/moves",
      label: "Moves to check",
      icon: CheckSquare,
      active: pathname.startsWith("/instructor/moves"),
    },
    {
      href: "/instructor/submissions",
      label: "Video assessments",
      icon: Video,
      active: pathname.startsWith("/instructor/submissions"),
    },
    {
      href: "/instructor/students",
      label: "Students",
      icon: Users,
      active: pathname.startsWith("/instructor/students"),
    },
    {
      href: "/cartel",
      label: "Instagram posters",
      icon: ImageIcon,
      active: pathname.startsWith("/cartel"),
    },
    {
      href: "/instructor/practice-insights",
      label: "What dancers practise",
      icon: Flame,
      active: pathname.startsWith("/instructor/practice-insights"),
    },
    {
      href: "/instructor/song-maps",
      label: "Song timings",
      icon: Music,
      active: pathname.startsWith("/instructor/song-maps"),
    },
    {
      href: "/instructor/ai-studio",
      label: "AI tools",
      icon: Sparkles,
      active: pathname.startsWith("/instructor/ai-studio"),
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
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Teachers
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
