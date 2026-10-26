"use client";

import { AlertTriangle } from "lucide-react";
import { ClassRosterSummary } from "@/lib/constants/management";

interface RosterBalanceMetersProps {
  activeClass: ClassRosterSummary;
}

export function RosterBalanceMeters({ activeClass }: RosterBalanceMetersProps) {
  const leadDiff = Math.abs(activeClass.checkedInLeads - activeClass.checkedInFollows);

  return (
    <div className="space-y-4">
      {/* Live Lead / Follow Floor Balance Meters */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-blue-500/[0.04] border-blue-500/20 p-3.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-400 uppercase tracking-wider">
              Leads on Dance Floor
            </span>
            <span className="font-bold">
              {activeClass.checkedInLeads} Checked In /{" "}
              {activeClass.confirmedLeads} Booked
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (activeClass.checkedInLeads /
                      Math.max(activeClass.confirmedLeads, 1)) *
                      100
                  )
                )}%`,
              }}
              className="h-full bg-blue-600 rounded-full transition-all"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-rose-500/[0.04] border-rose-500/20 p-3.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-400 uppercase tracking-wider">
              Follows on Dance Floor
            </span>
            <span className="font-bold">
              {activeClass.checkedInFollows} Checked In /{" "}
              {activeClass.confirmedFollows} Booked
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (activeClass.checkedInFollows /
                      Math.max(activeClass.confirmedFollows, 1)) *
                      100
                  )
                )}%`,
              }}
              className="h-full bg-rose-500 rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Live Floor-Ratio Imbalance Callout */}
      {leadDiff >= 3 && (
        <div
          data-testid="floor-imbalance-callout"
          className="rounded-2xl border border-amber-400 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-200 font-bold"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              ⚠️ Partner Imbalance: {leadDiff} more{" "}
              {activeClass.checkedInLeads > activeClass.checkedInFollows ? "Lead" : "Follow"}s
              checked in than{" "}
              {activeClass.checkedInLeads > activeClass.checkedInFollows ? "Follow" : "Lead"}s
              on the floor
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80">
            Tip: Rotate partners frequently or invite assistant instructors
          </span>
        </div>
      )}
    </div>
  );
}
