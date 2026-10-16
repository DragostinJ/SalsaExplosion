import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { AdminNav } from "@/components/navigation/admin-nav";
import {
  AdminEventRegistrationItem,
  AdminEventSummary,
  EventManagerWorkspace,
} from "@/components/admin/event-manager-workspace";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Guest Artist Events & Door Pass Scanner | RitmoFlow Admin",
  description:
    "Launch international guest artist bootcamps, track direct Stripe ticket sales, and verify QR passes at the door.",
};

export default async function AdminEventsPage() {
  await requireRole(STAFF_ROLES);

  const [events, registrations] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startDate: "asc" },
      include: {
        registrations: {
          where: { paymentStatus: "PAID" },
          select: { amountPaidInCents: true },
        },
      },
    }),
    prisma.eventRegistration.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        event: { select: { title: true } },
        ticketTier: { select: { name: true } },
      },
    }),
  ]);

  const serializedEvents: AdminEventSummary[] = events.map((ev) => ({
    id: ev.id,
    slug: ev.slug,
    title: ev.title,
    startDateIso: ev.startDate.toISOString(),
    venueName: ev.venueName,
    guestArtists: ev.guestArtists,
    totalRegistrations: ev.registrations.length,
    grossRevenuePounds:
      ev.registrations.reduce((s, r) => s + r.amountPaidInCents, 0) / 100,
  }));

  const serializedRegistrations: AdminEventRegistrationItem[] =
    registrations.map((reg) => ({
      id: reg.id,
      eventTitle: reg.event.title,
      tierName: reg.ticketTier.name,
      studentName: `${reg.user.firstName} ${reg.user.lastName}`,
      studentEmail: reg.user.email,
      role: reg.role,
      qrCodeHash: reg.qrCodeHash,
      amountPaidInCents: reg.amountPaidInCents,
      checkedIn: reg.checkedIn,
    }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <AdminNav />

      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Guest Artist Events & Door Pass Command
            </h1>
            <Badge className="bg-amber-500 text-white font-semibold">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Eventbrite Killer
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish international workshops, enforce 50/50 Lead/Follow pass caps, and check in dancers at the venue door with zero platform fees.
          </p>
        </div>
      </div>

      <EventManagerWorkspace
        initialEvents={serializedEvents}
        initialRegistrations={serializedRegistrations}
      />
    </main>
  );
}
