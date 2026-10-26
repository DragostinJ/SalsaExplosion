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
import { VENUE_INFO, ACADEMY_METRICS } from "@/lib/academy-data";

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
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* DANZA! 2026 | 2027 Official Calendar Hero Showcase — "The Place" Havana Nocturne Architecture */}
      <div data-testid="page-header" className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-6 sm:p-10 text-ivory shadow-xs">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-[11px] font-black uppercase tracking-widest text-gold">
              <span>OFFICIAL ONLINE BOX OFFICE • FESTIVALS &amp; SPECIAL EVENTS</span>
              <span className="text-ivory-muted font-bold">{VENUE_INFO.shortName} • BOURNEMOUTH</span>
            </div>

            <div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ivory leading-tight">
                DANZA! 2026 | 2027{" "}
                <span className="italic font-normal text-gold">
                  Special Event Calendar
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-ivory-muted mt-2 font-medium">
                Salsa Explosion Congresses &amp; Masterclasses • Directed by {ACADEMY_METRICS.founderTitleName}
              </p>
            </div>

            {/* Official Online Ticket Booking Callout */}
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3.5 sm:p-4 text-xs font-semibold text-amber-100 leading-relaxed">
              🎟️ <strong>Official Online Ticket Booking:</strong> Reserve Made in Cuba 2026, Halloween Party &amp; SB&amp;K Extravaganza passes online below with instant digital ticketing. (Regular weekly Thursday &amp; Sunday classes are £12/£14 paid at the door).
            </div>

            <div className="rounded-2xl border border-line bg-surface-3 p-4 sm:p-5 space-y-2">
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed italic">
                &ldquo;We have an extraordinary season of special events coming up at {VENUE_INFO.name} — from Cuban Salsa, Rueda, Son Cubano, Afro-Cuban, Bachata, Kizomba, and Timba to flagship parties, guest maestros, dance weekends, and late-night social dancing.&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line text-xs">
                <span className="font-bold text-gold">
                  Enrique &amp; The Salsa Explosion Team
                </span>
                <span className="text-ivory-muted font-medium">
                  {VENUE_INFO.streetAddress}, {VENUE_INFO.city} {VENUE_INFO.postcode}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ivory-muted pt-1">
              <div className="flex items-center gap-1.5 font-bold text-gold">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>12 Exclusive Parties &amp; Weekenders</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Instant Digital Passes &amp; Stripe Checkout</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl group bg-stone-950">
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
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Upcoming Events Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
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
                <span className="text-xs text-muted-foreground font-medium">
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
                <span className="text-xs text-muted-foreground font-medium">
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

  const isMadeInCuba = evt.slug.includes("made-in-cuba");
  const isHalloween = evt.slug.includes("halloween");
  const isSBK = evt.slug.includes("sb-k") || evt.slug.includes("sbk");
  const isWeekendFlagship =
    isMadeInCuba ||
    evt.slug.includes("barbara-jimenez") ||
    evt.slug.includes("valentine");

  return (
    <Card
      className={`flex flex-col overflow-hidden border transition-all hover:shadow-lg ${
        isMadeInCuba
          ? "border-2 border-black/30 shadow-md ring-2 ring-gold/20"
          : isHalloween
          ? "border-gold/30 shadow-sm"
          : isSBK
          ? "border-danger-line shadow-sm"
          : "shadow-sm"
      }`}
    >
      {/* Visual Header / Cuban Cartel Poster */}
      <div
        className={`relative h-44 w-full p-6 flex flex-col justify-between ${
          isMadeInCuba
            ? "bg-gold text-stone-950 border-b border-black/15"
            : isHalloween
            ? "bg-surface-2 text-ivory border-b border-gold/20"
            : isSBK
            ? "bg-surface-2 text-ivory border-b border-danger-line"
            : isWeekendFlagship
            ? "bg-surface-2 text-ivory border-b border-line"
            : "bg-surface-2 text-ivory border-b border-line"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            className={`text-[11px] font-black uppercase tracking-wider border-none ${
              isMadeInCuba
                ? "bg-black text-gold"
                : "bg-black/50 text-white backdrop-blur-sm"
            }`}
          >
            {isMadeInCuba
              ? "04–06 DEC 2026"
              : isHalloween
              ? "31 OCT 2026"
              : isSBK
              ? "14 NOV 2026"
              : isWeekendFlagship
              ? "Weekend Festival"
              : "Special Event"}
          </Badge>
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full ${
              isMadeInCuba
                ? "bg-black text-white"
                : "bg-white/20 text-white backdrop-blur-sm"
            }`}
          >
            From {minPrice}
          </span>
        </div>

        <div>
          <h3
            className={`text-lg font-black leading-snug drop-shadow-xs line-clamp-2 uppercase ${
              isMadeInCuba ? "text-stone-950" : "text-white"
            }`}
          >
            {isMadeInCuba
              ? "★ MADE IN CUBA DANCE FESTIVAL 2026 ★"
              : isHalloween
              ? "★ HALLOWEEN FANCY DRESS PARTY ★"
              : isSBK
              ? "★ SB&K NIGHT! EXTRAVAGANZA ★"
              : evt.title}
          </h3>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {evt.guestArtists.map((artist) => (
            <Badge
              key={artist}
              variant="outline"
              className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            >
              ★ {artist}
            </Badge>
          ))}
        </div>

        <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
          {evt.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-xs text-muted-foreground flex-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-medium text-foreground">{startFormatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{evt.venueName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>{evt.ticketTiers.length} Pass Tiers Available</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          asChild
          className={`w-full text-xs font-bold transition-colors h-10 rounded-xl shadow-xs ${
            isMadeInCuba
              ? "bg-stone-950 hover:bg-black text-white font-black"
              : "bg-primary-base hover:bg-primary-hover text-white"
          }`}
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
