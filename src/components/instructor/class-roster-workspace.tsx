"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { BookingStatus, DanceRole } from "@prisma/client";
import {
  QrCode,
  MapPin,
  ExternalLink,
  Video,
  Printer,
  Users,
} from "lucide-react";
import { toggleBookingCheckInAction } from "@/actions/management.actions";
import { attachClassRecapAction } from "@/actions/recap.actions";
import { ClassRosterSummary } from "@/lib/constants/management";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { LiveQrCameraScanner } from "@/components/admin/live-qr-camera-scanner";
import { RosterSidebar } from "./roster/roster-sidebar";
import { RosterBalanceMeters } from "./roster/roster-balance-meters";
import { RosterDancerList } from "./roster/roster-dancer-list";
import { RosterRecapModal } from "./roster/roster-recap-modal";
import { useTimeout } from "@/lib/hooks/use-timeout";

interface ClassRosterWorkspaceProps {
  initialClasses: ClassRosterSummary[];
}

export function ClassRosterWorkspace({
  initialClasses,
}: ClassRosterWorkspaceProps) {
  const { schedule: scheduleTimeout } = useTimeout();
  const [classes, setClasses] = useState<ClassRosterSummary[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClasses[0]?.id ?? ""
  );
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showRecapModal, setShowRecapModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<"ALL" | "AWAITING" | "CHECKED_IN" | "LEAD" | "FOLLOW">("ALL");
  const [isPending, startTransition] = useTransition();

  // Recap Form State
  const [recapVideoUrl, setRecapVideoUrl] = useState("");
  const [recapFiguresCsv, setRecapFiguresCsv] = useState(
    "Guapea, Dile Que No, Enchufla Doble con Mambo, Vacilala"
  );
  const [recapNotes, setRecapNotes] = useState(
    "Great work today! Remember to prep the circular turn on count 1."
  );
  const [recapFeedback, setRecapFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const handleCameraCodeDetected = (scannedCode: string) => {
    if (!activeClass) return;
    const q = scannedCode.trim().toLowerCase();
    const matched = activeClass.bookings.find(
      (b) =>
        b.id.toLowerCase() === q ||
        b.userId.toLowerCase() === q ||
        b.email.toLowerCase() === q ||
        `${b.firstName} ${b.lastName}`.toLowerCase() === q ||
        (q.length >= 3 && `${b.firstName} ${b.lastName}`.toLowerCase().includes(q))
    );

    if (matched) {
      const studentFullName = `${matched.firstName} ${matched.lastName}`.trim();
      if (matched.status !== BookingStatus.ATTENDED) {
        handleToggleCheckIn(activeClass.id, matched.id, false);
      } else {
        setStatusMessage(`${studentFullName} is already checked in.`);
      }
    } else {
      setStatusMessage(`Scanned: "${scannedCode}". No matching dancer in current class roster.`);
    }
  };

  const awaitingBookings = useMemo(() => {
    if (!activeClass) return [];
    return activeClass.bookings.filter((b) => b.status !== BookingStatus.ATTENDED);
  }, [activeClass]);

  const handleCheckInAllRemaining = () => {
    if (!activeClass || awaitingBookings.length === 0) return;
    startTransition(async () => {
      let count = 0;
      for (const booking of awaitingBookings) {
        const res = await toggleBookingCheckInAction({
          bookingId: booking.id,
          markAttended: true,
        });
        if (res.success) count++;
      }
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls.id !== activeClass.id) return cls;
          const updatedBookings = cls.bookings.map((b) => ({
            ...b,
            status: BookingStatus.ATTENDED,
            checkedInAt: b.checkedInAt ?? new Date().toISOString(),
          }));
          const checkedInLeads = updatedBookings.filter(
            (b) => b.danceRole === DanceRole.LEAD
          ).length;
          const checkedInFollows = updatedBookings.filter(
            (b) => b.danceRole === DanceRole.FOLLOW
          ).length;
          return {
            ...cls,
            checkedInLeads,
            checkedInFollows,
            bookings: updatedBookings,
          };
        })
      );
      setStatusMessage(`Checked in ${count} remaining dancer(s) in bulk.`);
    });
  };

  const filteredBookings = useMemo(() => {
    if (!activeClass) return [];
    return activeClass.bookings.filter((b) => {
      if (filterRole === "AWAITING" && b.status === BookingStatus.ATTENDED) return false;
      if (filterRole === "CHECKED_IN" && b.status !== BookingStatus.ATTENDED) return false;
      if (filterRole === "LEAD" && b.danceRole !== DanceRole.LEAD) return false;
      if (filterRole === "FOLLOW" && b.danceRole !== DanceRole.FOLLOW) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${b.firstName} ${b.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [activeClass, filterRole, searchQuery]);

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

  const handleSaveRecap = (e: React.FormEvent) => {
    e.preventDefault();
    setRecapFeedback(null);

    const figures = recapFiguresCsv
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await attachClassRecapAction({
        classSessionId: activeClass.id,
        recapVideoUrl,
        recapNotes,
        recapFigures: figures.length > 0 ? figures : ["Casino Partnerwork Basics"],
        recapPublished: true,
      });

      if (res.success) {
        setRecapFeedback({ type: "success", text: res.message });
        setClasses((prev) =>
          prev.map((c) =>
            c.id === activeClass.id
              ? {
                  ...c,
                  recapVideoUrl: res.data.recapVideoUrl,
                  recapFigures: res.data.recapFigures,
                  recapPublished: res.data.recapPublished,
                }
              : c
          )
        );
        scheduleTimeout(() => setShowRecapModal(false), 1800);
      } else {
        setRecapFeedback({ type: "error", text: res.error.message });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Sidebar: Class Session Selector (4 Cols) */}
      <RosterSidebar
        classes={classes}
        activeClassId={activeClass.id}
        onSelectClass={(id) => {
          setSelectedClassId(id);
          setStatusMessage(null);
        }}
      />

      {/* Right Main Area: Live Roster & QR Check-in Desk (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Session Header & QR Trigger */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2.5">
                  <TeacherAvatar
                    name={activeClass.instructorName}
                    avatarUrl={activeClass.instructorAvatarUrl}
                    size="sm"
                  />
                  <Badge className="bg-amber-500 text-stone-950 font-bold">
                    {activeClass.minLevel}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeClass.room} • Maestro {activeClass.instructorName}
                  </span>
                </div>
                <CardTitle className="mt-2 text-xl font-extrabold">
                  {activeClass.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Check dancers in as they arrive at the door, display the door QR code, and publish the end-of-class recap video.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRecapVideoUrl(activeClass.recapVideoUrl ?? "");
                    setRecapFiguresCsv(
                      activeClass.recapFigures?.join(", ") ??
                        "Guapea, Dile Que No, Enchufla Doble, Vacilala"
                    );
                    setRecapNotes(
                      activeClass.recapNotes ??
                        "Great work today! Remember to prep the circular turn on count 1."
                    );
                    setShowRecapModal(true);
                  }}
                  className="text-xs font-semibold"
                >
                  <Video className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                  {activeClass.recapPublished ? "Edit Recap Video" : "Attach Recap Video"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowQrModal((prev) => !prev)}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs font-semibold"
                >
                  <QrCode className="mr-1.5 h-4 w-4" />
                  {showQrModal ? "Hide QR" : "Door QR"}
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={`/instructor/roster/print?sessionId=${activeClass.id}`} target="_blank" rel="noopener noreferrer">
                    <Printer className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                    Print A4 Sheet
                  </Link>
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
            <RosterBalanceMeters activeClass={activeClass} />

            {/* Expandable Studio Door QR Code Display */}
            {showQrModal && (
              <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/[0.03] p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <ScannableQrCode
                    value={`https://salsaexplosion.co.uk${checkInPath}`}
                    size={160}
                    label={activeClass.title}
                  />
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
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
                {statusMessage}
              </div>
            )}

            {/* In-Browser Camera Scanner for Door Check-in */}
            <div className="pt-1">
              <LiveQrCameraScanner
                onDetected={handleCameraCodeDetected}
                buttonLabel="Open Camera Door Scanner"
              />
            </div>

            {/* Enrolled Dancers List */}
            <RosterDancerList
              activeClass={activeClass}
              filteredBookings={filteredBookings}
              awaitingBookings={awaitingBookings}
              searchQuery={searchQuery}
              filterRole={filterRole}
              isPending={isPending}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterRole}
              onCheckInAllRemaining={handleCheckInAllRemaining}
              onToggleCheckIn={handleToggleCheckIn}
            />
          </CardContent>
        </Card>
      </div>

      {/* Attach End-of-Class Recap Video Dialog */}
      {showRecapModal && (
        <RosterRecapModal
          activeClass={activeClass}
          recapVideoUrl={recapVideoUrl}
          recapFiguresCsv={recapFiguresCsv}
          recapNotes={recapNotes}
          recapFeedback={recapFeedback}
          isPending={isPending}
          onClose={() => setShowRecapModal(false)}
          onVideoUrlChange={setRecapVideoUrl}
          onFiguresCsvChange={setRecapFiguresCsv}
          onNotesChange={setRecapNotes}
          onSaveRecap={handleSaveRecap}
        />
      )}
    </div>
  );
}
