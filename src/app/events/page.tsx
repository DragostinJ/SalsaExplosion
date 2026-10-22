import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Sparkles, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { getCachedUpcomingEvents } from "@/lib/cached-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";

export const metadata = {
  title: "DANZA! 2026 | 2027 & Salsa Explosion Congresses | Bournemouth",
  description:
    "Official DANZA! 2026 | 2027 Cuban Salsa events calendar, weekend dance festivals, and masterclasses directed by Maestro Enrique Perez Valdes at BOH Studios Bournemouth.",
};

export default async function EventsDirectoryPage() {
  const events = await getCachedUpcomingEvents(20);

  const events2026 = events.filter(
    (e) => new Date(e.startDate).getFullYear() === 2026
  );
  const events2027 = events.filter(
    (e) => new Date(e.startDate).getFullYear() >= 2027
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* DANZA! 2026 | 2027 Official Calendar Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-base/30 bg-gradient-to-br from-card via-card to-primary-light/30 p-6 sm:p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary-base text-white font-extrabold text-xs uppercase tracking-wider">
                Official Calendar 2026 | 2027
              </Badge>
              <Badge
                variant="outline"
                className="border-secondary-base/40 text-secondary-hover bg-secondary-light/30 text-xs font-semibold"
              >
                📍 BOH Studios Bournemouth
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                DANZA! 2026 | 2027 Special Event Calendar
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Salsa Explosion Congresses &amp; Masterclasses
              </p>
            </div>

            <div className="rounded-2xl border border-primary-base/20 bg-primary-base/5 p-4 sm:p-5 space-y-3">
              <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                &ldquo;We’ve got some very exciting special events coming up at BOH Studios, Bournemouth — and we’d love you to be part of them! ❤️ From Cuban Salsa, Rueda, Son Cubano, Afro Cuban, Bachata, Kizomba and Timba to big parties, special guests, dance weekends and plenty of social dancing… there’s lots to look forward to! These are the dates you don’t want to miss, so get your diary out and save them now! 📅&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary-base/15 text-xs">
                <span className="font-extrabold text-primary-hover">
                  Enrique &amp; The Salsa Explosion Team 🇨🇺
                </span>
                <span className="text-text-muted font-medium">
                  104 Commercial Rd, Bournemouth BH2 5LR
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 text-primary-base shrink-0" />
                <span>12 Exclusive Parties &amp; Weekenders</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-secondary-base shrink-0" />
                <span>Instant Digital Passes &amp; Stripe Checkout</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-primary-base/30 shadow-xl group bg-muted">
              <Image
                src="/images/danza-2026-2027-calendar.png"
                alt="DANZA! 2026 | 2027 Bournemouth Salsa Explosion Event Calendar"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 380px"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Grid by Season */}
      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="mx-auto h-12 w-12 text-text-muted/50" />
            <h3 className="mt-4 text-lg font-semibold">No Upcoming Events Yet</h3>
            <p className="text-sm text-text-muted mt-1">
              Check back soon! We announce visiting Cuban maestros and festival dates regularly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* 2026 Season Section */}
          {events2026.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-900 text-white font-extrabold text-xs">
                    2026 Season
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Autumn &amp; Festive Special Events
                  </h2>
                </div>
                <span className="text-xs text-text-muted font-medium">
                  {events2026.length} Events Scheduled
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events2026.map((evt) => (
                  <EventCard key={evt.id} evt={evt} />
                ))}
              </div>
            </section>
          )}

          {/* 2027 Season Section */}
          {events2027.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary-base text-white font-extrabold text-xs">
                    2027 Season
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Spring &amp; Summer Masterclasses &amp; Weekenders
                  </h2>
                </div>
                <span className="text-xs text-text-muted font-medium">
                  {events2027.length} Events Scheduled
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events2027.map((evt) => (
                  <EventCard key={evt.id} evt={evt} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

interface EventCardProps {
  evt: Awaited<ReturnType<typeof getCachedUpcomingEvents>>[number];
}

function EventCard({ evt }: EventCardProps) {
  const minPrice = evt.ticketTiers[0]?.priceInCents
    ? `£${(evt.ticketTiers[0].priceInCents / 100).toFixed(0)}`
    : "TBA";

  const startFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(evt.startDate));

  const isWeekendFlagship =
    evt.slug.includes("made-in-cuba-dance-weekend") ||
    evt.slug.includes("barbara-jimenez") ||
    evt.slug.includes("valentine");

  return (
    <Card className="flex flex-col overflow-hidden border shadow-sm transition-all hover:shadow-md">
      {/* Visual Header */}
      <div
        className={`relative h-44 w-full p-6 text-white flex flex-col justify-between ${
          isWeekendFlagship
            ? "bg-gradient-to-tr from-zinc-900 via-zinc-900 to-rose-950"
            : evt.slug.includes("halloween")
            ? "bg-gradient-to-tr from-rose-950 via-rose-900 to-zinc-900"
            : "bg-gradient-to-tr from-zinc-900 via-primary-base to-rose-900"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="bg-black/40 text-white border-none backdrop-blur-sm text-[10px] font-bold">
            {isWeekendFlagship ? "Weekend Festival" : "Special Event"}
          </Badge>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
            From {minPrice}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-extrabold leading-snug drop-shadow-sm line-clamp-2">
            {evt.title}
          </h3>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {evt.guestArtists.map((artist) => (
            <Badge
              key={artist}
              variant="secondary"
              className="text-[11px] font-semibold bg-secondary-light/40 text-secondary-hover border-secondary-base/30"
            >
              ★ {artist}
            </Badge>
          ))}
        </div>

        <CardDescription className="line-clamp-2 text-xs text-text-muted">
          {evt.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-xs text-text-muted flex-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-secondary-base shrink-0" />
          <span className="font-medium text-foreground">{startFormatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-secondary-base shrink-0" />
          <span className="truncate">{evt.venueName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-secondary-base shrink-0" />
          <span>{evt.ticketTiers.length} Pass Tiers Available</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          asChild
          className="w-full bg-primary-base hover:bg-primary-hover text-white text-xs font-bold transition-colors h-10 rounded-xl shadow-xs"
        >
          <Link href={`/events/${evt.slug}`}>
            View Passes &amp; Details
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
