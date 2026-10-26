"use client";

import { CalendarPlus, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrivateBookingItem } from "./types";

interface CoachingRequestsTabProps {
  privateBookings: PrivateBookingItem[];
  pendingCoachingCount: number;
  isPending: boolean;
  onUpdateBooking: (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => void;
}

export function CoachingRequestsTab({
  privateBookings,
  pendingCoachingCount,
  isPending,
  onUpdateBooking,
}: CoachingRequestsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          Private Lesson & Coaching Queue ({privateBookings.length})
        </h3>
        <span className="text-xs text-muted-foreground">
          {pendingCoachingCount} pending confirmation
        </span>
      </div>

      {privateBookings.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
          <CalendarPlus className="mx-auto h-8 w-8 opacity-40 mb-2" />
          <p className="text-sm">No 1-on-1 private lesson requests received yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {privateBookings.map((b) => {
            const isPendingStatus = b.status === "PENDING";
            const isConfirmed = b.status === "CONFIRMED";
            return (
              <Card key={b.id} className="rounded-2xl border shadow-xs overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {b.student.firstName} {b.student.lastName}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">{b.student.email}</p>
                    </div>
                    <Badge
                      className={`text-[10px] font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : b.status === "COMPLETED"
                          ? "bg-muted text-muted-foreground"
                          : b.status === "CANCELLED"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {b.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-3 text-xs">
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Instructor:</span>
                      <span className="font-semibold text-foreground">{b.instructorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Focus Topic:</span>
                      <span className="font-semibold text-foreground">{b.focusTopic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-semibold text-foreground">
                        {b.packageType === "BLOCK_5HR" ? "5-Hour Intensive" : "1-Hour Focus"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Time:</span>
                      <span className="font-semibold text-foreground">{b.preferredSlot}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Price:</span>
                      <span className="font-bold text-foreground">£{b.totalPricePounds}.00</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {isPendingStatus && (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => onUpdateBooking(b.id, "CONFIRMED")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Confirm
                      </Button>
                    )}
                    {isConfirmed && (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => onUpdateBooking(b.id, "COMPLETED")}
                        className="flex-1 bg-primary-base hover:bg-primary-base/90 text-white text-[11px] h-8 font-bold"
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Completed
                      </Button>
                    )}
                    {(isPendingStatus || isConfirmed) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onUpdateBooking(b.id, "CANCELLED")}
                        className="text-rose-600 hover:text-rose-700 border-rose-800 text-[11px] h-8 px-2 font-bold"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
