"use client";

import { CheckCircle2, Users, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WaitlistItem } from "./types";

interface PartnerWaitlistTabProps {
  waitlistEntries: WaitlistItem[];
  waitingWaitlistCount: number;
  waitingLeadsCount: number;
  waitingFollowsCount: number;
  isPending: boolean;
  onAutoPairWaitlist: () => void;
  onUpdateWaitlist: (waitlistId: string, status: "PAIRED" | "CANCELLED") => void;
}

export function PartnerWaitlistTab({
  waitlistEntries,
  waitingWaitlistCount,
  waitingLeadsCount,
  waitingFollowsCount,
  isPending,
  onAutoPairWaitlist,
  onUpdateWaitlist,
}: PartnerWaitlistTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Partner Waitlist Queue ({waitlistEntries.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            {waitingWaitlistCount} dancers waiting for role balance pairing
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={isPending || waitingLeadsCount === 0 || waitingFollowsCount === 0}
          onClick={onAutoPairWaitlist}
          data-testid="auto-pair-waitlist-btn"
          className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-xs shadow-xs h-8 self-start sm:self-auto"
        >
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          ⚡ Auto-Pair Waiting Lead + Follow
        </Button>
      </div>

      {waitlistEntries.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
          <Users className="mx-auto h-8 w-8 opacity-40 mb-2" />
          <p className="text-sm">No dancers currently on the partner waitlist.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {waitlistEntries.map((w) => {
            const isWaiting = w.status === "WAITING";
            return (
              <Card key={w.id} className="rounded-2xl border shadow-xs overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {w.user.firstName} {w.user.lastName}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">{w.user.email}</p>
                    </div>
                    <Badge
                      className={`text-[10px] font-bold ${
                        w.status === "PAIRED" || w.status === "NOTIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : w.status === "CANCELLED"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {w.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-3 text-xs">
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Registered Role:</span>
                      <span className="font-bold text-foreground">{w.role}</span>
                    </div>
                    {w.partnerEmail && (
                      <div className="flex justify-between">
                        <span>Preferred Partner:</span>
                        <span className="font-medium text-foreground">{w.partnerEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Joined Queue:</span>
                      <span className="font-medium text-foreground">
                        {new Date(w.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>

                  {isWaiting && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => onUpdateWaitlist(w.id, "PAIRED")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Confirm Paired
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onUpdateWaitlist(w.id, "CANCELLED")}
                        className="text-rose-600 hover:text-rose-700 border-rose-800 text-[11px] h-8 px-2 font-bold"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
