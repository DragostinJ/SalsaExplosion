import { notFound } from "next/navigation";
import { DanceRole } from "@prisma/client";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import {
  EventPassSelector,
  SerializedEventTier,
} from "@/components/events/event-pass-selector";
import { AddToCalendarButton } from "@/components/calendar/add-to-calendar-button";
import { CongressTravelGuide } from "@/components/events/congress-travel-guide";
import { StudioEventGuide } from "@/components/events/studio-event-guide";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  const currentUser = await getOrProvisionCurrentUser();

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      ticketTiers: {
        orderBy: { priceInCents: "asc" },
        include: {
          registrations: {
            where: { paymentStatus: "PAID" },
            select: {
              id: true,
              userId: true,
              role: true,
              qrCodeHash: true,
              checkedIn: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const startFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.startDate));

  const endFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.endDate));

  const serializedTiers: SerializedEventTier[] = event.ticketTiers.map(
    (tier) => {
      const bookedLeads = tier.registrations.filter(
        (r) => r.role === DanceRole.LEAD
      ).length;
      const bookedFollows = tier.registrations.filter(
        (r) => r.role === DanceRole.FOLLOW
      ).length;
      const userReg = currentUser
        ? tier.registrations.find((r) => r.userId === currentUser.id) ?? null
        : null;

      return {
        id: tier.id,
        eventId: event.id,
        name: tier.name,
        description: tier.description,
        priceInCents: tier.priceInCents,
        totalCapacity: tier.totalCapacity,
        maxLeads: tier.maxLeads,
        maxFollows: tier.maxFollows,
        bookedLeads,
        bookedFollows,
        totalBooked: tier.registrations.length,
        userRegistration: userReg
          ? {
              id: userReg.id,
              role: userReg.role,
              qrCodeHash: userReg.qrCodeHash,
              checkedIn: userReg.checkedIn,
            }
          : null,
      };
    }
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <BackButton fallbackUrl="/events" label="Back to Events" />
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-500 p-8 sm:p-12 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-black/40 text-white border-none backdrop-blur-sm">
              Exclusive Masterclass
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
              Cuban Salsa & Afro-Cuban
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight drop-shadow-sm">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-amber-50/90 leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-amber-100 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {startFormatted} – {endFormatted}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venueName}, {event.venueAddress}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <AddToCalendarButton
              event={{
                title: event.title,
                description: `${event.description}\n\nVenue: ${event.venueName}, ${event.venueAddress}\nDirected by Maestro Enrique Perez Valdes (Salsa Explosion UK)`,
                location: `${event.venueName}, ${event.venueAddress}`,
                startDate: event.startDate,
                endDate: event.endDate,
              }}
              className="bg-white/10 text-white hover:bg-white/20 border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Guest Maestros & Highlights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">
                World-Class Guest Artists
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.guestArtists.map((artist) => (
              <div
                key={artist}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{artist}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">
                Role-Balanced Intensive
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            All partner dance workshop tiers strictly enforce balanced Lead/Follow ratios. You will spend your workshop time dancing, not sitting out.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">Instant QR Door Pass</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Tickets are issued immediately to your account with a cryptographically verified QR code for 1-second entrance scanning on arrival.
          </CardContent>
        </Card>
      </div>

      {/* Interactive Pass Selection & QR Pass Issuance */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Available Passes & Tickets
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select your pass tier and dance role below. Your QR door pass will be generated immediately.
          </p>
        </div>

        <EventPassSelector
          tiers={serializedTiers}
          defaultPreferredRole={currentUser?.preferredRole ?? DanceRole.LEAD}
        />
      </div>

      {/* Venue & Event Guide */}
      {event.slug.includes("congress") ? (
        <CongressTravelGuide />
      ) : (
        <StudioEventGuide eventTitle={event.title} venueName={event.venueName} />
      )}
    </main>
  );
}
