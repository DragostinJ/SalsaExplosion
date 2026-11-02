import type { Metadata } from "next";
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
  Phone,
  Mail,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { BackButton } from "@/components/navigation/back-button";
import {
  EventPassSelector,
  SerializedEventTier,
} from "@/components/events/event-pass-selector";
import { AddToCalendarButton } from "@/components/calendar/add-to-calendar-button";
import { CongressTravelGuide } from "@/components/events/congress-travel-guide";
import { StudioEventGuide } from "@/components/events/studio-event-guide";
import { UPCOMING_EVENTS, VENUE_INFO, canonicalEventEnd } from "@/lib/academy-data";
import { hasEventEnded } from "@/lib/event-sales";
import { reportError } from "@/lib/monitoring";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`fill-current shrink-0 ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let event = null;
  try {
    event = await prisma.event.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        coverImageUrl: true,
      },
    });
  } catch (err) {
    reportError("EventDetailPage:generateMetadata", err);
  }

  if (!event) {
    const canonical = UPCOMING_EVENTS.find((e) => e.slug === slug);
    if (canonical) {
      return {
        title: canonical.title,
        description: canonical.description.slice(0, 160),
      };
    }
    return {
      title: "Event Not Found",
    };
  }

  const ogImages = event.coverImageUrl
    ? [
        {
          url: event.coverImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ]
    : [];

  return {
    title: event.title,
    description:
      event.description?.slice(0, 160) ||
      `Official festival pass registration for ${event.title} in Bournemouth with Salsa Explosion.`,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description?.slice(0, 160),
      images: event.coverImageUrl ? [event.coverImageUrl] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  let currentUser: Awaited<ReturnType<typeof getOrProvisionCurrentUser>> = null;
  try {
    currentUser = await getOrProvisionCurrentUser();
  } catch (err) {
    reportError("EventDetailPage:getOrProvisionCurrentUser", err);
  }

  let event = null;
  try {
    event = await prisma.event.findUnique({
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
  } catch (err) {
    reportError("EventDetailPage:eventQuery", err);
  }

  // Fallback to canonical UPCOMING_EVENTS if database is cold or degraded
  const isCanonicalFallback = !event;
  if (!event) {
    const canonical = UPCOMING_EVENTS.find((e) => e.slug === slug);
    if (canonical) {
      event = {
        id: `canonical-${canonical.slug}`,
        slug: canonical.slug,
        title: canonical.title,
        description: canonical.description,
        coverImageUrl: canonical.posterUrl ?? null,
        venueName: canonical.venueName,
        venueAddress: VENUE_INFO.fullAddress,
        startDate: new Date(canonical.startDateIso),
        endDate: canonicalEventEnd(canonical),
        guestArtists: [] as string[],
        status: "PUBLISHED" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        ticketTiers: [
          {
            id: `tier-${canonical.slug}`,
            eventId: `canonical-${canonical.slug}`,
            name: "General Admission",
            description: "Full event pass",
            priceInCents: canonical.minPricePounds * 100,
            totalCapacity: 100,
            maxLeads: null,
            maxFollows: null,
            salesStartAt: new Date(),
            salesEndAt: new Date(canonical.startDateIso),
            createdAt: new Date(),
            updatedAt: new Date(),
            registrations: [],
          },
        ],
      };
    }
  }

  if (!event) {
    notFound();
  }

  // Past events stay viewable (old links, posters) but can't be booked
  const eventFinished = hasEventEnded(new Date(event.endDate));

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

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: new Date(event.startDate).toISOString(),
    endDate: new Date(event.endDate).toISOString(),
    description: event.description,
    image: event.coverImageUrl || undefined,
    location: {
      "@type": "Place",
      name: event.venueName || VENUE_INFO.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress || VENUE_INFO.streetAddress,
        addressLocality: "Bournemouth",
        postalCode: VENUE_INFO.postcode,
        addressCountry: "GB",
      },
    },
    performer: {
      "@type": "Person",
      name: "Enrique Perez Valdes",
      jobTitle: "Artistic Director",
    },
    organizer: {
      "@type": "Organization",
      name: "Salsa Explosion UK",
      url: "https://salsaexplosion.co.uk",
    },
    offers: event.ticketTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: (tier.priceInCents / 100).toFixed(2),
      priceCurrency: "GBP",
      availability: eventFinished ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `https://salsaexplosion.co.uk/events/${event.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div>
          <BackButton fallbackUrl="/events" label="Back to Events" />
        </div>

        {/* Poster Hero Banner */}
        <section
          data-testid="page-header"
          className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
        >
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b-4 border-ink pb-3">
              <span className="border-2 border-ink bg-poster-mustard px-2.5 py-0.5 text-xs font-bold uppercase text-ink">
                {event.slug.includes("halloween") ? "★ Halloween Special ★" : "Exclusive Masterclass"}
              </span>
              <span className="border-2 border-ink bg-paper px-2.5 py-0.5 text-xs font-bold uppercase text-ink">
                {event.slug.includes("halloween") ? "SB&K Social & Costume Party" : "Cuban Salsa & Afro-Cuban"}
              </span>
            </div>

            <p className={KICKER}>Salsa Explosion UK · BOH Studios</p>
            <h1 className={`font-display ${TYPE.section} text-ink leading-tight`}>
              {event.title}
            </h1>

            <p className="text-base sm:text-lg font-medium text-ink leading-relaxed max-w-2xl">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-bold text-ink">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent-red" />
                <span>
                  {startFormatted} – {endFormatted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-teal" />
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
                className="border-2 border-ink bg-paper text-ink hover:bg-ink hover:text-paper"
              />
            </div>
          </div>
        </section>

        {/* Special Flagship MADE IN CUBA Dance Festival 2026 Showcase */}
        {event.slug.includes("made-in-cuba") && (
          <section
            data-testid="made-in-cuba-festival-showcase"
            className="border-4 border-ink bg-paper p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_0_#161311] text-ink"
          >
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border-2 border-ink bg-poster-mustard px-2.5 py-0.5 text-xs font-bold uppercase text-ink">
                      Celebrating 25+ Years of Salsa Explosion Heritage!
                    </span>
                    <span className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold uppercase text-ink">
                      South Coast Premier Cuban Event
                    </span>
                  </div>

                  <h2 className={`font-display ${TYPE.section} text-ink leading-tight`}>
                    MADE IN CUBA DANCE FESTIVAL 2026
                  </h2>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-accent-red">
                    Bournemouth · Friday 4, Saturday 5 &amp; Sunday 6 December 2026
                  </p>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                    Welcome to <strong>MADE IN CUBA DANCE WEEKEND</strong> — get ready for an unforgettable weekend celebrating authentic Cuban dance, music, culture and community. Three days. Three nights. Incredible dancers. Authentic Cuban flavour. One amazing community!
                  </p>
                </div>

                {/* What to Expect Grid */}
                <div className="space-y-2.5">
                  <p className={KICKER}>What to Expect</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">🌙</span>
                      3 Nights of Parties
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">🎓</span>
                      2 Days of Workshops
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">🎭</span>
                      2 Spectacular Shows
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">⭐</span>
                      Dancing with the Stars
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink col-span-2 sm:col-span-2">
                      <span className="block text-lg">💃</span>
                      Social Dancing Until 02:00
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">🇨🇺</span>
                      Room 1: Salsa &amp; Timba
                    </div>
                    <div className="border-2 border-ink bg-surface-1 p-2.5 text-center font-bold text-ink">
                      <span className="block text-lg">🇩🇴</span>
                      Room 2: Bachata Room
                    </div>
                  </div>
                </div>

                {/* 3-Day Weekend Programme */}
                <div className="border-2 border-ink bg-paper p-4 sm:p-5 space-y-3">
                  <h3 className="font-display text-xl text-ink flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent-red" />
                    The Weekend Programme (By Venue &amp; Hours):
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                    <div className="border-2 border-ink bg-surface-1 p-3 space-y-1">
                      <span className="font-display text-base text-accent-red uppercase block">
                        Friday 4 Dec
                      </span>
                      <p className="font-bold text-ink">19:00 – 00:00</p>
                      <p className="text-ink/70 text-[11px] leading-snug">
                        Classes &amp; Welcome Party
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink border border-ink bg-paper px-1.5 py-0.5">
                          <MapPin className="h-2.5 w-2.5" /> BOH Studios
                        </span>
                      </div>
                    </div>

                    <div className="border-2 border-ink bg-surface-1 p-3 space-y-1">
                      <span className="font-display text-base text-accent-red uppercase block">
                        Saturday 5 Dec
                      </span>
                      <p className="font-bold text-ink">12:00 – 17:00 Workshops</p>
                      <p className="font-bold text-ink">20:00 – 02:00 Fiesta</p>
                      <p className="text-ink/70 text-[11px] leading-snug">
                        Classes, 2 Shows &amp; 2-Room Party
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink border border-ink bg-paper px-1.5 py-0.5">
                          <MapPin className="h-2.5 w-2.5" /> BOH Studios
                        </span>
                      </div>
                    </div>

                    <div className="border-2 border-ink bg-surface-1 p-3 space-y-1">
                      <span className="font-display text-base text-accent-red uppercase block">
                        Sunday 6 Dec
                      </span>
                      <p className="font-bold text-ink">18:00 – 00:00</p>
                      <p className="text-ink/70 text-[11px] leading-snug">
                        Classes &amp; Social Dancing Finale
                      </p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink border border-ink bg-paper px-1.5 py-0.5">
                          <MapPin className="h-2.5 w-2.5" /> BOH Studios
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artists Announcement Callout */}
                <div className="border-2 border-ink bg-poster-mustard/30 p-3 flex items-center gap-2.5 text-xs">
                  <span className="text-lg">🔥</span>
                  <div>
                    <span className="font-bold uppercase text-ink">
                      ARTISTS ANNOUNCEMENT COMING SOON!
                    </span>
                    <p className="text-[11px] text-ink font-medium">
                      Featuring top UK and international Cuban dance maestros, performers and guest DJs.
                    </p>
                  </div>
                </div>

                {/* Contact & Enquiries Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t-2 border-ink">
                  <div className="flex items-center gap-2">
                    <a
                      href="https://wa.me/447969633701?text=Hi%20Enrique,%20I'd%20like%20more%20info%20about%20the%20Made%20in%20Cuba%20Dance%20Festival%202026%20please!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-3 py-1 text-xs`}
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      <span>WhatsApp Enrique: 07969 633701</span>
                    </a>
                    <a
                      href="mailto:info@salsaexplosion.co.uk"
                      className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper min-h-[40px] px-3 py-1 text-xs`}
                    >
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      <span>info@salsaexplosion.co.uk</span>
                    </a>
                  </div>
                  <a
                    href="https://www.instagram.com/salsaexplosion/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-accent-red hover:underline inline-flex items-center gap-1"
                  >
                    <InstagramIcon className="h-3.5 w-3.5" />
                    <span>@salsaexplosion</span>
                  </a>
                </div>
              </div>

              {/* Right Poster Display Column */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[340px] aspect-square rotate-[-2deg] border-[6px] border-ink shadow-[10px_10px_0_0_#161311] bg-ink">
                  <Image
                    src="/images/made-in-cuba-2026-poster.jpg"
                    alt="MADE IN CUBA Dance Festival 2026 Bournemouth Official Poster"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 360px"
                    priority
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/70 mt-3 text-center">
                  Official Festival Artwork · 4, 5 &amp; 6 December 2026
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Special Halloween Prizes & Party Schedule Banner */}
        {event.slug.includes("halloween") && (
          <section className="border-4 border-ink bg-paper p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_0_#161311] text-ink">
            <div className="grid gap-6 lg:grid-cols-12 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-ink pb-3">
                  <div>
                    <span className="border-2 border-ink bg-poster-red px-2 py-0.5 text-xs font-bold uppercase text-ink">
                      Best Costume Prizes
                    </span>
                    <h2 className={`font-display ${TYPE.card} sm:text-4xl text-ink leading-tight mt-2`}>
                      Halloween Fancy Dress Party &amp; Costume Contest
                    </h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                    Judging &amp; Awards at Midnight
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="border-2 border-ink bg-poster-mustard/20 p-4 space-y-1 text-center">
                    <span className="text-2xl font-black">🥇</span>
                    <h3 className="font-display text-lg text-accent-red">1ST PRIZE</h3>
                    <p className="text-xs font-bold text-ink">1 Made in Cuba Weekend Pass</p>
                  </div>
                  <div className="border-2 border-ink bg-paper p-4 space-y-1 text-center">
                    <span className="text-2xl font-black">🥈</span>
                    <h3 className="font-display text-lg text-ink">2ND PRIZE</h3>
                    <p className="text-xs font-bold text-ink">2 Free Dance Classes</p>
                  </div>
                  <div className="border-2 border-ink bg-paper p-4 space-y-1 text-center">
                    <span className="text-2xl font-black">🥉</span>
                    <h3 className="font-display text-lg text-ink">3RD PRIZE</h3>
                    <p className="text-xs font-bold text-ink">1 Free Entry to Next Party</p>
                  </div>
                </div>

                <div className="border-2 border-ink bg-surface-1 p-5 space-y-3">
                  <h3 className="font-display text-lg text-ink flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent-red" />
                    Evening Timetable (20:00 – 02:00):
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-3 text-xs">
                    <div className="border border-ink bg-paper p-2.5">
                      <span className="font-bold text-accent-red block">20:00 · Doors Open</span>
                      <span className="text-ink">20:15 · Bachata Improvers with Alex Spindlove</span>
                    </div>
                    <div className="border border-ink bg-paper p-2.5">
                      <span className="font-bold text-accent-red block">21:15 · Workshop Rooms</span>
                      <span className="text-ink">Rueda De Casino Int + Salsa/Timba Imp &amp; Int</span>
                    </div>
                    <div className="border border-ink bg-paper p-2.5">
                      <span className="font-bold text-accent-red block">22:00 – 02:00 · Fiesta</span>
                      <span className="text-ink">SB&amp;K Social Dance Party with DJ Enrique</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-ink/70 pt-1">
                  <span>Direct bookings &amp; WhatsApp: <strong className="text-ink">07969 633701</strong></span>
                  <span>Parking: <strong className="text-ink">Avenue Rd (BH2 5SL) / West Hill (BH2 5PG)</strong></span>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[280px] aspect-[3/4] rotate-[2deg] border-[6px] border-ink shadow-[10px_10px_0_0_#161311] bg-ink">
                  <Image
                    src="/images/halloween-latin-party-poster.png"
                    alt="Halloween Latin Party Poster"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Guest Maestros & Highlights */}
        <div className="grid gap-6 md:grid-cols-3">
          <article className="border-4 border-ink bg-paper p-5 text-ink shadow-[6px_6px_0_0_#161311] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <Flame className="h-5 w-5 text-accent-red" />
              <h3 className={`font-display ${TYPE.card} text-ink`}>
                Guest Artists
              </h3>
            </div>
            <div className="space-y-2">
              {event.guestArtists.map((artist) => (
                <div
                  key={artist}
                  className="flex items-center gap-2 text-xs font-bold"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent-teal" />
                  <span>{artist}</span>
                </div>
              ))}
              {event.guestArtists.length === 0 && (
                <p className="text-xs text-ink/70 font-medium">
                  Led by Maestro Enrique Perez Valdes with visiting Cuban guest artists.
                </p>
              )}
            </div>
          </article>

          <article className="border-4 border-ink bg-paper p-5 text-ink shadow-[6px_6px_0_0_#161311] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <ShieldCheck className="h-5 w-5 text-accent-teal" />
              <h3 className={`font-display ${TYPE.card} text-ink`}>
                Everyone Dances
              </h3>
            </div>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Choose Lead or Follow when you book so the teachers can plan the rotations. It is never a limit: no partner needed, and the workshops rotate so nobody sits out.
            </p>
          </article>

          <article className="border-4 border-ink bg-paper p-5 text-ink shadow-[6px_6px_0_0_#161311] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <Clock className="h-5 w-5 text-poster-mustard" />
              <h3 className={`font-display ${TYPE.card} text-ink`}>
                Instant Door Pass
              </h3>
            </div>
            <p className="text-xs text-ink leading-relaxed font-medium">
              Tickets are issued immediately to your account with a cryptographically verified QR code for 1-second entrance scanning on arrival.
            </p>
          </article>
        </div>

        {/* Interactive Pass Selection & QR Pass Issuance */}
        <div className="space-y-6">
          <div className="border-b-4 border-ink pb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className={`font-display ${TYPE.section} text-ink leading-tight`}>
              {eventFinished ? "Passes & Tickets" : "Available Passes"}
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/70">
              {eventFinished
                ? "Online sales closed."
                : "Instant digital ticketing · Pay securely with Stripe"}
            </p>
          </div>

          <EventPassSelector
            tiers={serializedTiers}
            defaultPreferredRole={currentUser?.preferredRole ?? DanceRole.LEAD}
            purchasesUnavailable={isCanonicalFallback}
            eventFinished={eventFinished}
          />

          {/* UK Consumer Rights Notice */}
          <div className="border-2 border-ink bg-poster-mustard/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent-teal" />
              <span>
                <strong className="font-bold">UK Consumer Notice:</strong> Under Regulation 28(1)(h) of the Consumer Contracts Regulations 2013, dated event tickets are exempt from cooling-off refunds; however, Salsa Explosion offers <strong>100% free dancer name transfers</strong> up to 48 hours before the event.
              </span>
            </div>
            <Link
              href="/terms#refunds"
              className="font-bold uppercase text-accent-red hover:underline shrink-0"
            >
              Transfer Policy →
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
    </>
  );
}
