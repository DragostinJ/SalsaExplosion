import { redirect } from "next/navigation";
import { BookingStatus, DanceRole } from "@prisma/client";
import { QrCode, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { ClassRosterSummary } from "@/lib/constants/management";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { ClassRosterWorkspace } from "@/components/instructor/class-roster-workspace";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Live Class Roster & QR Check-In | RitmoFlow Instructor",
  description:
    "Mobile-first studio desk roster showing real-time Lead/Follow floor balance and QR code door check-ins.",
};

export default async function InstructorRosterPage() {
  const currentUser = await getOrProvisionCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }

  const classes = await prisma.classSession.findMany({
    where: { isCancelled: false },
    orderBy: { startTime: "asc" },
    take: 25,
    include: {
      instructor: {
        select: { firstName: true, lastName: true },
      },
      bookings: {
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              currentLevel: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const serializedClasses: ClassRosterSummary[] = classes.map((cls) => {
    const confirmedLeads = cls.bookings.filter(
      (b) => b.danceRole === DanceRole.LEAD
    ).length;
    const confirmedFollows = cls.bookings.filter(
      (b) => b.danceRole === DanceRole.FOLLOW
    ).length;
    const checkedInLeads = cls.bookings.filter(
      (b) =>
        b.danceRole === DanceRole.LEAD && b.status === BookingStatus.ATTENDED
    ).length;
    const checkedInFollows = cls.bookings.filter(
      (b) =>
        b.danceRole === DanceRole.FOLLOW && b.status === BookingStatus.ATTENDED
    ).length;

    return {
      id: cls.id,
      title: cls.title,
      minLevel: cls.minLevel,
      startTime: cls.startTime.toISOString(),
      endTime: cls.endTime.toISOString(),
      room: cls.room,
      instructorName: `${cls.instructor.firstName} ${cls.instructor.lastName}`,
      maxCapacity: cls.maxCapacity,
      maxLeads: cls.maxLeads,
      maxFollows: cls.maxFollows,
      confirmedLeads,
      confirmedFollows,
      checkedInLeads,
      checkedInFollows,
      bookings: cls.bookings.map((b) => ({
        id: b.id,
        userId: b.user.id,
        firstName: b.user.firstName,
        lastName: b.user.lastName,
        email: b.user.email,
        currentLevel: b.user.currentLevel,
        danceRole: b.danceRole,
        status: b.status,
        checkedInAt: b.checkedInAt ? b.checkedInAt.toISOString() : null,
      })),
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <InstructorNav />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Live Class Roster & QR Check-In Desk
            </h1>
            <Badge className="bg-amber-500 text-white font-semibold">
              <QrCode className="mr-1 h-3.5 w-3.5" />
              Zero-Friction Desk
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify student arrivals at the door, monitor real-time Lead vs. Follow counts on the dance floor, and display the class QR code.
          </p>
        </div>

        <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold">
          <Users className="mr-1.5 h-4 w-4 text-emerald-500" />
          Live Attendance Sync
        </Badge>
      </div>

      <ClassRosterWorkspace initialClasses={serializedClasses} />
    </main>
  );
}
