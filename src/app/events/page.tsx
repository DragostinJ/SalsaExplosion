import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { getCachedUpcomingEvents } from "@/lib/cached-queries";
import { VENUE_INFO, ACADEMY_METRICS, DOOR_PRICING, upcomingCanonicalEvents } from "@/lib/academy-data";
import { reportError } from "@/lib/monitoring";
import { getPublishedEvents } from "@/lib/stores/published-events-store";
import { buildFestivalEventJsonLd } from "@/lib/seo/event-jsonld";
import { jsonLdHtml } from "@/lib/seo/move-jsonld";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";
import { PosterBanner } from "@/components/poster/poster-art";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export const metadata = {
  title: "Cuban Salsa Festivals & Parties",
  description:
    "Made in Cuba Dance Weekend, SB&K nights and the Christmas and New Year parties in Bournemouth. Book your festival pass online.",
  alternates: { canonical: "/events" },
};

const festivalDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "long" });

export default async function EventsDirectoryPage() {
  let events: Awaited<ReturnType<typeof getCachedUpcomingEvents>> = [];
  try {
    events = await getCachedUpcomingEvents(20);
  } catch (err) {
    reportError("EventsDirectoryPage:getCachedUpcomingEvents", err);
  }

  // Fallback to canonical events if database is empty or connection pooler is degraded
  const isCanonicalFallback = !events || events.length === 0;
  const displayEvents: Awaited<ReturnType<typeof getCachedUpcomingEvents>> =
    !isCanonicalFallback
      ? events
      : upcomingCanonicalEvents().map((c, index) => ({
          id: `canonical-${index}-${c.slug}`,
          slug: c.slug,
          title: c.title,
          description: c.description,
          coverImageUrl: c.posterUrl ?? null,
          venueName: c.venueName,
          venueAddress: VENUE_INFO.fullAddress,
          startDate: new Date(c.startDateIso),
          endDate: c.endDateIso ? new Date(c.endDateIso) : new Date(c.startDateIso),
          guestArtists: [] as string[],
          status: "PUBLISHED" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          ticketTiers: [
            {
              id: `tier-${index}`,
              eventId: `canonical-${index}-${c.slug}`,
              name: "General Admission",
              description: "Full event pass",
              priceInCents: c.minPricePounds * 100,
              totalCapacity: 100,
              maxLeads: null,
              maxFollows: null,
              salesStartAt: new Date(),
              salesEndAt: new Date(c.startDateIso),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        }));

  const events2026 = displayEvents.filter(
    (e) => new Date(e.startDate).getFullYear() === 2026
  );
  const events2027 = displayEvents.filter(
    (e) => new Date(e.startDate).getFullYear() >= 2027
  );

  const liveAnnouncements = await getPublishedEvents();

  const nextEvent = [...displayEvents].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )[0];
  const nextPrices = nextEvent?.ticketTiers.map((t) => t.priceInCents).filter((p) => p > 0) ?? [];
  const nextFromPounds = nextPrices.length > 0 ? Math.round(Math.min(...nextPrices) / 100) : null;

  const eventsJsonLd = displayEvents.map((evt) =>
    buildFestivalEventJsonLd({
      slug: evt.slug,
      title: evt.title,
      description: evt.description,
      startDate: evt.startDate,
      endDate: evt.endDate,
      coverImageUrl: evt.coverImageUrl,
      venueName: evt.venueName,
      venueAddress: evt.venueAddress,
      ticketTiers: evt.ticketTiers,
    })
  );

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {eventsJsonLd.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(eventsJsonLd) }} />
      )}

      {/* DANZA! 2026 | 2027 Official Calendar Hero Showcase */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
              <span>Cartelera · Online Box Office</span>
              <span className="opacity-70">{VENUE_INFO.shortName} · BOURNEMOUTH</span>
            </div>

            <div>
              <h1 className={`text-ink ${TYPE.section}`}>
                DANZA! 2026 | 2027 <span className="text-accent-red">Funciones</span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-ink">
                Directed by {ACADEMY_METRICS.founderTitleName}
              </p>
            </div>

            {/* The next festival, so a phone shows a date and a way in on the first screen */}
            {nextEvent && (
              <Link
                href={`/events/${nextEvent.slug}`}
                className="block border-4 border-ink bg-poster-mustard p-4 text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-colors hover:bg-ink hover:text-paper"
              >
                <span className="block text-xs font-bold uppercase tracking-wider">
                  Next up · {festivalDate(nextEvent.startDate)}
                </span>
                <span className={`mt-1 block font-display ${TYPE.card}`}>{nextEvent.title}</span>
                <span className="mt-1 block text-sm font-bold">
                  {nextFromPounds !== null && `Passes from £${nextFromPounds} · `}Book online →
                </span>
              </Link>
            )}
            <p className="text-xs font-semibold text-ink">
              Festivals and parties are booked here. Weekly Thursday &amp; Sunday classes aren&apos;t: they&apos;re £
              {DOOR_PRICING.oneClassPounds} / £{DOOR_PRICING.twoClassesPounds} at the door.
            </p>

            <div className="border-2 border-ink bg-surface-1 p-4 sm:p-5 space-y-2 text-ink">
              <p className="text-xs sm:text-sm leading-relaxed italic">
                &ldquo;We have an extraordinary season of special events coming up at {VENUE_INFO.name} — from Cuban Salsa, Rueda, Son Cubano, Afro-Cuban, Bachata, Kizomba, and Timba to flagship parties, guest maestros, dance weekends, and late-night social dancing.&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-ink text-xs font-bold">
                <span className="text-accent-red">
                  Enrique &amp; The Salsa Explosion Team
                </span>
                <span className="opacity-70 font-medium">
                  {VENUE_INFO.streetAddress}, {VENUE_INFO.city} {VENUE_INFO.postcode}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 font-bold">
              <div className="flex items-center gap-1.5 text-accent-red">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  {displayEvents.length} {displayEvents.length === 1 ? "party or weekender" : "parties & weekenders"} coming up
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-accent-teal">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Instant Digital Passes &amp; Stripe Checkout</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rotate-[-2deg] border-[6px] border-ink shadow-[12px_12px_0_0_var(--color-ink)]">
              <div className="relative aspect-[4/5] w-full bg-ink">
                <Image
                  src="/images/danza-2026-2027-calendar.png"
                  alt="DANZA! 2026 | 2027 Bournemouth Salsa Explosion Event Calendar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 380px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PosterBanner image={MEDIA_MANIFEST.editorial.bannerFestival} caption="Fiesta junto al mar" />

      {/* Event Grid by Season */}
      {displayEvents.length === 0 && liveAnnouncements.length === 0 ? (
        <section className="border-4 border-ink bg-paper p-12 text-center text-ink">
          <Sparkles className="mx-auto h-12 w-12 opacity-50" />
          <h3 className={`mt-4 font-display ${TYPE.card}`}>No Upcoming Events Yet</h3>
          <p className="mt-2 text-sm text-ink/70">
            Check back soon! We announce visiting Cuban maestros and festival dates regularly.
          </p>
        </section>
      ) : (
        <div className="space-y-12">
          {/* Live AI-Approved Announcements Section */}
          {liveAnnouncements.length > 0 && (
            <section className="space-y-6">
              <div className="border-b-4 border-ink pb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="border-2 border-ink bg-poster-teal px-2 py-0.5 font-display text-lg uppercase text-ink">
                    Avisos
                  </span>
                  <h2 className={`font-display text-3xl sm:text-4xl text-ink leading-none`}>
                    Live Announcements &amp; Guest Workshops
                  </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                  {liveAnnouncements.length} Live Announcements
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveAnnouncements.map((liveEvt) => (
                  <article
                    key={liveEvt.id}
                    className="flex flex-col border-4 border-ink bg-paper text-ink transition-transform hover:-translate-y-0.5"
                  >
                    {liveEvt.posterPreviewUrl ? (
                      <div className="relative h-48 w-full border-b-4 border-ink bg-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={liveEvt.posterPreviewUrl}
                          alt={liveEvt.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 border-2 border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase text-ink">
                          {liveEvt.bookingType === "ONLINE_TICKET" ? "ONLINE TICKET" : "DOOR ENTRY"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-b-4 border-ink bg-poster-mustard/30 p-3 text-xs font-bold uppercase text-ink">
                        <span className="border border-ink bg-paper px-2 py-0.5">
                          {liveEvt.bookingType === "ONLINE_TICKET" ? "ONLINE TICKET" : "DOOR ENTRY"}
                        </span>
                        <span className="font-display text-base text-accent-red">{liveEvt.priceDisplay}</span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between p-5 gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-accent-red">
                          {liveEvt.dateDisplay}
                        </p>
                        <h3 className={`mt-1 font-display ${TYPE.card} leading-none text-ink`}>
                          {liveEvt.title}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-ink line-clamp-2">
                          {liveEvt.subtitle}
                        </p>
                        <div className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-ink/70">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{liveEvt.venue}</span>
                        </div>
                        {liveEvt.instagramOrFbSummary && (
                          <p className="mt-2 text-xs italic text-ink/70 border-l-2 border-ink pl-2 line-clamp-2">
                            &ldquo;{liveEvt.instagramOrFbSummary}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="mt-3 border-t-2 border-ink pt-3 flex items-center justify-between gap-2">
                        <span className="font-display text-lg text-ink">
                          {liveEvt.priceDisplay}
                        </span>
                        <Link
                          href={liveEvt.ctaUrl || "/events"}
                          className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-3 text-xs`}
                        >
                          <span>Details →</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 2026 Season Section */}
          {events2026.length > 0 && (
            <section className="space-y-6">
              <div className="border-b-4 border-ink pb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="border-2 border-ink bg-poster-mustard px-2 py-0.5 font-display text-lg uppercase text-ink">
                    2026
                  </span>
                  <h2 className={`font-display ${TYPE.card} sm:text-4xl text-ink leading-none`}>
                    Temporada 2026 · Autumn &amp; Festive Special Events
                  </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                  {events2026.length} Events Scheduled
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events2026.map((evt) => (
                  <EventCard
                    key={evt.id}
                    evt={evt}
                    isCanonicalFallback={isCanonicalFallback}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 2027 Season Section */}
          {events2027.length > 0 && (
            <section className="space-y-6">
              <div className="border-b-4 border-ink pb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="border-2 border-ink bg-poster-red px-2 py-0.5 font-display text-lg uppercase text-ink">
                    2027
                  </span>
                  <h2 className={`font-display ${TYPE.card} sm:text-4xl text-ink leading-none`}>
                    Temporada 2027 · Spring &amp; Summer Masterclasses &amp; Weekenders
                  </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                  {events2027.length} Events Scheduled
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events2027.map((evt) => (
                  <EventCard
                    key={evt.id}
                    evt={evt}
                    isCanonicalFallback={isCanonicalFallback}
                  />
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
  isCanonicalFallback?: boolean;
}

function EventCard({ evt, isCanonicalFallback = false }: EventCardProps) {
  const minPrice = evt.ticketTiers[0]?.priceInCents
    ? `£${(evt.ticketTiers[0].priceInCents / 100).toFixed(0)}`
    : "TBA";

  const dateObj = new Date(evt.startDate);
  const dateBadge = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(dateObj).toUpperCase();

  const startFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  const isMadeInCuba = evt.slug.includes("made-in-cuba");
  const isHalloween = evt.slug.includes("halloween");
  const isSBK = evt.slug.includes("sb-k") || evt.slug.includes("sbk");

  return (
    <article className="flex border-4 border-ink bg-paper text-ink transition-transform hover:-translate-y-0.5">
      {/* Perforated Stub Date Badge */}
      <div className="flex items-center justify-center border-r-4 border-dashed border-ink bg-poster-mustard/20 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider [writing-mode:vertical-rl] select-none text-ink">
        {dateBadge}
      </div>

      {/* Ticket Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5 gap-3">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-ink/70">
            <span>{startFormatted}</span>
            <span className="border border-ink bg-paper px-2 py-0.5 font-display text-sm text-ink">
              From {minPrice}
            </span>
          </div>

          <h3 className={`mt-2 font-display ${TYPE.card} leading-none text-ink`}>
            {isMadeInCuba
              ? "MADE IN CUBA DANCE FESTIVAL 2026"
              : isHalloween
              ? "HALLOWEEN FANCY DRESS PARTY"
              : isSBK
              ? "SB&K NIGHT! EXTRAVAGANZA"
              : evt.title}
          </h3>

          {evt.guestArtists.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {evt.guestArtists.map((artist) => (
                <span
                  key={artist}
                  className="border border-ink bg-poster-teal/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink"
                >
                  ★ {artist}
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 line-clamp-2 text-xs font-medium text-ink leading-relaxed">
            {evt.description}
          </p>
        </div>

        <div className="border-t-2 border-ink pt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink/70">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[150px]">{evt.venueName}</span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isCanonicalFallback && (
              <span className="text-[10px] font-bold uppercase text-accent-red">
                Opening soon
              </span>
            )}
            <Link
              href={`/events/${evt.slug}`}
              className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-3 text-xs w-full sm:w-auto text-center justify-center`}
            >
              <span>Passes &amp; Tickets →</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
