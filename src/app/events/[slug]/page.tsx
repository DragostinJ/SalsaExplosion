import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { DanceRole } from "@prisma/client";
import {
  Calendar,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const { userId: clerkId } = await auth();

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      ticketTiers: {
        orderBy: { priceInCents: "asc" },
        include: {
          registrations: {
            where: { paymentStatus: "PAID" },
            select: { role: true },
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
              <span>{startFormatted} – {endFormatted}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venueName}, {event.venueAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Maestros & Highlights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">World-Class Guest Artists</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.guestArtists.map((artist) => (
              <div key={artist} className="flex items-center gap-2 text-sm font-semibold">
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
              <CardTitle className="text-base">Role-Balanced Intensive</CardTitle>
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
            Tickets are sent directly to your account with a cryptographically verified QR code for 1-second entrance scanning on arrival.
          </CardContent>
        </Card>
      </div>

      {/* Pass Selection */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Available Passes & Tickets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your pass tier. Role caps are updated in real-time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {event.ticketTiers.map((tier) => {
            const price = (tier.priceInCents / 100).toFixed(0);

            let bookedLeads = 0;
            let bookedFollows = 0;
            for (const r of tier.registrations) {
              if (r.role === DanceRole.LEAD) bookedLeads++;
              if (r.role === DanceRole.FOLLOW) bookedFollows++;
            }

            const totalBooked = tier.registrations.length;
            const isSoldOut = totalBooked >= tier.totalCapacity;
            const remainingSpots = tier.totalCapacity - totalBooked;

            const remainingLeads = tier.maxLeads !== null ? tier.maxLeads - bookedLeads : null;
            const remainingFollows = tier.maxFollows !== null ? tier.maxFollows - bookedFollows : null;

            return (
              <Card
                key={tier.id}
                className="flex flex-col justify-between border shadow-sm transition-all hover:border-amber-500/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                    {isSoldOut ? (
                      <Badge variant="destructive">Sold Out</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {remainingSpots} spots left
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight">£{price}</span>
                    <span className="text-xs text-muted-foreground">/ pass</span>
                  </div>
                  {tier.description && (
                    <CardDescription className="text-xs mt-2 line-clamp-3">
                      {tier.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {tier.maxLeads !== null && tier.maxFollows !== null && (
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">Lead Spots:</span>
                        <span className={`font-bold ${remainingLeads !== null && remainingLeads <= 5 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {remainingLeads !== null && remainingLeads > 0 ? `${remainingLeads} available` : "Full (Waitlist)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">Follow Spots:</span>
                        <span className={`font-bold ${remainingFollows !== null && remainingFollows <= 5 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {remainingFollows !== null && remainingFollows > 0 ? `${remainingFollows} available` : "Full (Waitlist)"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t flex flex-col gap-2">
                  <Button
                    disabled={isSoldOut}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-semibold shadow-sm"
                  >
                    {isSoldOut ? "Tier Sold Out" : `Register for ${tier.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
