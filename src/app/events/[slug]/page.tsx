import Image from "next/image";
import Link from "next/link";
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
              {event.slug.includes("halloween") ? "★ Halloween Special ★" : "Exclusive Masterclass"}
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
              {event.slug.includes("halloween") ? "SB&K Social & Costume Party" : "Cuban Salsa & Afro-Cuban"}
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

      {/* Special Halloween Prizes & Party Schedule Banner */}
      {event.slug.includes("halloween") && (
        <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-background to-amber-950/40 p-6 sm:p-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-rose-600 text-white font-extrabold text-xs mb-1 uppercase tracking-wider">
                    🏆 Best Costume Prizes
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    Halloween Fancy Dress Party & Costume Contest
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Judging & Awards at Midnight
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1 text-center">
                  <span className="text-2xl font-black">🥇</span>
                  <h4 className="text-sm font-black text-amber-800 dark:text-amber-300">1ST PRIZE</h4>
                  <p className="text-xs font-bold text-foreground">1 Made in Cuba Weekend Pass</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-center">
                  <span className="text-2xl font-black">🥈</span>
                  <h4 className="text-sm font-black text-foreground">2ND PRIZE</h4>
                  <p className="text-xs font-bold text-foreground">2 Free Dance Classes</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-center">
                  <span className="text-2xl font-black">🥉</span>
                  <h4 className="text-sm font-black text-foreground">3RD PRIZE</h4>
                  <p className="text-xs font-bold text-foreground">1 Free Entry to Our Next Party</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-card/60 p-5 space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Evening Timetable (8:00 PM – 2:00 AM):
                </h4>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 block">8:00 PM • Doors Open</span>
                    <span className="text-foreground">8:15 PM • Bachata Improvers onwards with Alex Spindlove</span>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 block">9:15 PM • Workshop Rooms</span>
                    <span className="text-foreground">Rueda De Casino Intermediates + Salsa/Timba Improvers & Int</span>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-800 dark:text-amber-300 block">10:00 PM – 2:00 AM • Fiesta</span>
                    <span className="text-foreground">SB&K Social Dance Party with DJ Enrique</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                <span>Direct bookings & WhatsApp: <strong className="text-foreground">07969 633701</strong></span>
                <span>Parking: <strong className="text-foreground">Avenue Rd (BH2 5SL) / West Hill (BH2 5PG)</strong></span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-rose-500/30 shadow-xl group">
                <Image
                  src="/images/halloween-latin-party-poster.png"
                  alt="Halloween Latin Party Poster"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* UK Consumer Rights Notice (Dated Leisure Events) */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="font-extrabold">UK Consumer Notice:</strong> Under Regulation 28(1)(h) of the Consumer Contracts Regulations 2013, dated event tickets are exempt from cooling-off refunds; however, Salsa Explosion offers <strong>100% free dancer name transfers</strong> up to 48 hours before the event.
            </span>
          </div>
          <Link
            href="/terms#refunds"
            className="font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
          >
            Read Transfer Policy →
          </Link>
        </div>
      </div>

      {/* Venue & Event Guide */}
      {event.slug.includes("congress") || event.slug.includes("weekend") ? (
        <CongressTravelGuide />
      ) : (
        <StudioEventGuide eventTitle={event.title} venueName={event.venueName} />
      )}
    </main>
  );
}
