import Image from "next/image";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { PosterBanner } from "@/components/poster/poster-art";
import { MessageSquare, Phone, Sparkles, MapPin } from "lucide-react";
import { PrivateLessonsClient } from "@/components/lessons/private-lessons-client";
import { GRAPHICS } from "@/lib/site-content";
import { VENUE_INFO } from "@/lib/academy-data";
import { COACHING_INSTRUCTORS_CATALOG } from "@/lib/constants/coaching";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

const COACHES = Object.values(COACHING_INSTRUCTORS_CATALOG);
const FROM_HOURLY = Math.min(...COACHES.map((c) => c.hourlyRatePounds));
const FROM_BLOCK = Math.min(...COACHES.map((c) => c.blockRatePounds));
const TEACHER_NAMES = COACHES.filter((c) => c.id !== "enrique").map((c) => c.name);
const WHATSAPP_HREF = `${VENUE_INFO.whatsappHref}?text=${encodeURIComponent("Hi Enrique, I would like to ask about a private dance lesson please!")}`;

export const metadata = {
  title: "Private Cuban Salsa Lessons",
  description:
    "One-to-one Cuban salsa and rueda lessons in Bournemouth with Enrique and the Salsa Explosion teachers, for beginners and wedding couples.",
  alternates: { canonical: "/private-lessons" },
};

export default function PrivateLessonsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Poster Architectural Hero with Framed Photo & Dancing Shoes Woodcut */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_var(--color-ink)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>Clases privadas · Private lessons</span>
          <span className="opacity-70">
            {VENUE_INFO.shortName} · {VENUE_INFO.city} {VENUE_INFO.postcode}
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h1 className={`${TYPE.section} text-ink`}>
              1-ON-1 PRIVATE <span className="text-accent-red">Coaching</span>
            </h1>
            <p className="text-sm font-semibold text-ink leading-relaxed">
              On your own or as a couple: settle your basic step, learn the rueda calls, or get a wedding first dance
              ready. With Maestro Enrique Perez Valdes or one of the Salsa Explosion teachers ({TEACHER_NAMES.join(", ")}).
            </p>

            {/* Silkscreen Stamp Style CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} border-poster-teal bg-poster-teal text-ink hover:bg-ink hover:text-paper text-xs font-black uppercase tracking-wider px-4 py-2.5 min-h-[44px] shadow-[4px_4px_0_0_var(--color-ink)] inline-flex items-center gap-2`}
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Enrique: {VENUE_INFO.phoneDisplay}
              </a>
              <a
                href={VENUE_INFO.phoneHref}
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2`}
              >
                <Phone className="h-4 w-4" />
                Call Enrique
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2 border-t-2 border-ink">
              <div className="flex items-center gap-1.5 text-accent-red">
                <Sparkles className="h-4 w-4" />
                <span>
                  One hour from £{FROM_HOURLY} · 5-hour blocks from £{FROM_BLOCK} · Nothing to pay online
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-ink">
                <MapPin className="h-4 w-4" />
                <span>
                  {VENUE_INFO.name} ({VENUE_INFO.floor})
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Framed Enrique Portrait with Dancing Shoes Woodcut Stamp */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
            <div className="relative w-48 sm:w-56 aspect-[3/4] border-4 border-ink bg-ink shadow-[8px_8px_0_0_var(--color-ink)] rotate-[-2deg]">
              <Image
                src="/images/instructors/enrique.jpg"
                alt="Maestro Enrique Perez Valdes"
                fill
                sizes="(max-width: 768px) 200px, 240px"
                className="object-cover"
                priority
              />
              <div className="absolute -bottom-3 -right-3 bg-poster-mustard border-2 border-ink px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
                Maestro Enrique
              </div>
            </div>

            {/* ICAIC Dancing Shoes Woodcut Element */}
            {GRAPHICS.shoes && (
              <div className="mt-4 flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 shadow-[3px_3px_0_0_var(--color-ink)]">
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src={GRAPHICS.shoes.src}
                    alt={GRAPHICS.shoes.alt}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <span className="font-display font-black text-xs uppercase tracking-wider text-ink">
                  Footwork, timing &amp; styling
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <PosterBanner image={MEDIA_MANIFEST.editorial.bannerDoor} caption="Las puertas abiertas" />

      {/* Private Lessons Booking Wizard */}
      <PrivateLessonsClient initialBookings={[]} />
    </main>
  );
}
