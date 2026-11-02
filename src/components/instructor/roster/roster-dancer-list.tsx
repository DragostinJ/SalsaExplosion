"use client";

import { useState } from "react";
import { BookingStatus, DanceRole } from "@prisma/client";
import { CheckCircle2, Search, UserCheck, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClassRosterSummary } from "@/lib/constants/management";

interface RosterDancerListProps {
  activeClass: ClassRosterSummary;
  filteredBookings: ClassRosterSummary["bookings"];
  awaitingBookings: ClassRosterSummary["bookings"];
  searchQuery: string;
  filterRole: "ALL" | "AWAITING" | "CHECKED_IN" | "LEAD" | "FOLLOW";
  isPending: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: "ALL" | "AWAITING" | "CHECKED_IN" | "LEAD" | "FOLLOW") => void;
  onCheckInAllRemaining: () => void;
  onToggleCheckIn: (classId: string, bookingId: string, currentlyAttended: boolean) => void;
  onRedeemFreeClass?: (bookingId: string) => void;
}

export function RosterDancerList({
  activeClass,
  filteredBookings,
  awaitingBookings,
  searchQuery,
  filterRole,
  isPending,
  onSearchChange,
  onFilterChange,
  onCheckInAllRemaining,
  onToggleCheckIn,
  onRedeemFreeClass,
}: RosterDancerListProps) {
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);
  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1">
        <span>Enrolled Dancers ({activeClass.bookings.length})</span>
        {awaitingBookings.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="check-in-all-remaining-btn"
            disabled={isPending}
            onClick={onCheckInAllRemaining}
            className="text-xs font-bold border-amber-500/50 text-amber-300 hover:bg-amber-500/10 h-8 self-start sm:self-auto"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Check In All Remaining ({awaitingBookings.length})
          </Button>
        )}
      </div>

      {/* Instant Search Bar & Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            data-testid="roster-search-input"
            placeholder="Search by dancer first name, last name, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => onFilterChange("ALL")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              filterRole === "ALL"
                ? "bg-foreground text-background shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({activeClass.bookings.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("AWAITING")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              filterRole === "AWAITING"
                ? "bg-warning text-stone-950 shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Awaiting Arrival ({awaitingBookings.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("CHECKED_IN")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              filterRole === "CHECKED_IN"
                ? "bg-success text-stone-950 shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Checked In ({activeClass.checkedInLeads + activeClass.checkedInFollows})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("LEAD")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              filterRole === "LEAD"
                ? "bg-role-lead text-stone-950 shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Leads ({activeClass.bookings.filter((b) => b.danceRole === DanceRole.LEAD).length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("FOLLOW")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              filterRole === "FOLLOW"
                ? "bg-role-follow text-stone-950 shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Follows ({activeClass.bookings.filter((b) => b.danceRole === DanceRole.FOLLOW).length})
          </button>
        </div>
      </div>

      {activeClass.bookings.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-xs text-muted-foreground">
          No bookings for this session yet.
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
          No dancers match your current search or filter query.
        </div>
      ) : (
        filteredBookings.map((booking) => {
          const isAttended = booking.status === BookingStatus.ATTENDED;

          return (
            <div
              key={booking.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                isAttended
                  ? "border-success-line bg-success-soft"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    isAttended
                      ? "bg-success text-stone-950 font-black"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {booking.firstName[0]}
                  {booking.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {booking.firstName} {booking.lastName}
                    </span>
                    <Badge
                      className={
                        booking.danceRole === DanceRole.LEAD
                          ? "bg-role-lead text-stone-950 font-bold text-xs"
                          : "bg-role-follow text-stone-950 font-bold text-xs"
                      }
                    >
                      {booking.danceRole}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {booking.currentLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {booking.freeClassRedeemed ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled
                    data-testid={`free-class-redeemed-${booking.id}`}
                    className="border-2 border-ink/40 bg-paper text-ink/70 font-bold text-xs min-h-[40px] rounded-none opacity-80"
                  >
                    Free class used ✓
                  </Button>
                ) : (booking.classCredits ?? 0) > 0 ? (
                  confirmingBookingId === booking.id ? (
                    <div className="flex items-center gap-1.5 border-2 border-ink bg-poster-mustard p-1 shadow-[2px_2px_0_var(--color-ink)]">
                      <span className="text-xs font-bold text-ink px-1">
                        Use 1 free class for {booking.firstName}?
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending}
                        data-testid={`confirm-redeem-${booking.id}`}
                        onClick={() => {
                          onRedeemFreeClass?.(booking.id);
                          setConfirmingBookingId(null);
                        }}
                        className="bg-poster-red hover:bg-ink text-ink hover:text-paper border-2 border-ink font-black text-xs min-h-[36px] px-2 rounded-none"
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setConfirmingBookingId(null)}
                        className="bg-paper hover:bg-muted text-ink border-2 border-ink font-bold text-xs min-h-[36px] px-2 rounded-none"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-2 border-ink bg-poster-mustard text-ink font-bold text-xs px-2 py-0.5 rounded-none"
                      >
                        Free class: {booking.classCredits}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending}
                        data-testid={`use-free-class-btn-${booking.id}`}
                        onClick={() => setConfirmingBookingId(booking.id)}
                        className="border-2 border-ink bg-poster-mustard hover:bg-ink text-ink hover:text-paper font-bold text-xs min-h-[40px] px-3 shadow-[2px_2px_0_var(--color-ink)] rounded-none"
                      >
                        Use free class
                      </Button>
                    </div>
                  )
                ) : null}

                <Button
                  type="button"
                  size="sm"
                  variant={isAttended ? "secondary" : "default"}
                  disabled={isPending}
                  onClick={() =>
                    onToggleCheckIn(
                      activeClass.id,
                      booking.id,
                      isAttended
                    )
                  }
                  className={
                    isAttended
                      ? "border-success-line bg-success-soft text-success font-bold text-xs"
                      : "bg-primary text-primary-foreground text-xs font-semibold"
                  }
                >
                  {isAttended ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Checked In ✓
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                      Mark Attended
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
