import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { Calendar, MapPin, Sparkles, Users, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
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
  title: "Salsa Explosion Congresses & Masterclasses | Bournemouth",
  description: "Official Cuban Salsa congresses, weekend bootcamps, and Havana Fiesta socials directed by Maestro Enrique Perez Valdes in Bournemouth.",
};

export default async function EventsDirectoryPage() {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED },
    orderBy: { startDate: "asc" },
    include: {
      ticketTiers: {
        orderBy: { priceInCents: "asc" },
      },
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Salsa Explosion Congresses & Masterclasses
            </h1>
            <Badge className="bg-amber-500 text-white font-semibold">Bournemouth & Dorset</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Immersive Cuban Salsa congresses, Afro-Cuban weekend bootcamps, and Havana Fiesta socials featuring world-class artists.
          </p>
        </div>
      </div>

      {/* Event Grid */}
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => {
            const minPrice = evt.ticketTiers[0]?.priceInCents
              ? `£${(evt.ticketTiers[0].priceInCents / 100).toFixed(0)}`
              : "TBA";

            const startFormatted = new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(evt.startDate));

            return (
              <Card
                key={evt.id}
                className="flex flex-col overflow-hidden border shadow-sm transition-all hover:shadow-md"
              >
                {/* Visual Header */}
                <div className="relative h-44 w-full bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 p-6 text-white flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-black/40 text-white border-none backdrop-blur-sm">
                      Cuban Salsa Intensive
                    </Badge>
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      From {minPrice}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold leading-snug drop-shadow-sm line-clamp-2">
                      {evt.title}
                    </h2>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {evt.guestArtists.map((artist) => (
                      <Badge
                        key={artist}
                        variant="secondary"
                        className="text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                      >
                        ★ {artist}
                      </Badge>
                    ))}
                  </div>

                  <CardDescription className="line-clamp-2 text-xs">
                    {evt.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{startFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{evt.venueName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{evt.ticketTiers.length} Pass Tiers Available</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-xs font-semibold">
                    <Link href={`/events/${evt.slug}`}>
                      View Passes & Details
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
