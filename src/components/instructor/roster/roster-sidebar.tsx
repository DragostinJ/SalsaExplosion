"use client";

import { ClassRosterSummary } from "@/lib/constants/management";
import { Badge } from "@/components/ui/badge";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";

interface RosterSidebarProps {
  classes: ClassRosterSummary[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
}

export function RosterSidebar({
  classes,
  activeClassId,
  onSelectClass,
}: RosterSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
        Select Studio Session ({classes.length})
      </h2>
      <div className="space-y-2.5">
        {classes.map((cls) => {
          const isSelected = cls.id === activeClassId;
          const formattedDate = new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(cls.startTime));

          const totalCheckedIn = cls.checkedInLeads + cls.checkedInFollows;
          const totalBooked = cls.bookings.length;

          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onSelectClass(cls.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-500/[0.06] shadow-sm ring-1 ring-amber-500/40"
                  : "bg-card hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {cls.minLevel}
                </Badge>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {totalCheckedIn}/{totalBooked} Checked In
                </span>
              </div>
              <h3 className="text-sm font-bold line-clamp-1">{cls.title}</h3>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{formattedDate}</span>
                <span className="flex items-center gap-1">
                  <TeacherAvatar
                    name={cls.instructorName}
                    avatarUrl={cls.instructorAvatarUrl}
                    size="xs"
                    showBadge={false}
                  />
                  <span>{cls.room}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
