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
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`fill-current shrink-0 ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
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

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      coverImageUrl: true,
    },
  });

  if (!event) {
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
      name: event.venueName || "BOH Studios",
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress || "BOH Studios, 114 Commercial Road",
        addressLocality: "Bournemouth",
        postalCode: "BH2 5LR",
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
      availability: "https://schema.org/InStock",
      url: `https://salsaexplosion.co.uk/events/${event.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <BackButton fallbackUrl="/events" label="Back to Events" />
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-500 p-5 sm:p-12 text-white shadow-lg">
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

      {/* Special Flagship MADE IN CUBA Dance Festival 2026 Showcase */}
      {event.slug.includes("made-in-cuba") && (
        <div
          data-testid="made-in-cuba-festival-showcase"
          className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-background to-orange-950/30 p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-sm">
                    🎉 Celebrating 25+ Years of Salsa Explosion Heritage!
                  </Badge>
                  <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-500/10 text-xs font-bold">
                    South Coast’s Premier Cuban Dance Event
                  </Badge>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  MADE IN CUBA DANCE FESTIVAL 2026
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-300">
                  Bournemouth • Friday 4, Saturday 5 &amp; Sunday 6 December 2026
                </p>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  Welcome to <strong>MADE IN CUBA DANCE WEEKEND</strong> — get ready for an unforgettable weekend celebrating authentic Cuban dance, music, culture and community. Three days. Three nights. Incredible dancers. Authentic Cuban flavour. One amazing community!
                </p>
              </div>

              {/* What to Expect Grid (7 Key Features) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  What to Expect
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">🌙</span>
                    3 Nights of Parties
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">🎓</span>
                    2 Days of Workshops
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">🎭</span>
                    2 Spectacular Shows
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">⭐</span>
                    Dancing with the Stars
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground col-span-2 sm:col-span-2">
                    <span className="block text-lg">💃</span>
                    Social Dancing Until 02:00
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">🇨🇺</span>
                    Room 1: Salsa &amp; Timba
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center font-bold text-foreground">
                    <span className="block text-lg">🇩🇴</span>
                    Room 2: Bachata Room
                  </div>
                </div>
              </div>

              {/* 3-Day Weekend Programme */}
              <div className="rounded-2xl border bg-card/80 p-4 sm:p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  The Weekend Programme (By Venue &amp; Hours):
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                  <div className="p-3 rounded-xl border border-border/80 bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 uppercase tracking-wider text-[11px]">
                        Friday 4 Dec
                      </span>
                    </div>
                    <p className="font-extrabold text-foreground">19:00 – 00:00</p>
                    <p className="text-muted-foreground text-[11px] leading-snug">
                      Classes &amp; Welcome Party
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <MapPin className="h-2.5 w-2.5" /> BOH Studios Bournemouth
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/80 bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 uppercase tracking-wider text-[11px]">
                        Saturday 5 Dec
                      </span>
                    </div>
                    <p className="font-extrabold text-foreground">12:00 – 17:00 Workshops</p>
                    <p className="font-extrabold text-foreground">20:00 – 02:00 Fiesta</p>
                    <p className="text-muted-foreground text-[11px] leading-snug">
                      Classes, 2 Shows &amp; 2-Room Party
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <MapPin className="h-2.5 w-2.5" /> BOH Studios
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/80 bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 uppercase tracking-wider text-[11px]">
                        Sunday 6 Dec
                      </span>
                    </div>
                    <p className="font-extrabold text-foreground">18:00 – 00:00</p>
                    <p className="text-muted-foreground text-[11px] leading-snug">
                      Classes &amp; Social Dancing Finale
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <MapPin className="h-2.5 w-2.5" /> BOH Studios
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artists Announcement Callout */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 p-3 flex items-center gap-2.5 text-xs">
                <span className="text-lg">🔥</span>
                <div>
                  <span className="font-extrabold text-amber-200">
                    ARTISTS ANNOUNCEMENT COMING SOON!
                  </span>
                  <p className="text-[11px] text-foreground/80">
                    Featuring top UK and international Cuban dance maestros, performers and guest DJs.
                  </p>
                </div>
              </div>

              {/* Contact & Enquiries Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/447969633701?text=Hi%20Enrique,%20I'd%20like%20more%20info%20about%20the%20Made%20in%20Cuba%20Dance%20Festival%202026%20please!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-bold shadow-xs"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>WhatsApp Enrique: 07969 633701</span>
                  </a>
                  <a
                    href="mailto:info@salsaexplosion.co.uk"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-bold hover:bg-muted"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>info@salsaexplosion.co.uk</span>
                  </a>
                </div>
                <a
                  href="https://www.instagram.com/salsaexplosion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-rose-400 hover:underline inline-flex items-center gap-1"
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>@salsaexplosion</span>
                </a>
              </div>
            </div>

            {/* Right Poster Display Column */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-2xl group ring-4 ring-amber-500/20 bg-surface-1">
                <Image
                  src="/images/made-in-cuba-2026-poster.jpg"
                  alt="MADE IN CUBA Dance Festival 2026 Bournemouth Official Poster — Celebrating 25+ Years of Salsa Explosion Heritage"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 360px"
                  priority
                />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground mt-2 text-center">
                Official Festival Artwork • 4, 5 &amp; 6 December 2026
              </span>
            </div>
          </div>
        </div>
      )}

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
                  <h4 className="text-sm font-black text-amber-300">1ST PRIZE</h4>
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
                  Evening Timetable (20:00 – 02:00):
                </h4>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-300 block">20:00 • Doors Open</span>
                    <span className="text-foreground">20:15 • Bachata Improvers onwards with Alex Spindlove</span>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-300 block">21:15 • Workshop Rooms</span>
                    <span className="text-foreground">Rueda De Casino Intermediates + Salsa/Timba Improvers &amp; Int</span>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-muted/40">
                    <span className="font-extrabold text-amber-300 block">22:00 – 02:00 • Fiesta</span>
                    <span className="text-foreground">SB&amp;K Social Dance Party with DJ Enrique</span>
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
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong className="font-extrabold">UK Consumer Notice:</strong> Under Regulation 28(1)(h) of the Consumer Contracts Regulations 2013, dated event tickets are exempt from cooling-off refunds; however, Salsa Explosion offers <strong>100% free dancer name transfers</strong> up to 48 hours before the event.
            </span>
          </div>
          <Link
            href="/terms#refunds"
            className="font-bold text-amber-300 hover:underline shrink-0"
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
    </>
  );
}
