import { BookingStatus, DanceRole } from "@prisma/client";
import { CalendarPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { AdminNav } from "@/components/navigation/admin-nav";
import { ClassManagerWorkspace } from "@/components/admin/class-manager-workspace";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Weekly Class Manager | RitmoFlow Admin",
  description:
    "Create and manage Cuban Salsa weekly class sessions, Lead/Follow capacity limits, and QR attendance rosters.",
};

export default async function AdminClassesPage() {
  await requireRole(STAFF_ROLES);

  const classes = await prisma.classSession.findMany({
    where: { isCancelled: false },
    orderBy: { startTime: "asc" },
    take: 30,
    include: {
      instructor: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
      bookings: {
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
        },
        select: { danceRole: true },
      },
    },
  });

  const serialized = classes.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    minLevel: c.minLevel,
    startTimeIso: c.startTime.toISOString(),
    room: c.room,
    maxCapacity: c.maxCapacity,
    maxLeads: c.maxLeads,
    maxFollows: c.maxFollows,
    leadsBooked: c.bookings.filter((b) => b.danceRole === DanceRole.LEAD)
      .length,
    followsBooked: c.bookings.filter((b) => b.danceRole === DanceRole.FOLLOW)
      .length,
    instructorName: `${c.instructor.firstName} ${c.instructor.lastName}`,
    instructorAvatarUrl: c.instructor.avatarUrl,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <AdminNav />

      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Weekly Class Schedule Manager
            </h1>
            <Badge className="bg-amber-500 text-white font-semibold">
              <CalendarPlus className="mr-1 h-3.5 w-3.5" />
              Role-Balanced Calendar
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish new Cuban Salsa & Rueda classes, configure strict Lead/Follow caps, and jump straight to the QR door roster.
          </p>
        </div>
      </div>

      <ClassManagerWorkspace initialClasses={serialized} />
    </main>
  );
}
