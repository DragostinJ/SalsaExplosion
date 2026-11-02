import Image from "next/image";
import { MessageSquare, Phone, Sparkles, MapPin } from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { PrivateLessonsClient } from "@/components/lessons/private-lessons-client";
import { GRAPHICS } from "@/lib/site-content";
import { VENUE_INFO } from "@/lib/academy-data";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

export const metadata = {
  title: "1-on-1 Private Lessons & Coaching | Salsa Explosion Bournemouth",
  description:
    "Book bespoke private dance coaching with Cuban Maestro Enrique Perez Valdes, Moe Flex, Justyna, Arturas, or Jim at BOH Studios Bournemouth.",
};

export default function PrivateLessonsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Poster Architectural Hero with Framed Photo & Dancing Shoes Woodcut */}
      <section
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[8px_8px_0_0_#161311]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-3 text-xs font-bold uppercase tracking-[0.3em] text-ink">
          <span>MAESTRO-LEVEL MENTORSHIP &amp; BESPOKE COACHING</span>
          <span className="opacity-70">{VENUE_INFO.shortName} • BOURNEMOUTH BH2 5LR</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className={KICKER}>Personalized Cuban Salsa Mastery</p>
            <h1 className={`${TYPE.section} text-ink`}>
              1-ON-1 PRIVATE <span className="text-poster-red">Coaching</span>
            </h1>
            <p className="text-sm font-semibold text-ink/80 leading-relaxed">
              Accelerate your social dancing, master complex Rueda calls, or prepare an unforgettable wedding first dance under the personal direction of Maestro Enrique Perez Valdes and Salsa Explosion faculty (Moe Flex, Justyna, Arturas, Jim).
            </p>

            {/* Silkscreen Stamp Style CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://wa.me/447969633701?text=Hi%20Enrique%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20dance%20lesson%20please!"
                target="_blank"
                rel="noopener noreferrer"
                className={`${POSTER_BUTTON} border-poster-teal bg-poster-teal text-ink hover:bg-ink hover:text-paper text-xs font-black uppercase tracking-wider px-4 py-2.5 min-h-[44px] shadow-[4px_4px_0_0_#161311] inline-flex items-center gap-2`}
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Maestro Enrique: 07969 633701
              </a>
              <a
                href="tel:+447969633701"
                className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2`}
              >
                <Phone className="h-4 w-4" />
                Call Studio Desk
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2 border-t-2 border-ink">
              <div className="flex items-center gap-1.5 text-poster-red">
                <Sparkles className="h-4 w-4" />
                <span>Single Lessons from £70 • 5-Hour Blocks £300</span>
              </div>
              <div className="flex items-center gap-1.5 text-ink/80">
                <MapPin className="h-4 w-4" />
                <span>BOH Studios Bournemouth (Canadian Maple Sprung Floor)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Framed Enrique Portrait with Dancing Shoes Woodcut Stamp */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
            <div className="relative w-48 sm:w-56 aspect-[3/4] border-4 border-ink bg-ink shadow-[8px_8px_0_0_#161311] rotate-[-2deg]">
              <Image
                src="/images/instructors/enrique.jpg"
                alt="Maestro Enrique Perez Valdes"
                fill
                sizes="(max-width: 768px) 200px, 240px"
                className="object-cover"
                priority
              />
              <div className="absolute -bottom-3 -right-3 bg-poster-mustard border-2 border-ink px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#161311]">
                Maestro Enrique
              </div>
            </div>

            {/* ICAIC Dancing Shoes Woodcut Element */}
            {GRAPHICS.shoes && (
              <div className="mt-4 flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 shadow-[3px_3px_0_0_#161311]">
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
                  ICAIC Footwork Masterclass
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Private Lessons Booking Wizard */}
      <PrivateLessonsClient initialBookings={[]} />
    </main>
  );
}
