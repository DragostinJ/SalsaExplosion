"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookingStatus, DanceRole } from "@prisma/client";
import {
  QrCode,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  ExternalLink,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toggleBookingCheckInAction } from "@/actions/management.actions";
import { ClassRosterSummary } from "@/lib/constants/management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClassRosterWorkspaceProps {
  initialClasses: ClassRosterSummary[];
}

export function ClassRosterWorkspace({
  initialClasses,
}: ClassRosterWorkspaceProps) {
  const [classes, setClasses] = useState<ClassRosterSummary[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClasses[0]?.id ?? ""
  );
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeClass =
    classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null;

  const handleToggleCheckIn = (
    classId: string,
    bookingId: string,
    currentlyAttended: boolean
  ) => {
    const nextAttended = !currentlyAttended;
    setStatusMessage(null);

    startTransition(async () => {
      const res = await toggleBookingCheckInAction({
        bookingId,
        markAttended: nextAttended,
      });

      if (res.success) {
        setClasses((prev) =>
          prev.map((cls) => {
            if (cls.id !== classId) return cls;
            const updatedBookings = cls.bookings.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    status: res.data.status,
                    checkedInAt: nextAttended ? new Date().toISOString() : null,
                  }
                : b
            );

            const checkedInLeads = updatedBookings.filter(
              (b) =>
                b.danceRole === DanceRole.LEAD &&
                b.status === BookingStatus.ATTENDED
            ).length;
            const checkedInFollows = updatedBookings.filter(
              (b) =>
                b.danceRole === DanceRole.FOLLOW &&
                b.status === BookingStatus.ATTENDED
            ).length;

            return {
              ...cls,
              checkedInLeads,
              checkedInFollows,
              bookings: updatedBookings,
            };
          })
        );
        setStatusMessage(res.message);
      }
    });
  };

  if (!activeClass) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-bold">No Active Classes Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create a class session in the Admin Class Manager to view its live roster.
          </p>
        </CardContent>
      </Card>
    );
  }

  const checkInPath = `/checkin/${activeClass.id}`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Sidebar: Class Session Selector (4 Cols) */}
      <div className="lg:col-span-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Select Studio Session ({classes.length})
        </h2>
        <div className="space-y-2.5">
          {classes.map((cls) => {
            const isSelected = cls.id === activeClass.id;
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
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setStatusMessage(null);
                }}
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
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {totalCheckedIn}/{totalBooked} Checked In
                  </span>
                </div>
                <h3 className="text-sm font-bold line-clamp-1">{cls.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{formattedDate}</span>
                  <span>{cls.room}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Area: Live Roster & QR Check-in Desk (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Session Header & QR Trigger */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white">
                    {activeClass.minLevel}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeClass.room} • Instructor: {activeClass.instructorName}
                  </span>
                </div>
                <CardTitle className="mt-2 text-xl font-extrabold">
                  {activeClass.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Check dancers in as they arrive at the door or display the class QR code for self-service check-in.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => setShowQrModal((prev) => !prev)}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs font-semibold"
                >
                  <QrCode className="mr-1.5 h-4 w-4" />
                  {showQrModal ? "Hide Door QR Code" : "Display Door QR Code"}
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={checkInPath}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Student View
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Live Lead / Follow Floor Balance Meters */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-blue-500/[0.04] border-blue-500/20 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">
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
                  <span className="text-rose-600 dark:text-rose-400 uppercase tracking-wider">
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

            {/* Expandable Studio Door QR Code Display */}
            {showQrModal && (
              <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/[0.03] p-6 text-center space-y-4">
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/10">
                  {/* Stylized deterministic QR Matrix SVG */}
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full text-black"
                    fill="currentColor"
                  >
                    {/* Corner Finder Patterns */}
                    <path d="M5,5 h28 v28 h-28 z M11,11 v16 h16 v-16 z M15,15 h8 v8 h-8 z" />
                    <path d="M67,5 h28 v28 h-28 z M73,11 v16 h16 v-16 z M77,15 h8 v8 h-8 z" />
                    <path d="M5,67 h28 v28 h-28 z M11,73 v16 h16 v-16 z M15,77 h8 v8 h-8 z" />
                    {/* Data Matrix Modules */}
                    <rect x="39" y="7" width="6" height="6" />
                    <rect x="51" y="7" width="6" height="6" />
                    <rect x="45" y="15" width="6" height="12" />
                    <rect x="39" y="33" width="12" height="6" />
                    <rect x="57" y="33" width="6" height="12" />
                    <rect x="9" y="41" width="12" height="6" />
                    <rect x="27" y="45" width="6" height="12" />
                    <rect x="43" y="45" width="12" height="12" />
                    <rect x="65" y="43" width="6" height="6" />
                    <rect x="79" y="41" width="14" height="6" />
                    <rect x="71" y="53" width="12" height="6" />
                    <rect x="39" y="65" width="6" height="14" />
                    <rect x="53" y="69" width="12" height="6" />
                    <rect x="73" y="67" width="6" height="18" />
                    <rect x="85" y="75" width="8" height="16" />
                    <rect x="45" y="85" width="18" height="6" />
                  </svg>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold">
                    Scan at Studio Desk to Check In
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Point phone camera or visit{" "}
                    <Link
                      href={checkInPath}
                      className="font-mono font-bold text-amber-600 underline"
                    >
                      {checkInPath}
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {statusMessage}
              </div>
            )}

            {/* Enrolled Dancers List */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1">
                <span>Enrolled Dancers ({activeClass.bookings.length})</span>
                <span>Door Attendance Status</span>
              </div>

              {activeClass.bookings.length === 0 ? (
                <div className="rounded-xl border p-8 text-center text-xs text-muted-foreground">
                  No bookings for this session yet.
                </div>
              ) : (
                activeClass.bookings.map((booking) => {
                  const isAttended = booking.status === BookingStatus.ATTENDED;

                  return (
                    <div
                      key={booking.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                        isAttended
                          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                            isAttended
                              ? "bg-emerald-600 text-white"
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
                                  ? "bg-blue-600 text-white text-[10px]"
                                  : "bg-rose-500 text-white text-[10px]"
                              }
                            >
                              {booking.danceRole}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {booking.currentLevel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {booking.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={isAttended ? "secondary" : "default"}
                          disabled={isPending}
                          onClick={() =>
                            handleToggleCheckIn(
                              activeClass.id,
                              booking.id,
                              isAttended
                            )
                          }
                          className={
                            isAttended
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
