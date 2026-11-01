import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { ClaveMark, DecorativeFan, HeroPicture, MockupSwitcher, SongFan } from "@/components/mockups/mockup-art";
import {
  DOOR_PRICING,
  FACTS,
  FEATURED_SONG,
  MOVE_FAMILIES,
  NEXT_EVENTS,
  PHOTOS,
  REAL_PHOTOS,
  SCHEDULE,
  SCORE_SONGS,
  SONG_COUNT,
  VENUE_INFO,
  gearsIn,
  songDurationLabel,
  type GearPalette,
} from "@/components/mockups/mockup-data";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--mp-display",
  display: "swap",
});
const jost = Jost({ subsets: ["latin"], variable: "--mp-text", display: "swap" });

export const metadata = { title: "Mock-up · Mediopunto" };

/** Candidate stained-glass palette; would become design tokens if this direction wins. */
const GLASS = {
  night: "#120E0C",
  plaster: "#EFE5D3",
  ruby: "#A3212C",
  amber: "#E0A02A",
  cobalt: "#23509A",
  emerald: "#1F7552",
  amethyst: "#5A3B8C",
  rose: "#C76A7A",
  ivory: "#F5F2EB",
  lead: "#2A221C",
} as const;

const GEARS: GearPalette = {
  "Wait / Breathe": "#CFC3AD",
  "Son Cubano": GLASS.cobalt,
  "Casino (Smooth)": GLASS.emerald,
  "Casino (Flow)": GLASS.amber,
  "Rumba Guaguancó": GLASS.ruby,
  "Afro-Cuban Orishas": GLASS.amethyst,
  "Suelta / Shines": GLASS.rose,
  "Despelote / Reparto": "#7A1A22",
};
const FAN_COLORS = [GLASS.ruby, GLASS.amber, GLASS.cobalt, GLASS.emerald, GLASS.amber, GLASS.rose];

// Type scale (max 9 sizes per route)
const H1 = "text-5xl leading-[0.95] md:text-7xl";
const H2 = "text-4xl leading-tight md:text-6xl";
const H3 = "text-2xl leading-snug";
const serif: CSSProperties = { fontFamily: "var(--mp-display)" };

const pill = "inline-flex min-h-[48px] items-center rounded-full px-6 text-sm font-medium tracking-wide";
const arch = "overflow-hidden rounded-t-full";

/** A band of Havana hydraulic floor tiles (inline SVG pattern). */
function TileBand({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} width="100%" height="56" aria-hidden="true">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill={GLASS.plaster} />
          <path d="M0 0 h14 a14 14 0 0 1 -14 14 Z" fill={GLASS.ruby} />
          <path d="M56 0 v14 a14 14 0 0 1 -14 -14 Z" fill={GLASS.ruby} />
          <path d="M0 56 v-14 a14 14 0 0 1 14 14 Z" fill={GLASS.ruby} />
          <path d="M56 56 h-14 a14 14 0 0 1 14 -14 Z" fill={GLASS.ruby} />
          <path d="M28 10 L46 28 L28 46 L10 28 Z" fill={GLASS.cobalt} />
          <circle cx="28" cy="28" r="6" fill={GLASS.amber} />
          <rect width="56" height="56" fill="none" stroke={GLASS.lead} strokeOpacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="56" fill={`url(#${id})`} />
    </svg>
  );
}

export default function MediopuntoMockupPage() {
  const [featured, ...others] = SCORE_SONGS.length ? SCORE_SONGS : [FEATURED_SONG];

  return (
    <main
      className={`${cormorant.variable} ${jost.variable} min-h-screen`}
      style={{ backgroundColor: GLASS.night, color: GLASS.ivory, fontFamily: "var(--mp-text)" }}
    >
      <MockupSwitcher current="mediopunto" />

      {/* HERO: stained-glass fan over an arched doorway */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10 md:px-10 md:pb-24">
        <DecorativeFan colors={FAN_COLORS} lead={GLASS.lead} className="mx-auto w-full max-w-3xl opacity-90" />
        <div className="mx-auto mt-6 grid max-w-6xl gap-10 md:-mt-2 md:grid-cols-12 md:items-center">
          <div className="text-center md:col-span-7 md:text-left">
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GLASS.amber }}>
              Salsa Explosion · {VENUE_INFO.city}
            </p>
            <h1 className={`mt-4 italic ${H1}`} style={serif}>
              Havana is just outside the door.
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg font-light md:mx-0">
              Cuban casino, rueda and timba with {FACTS.founder}, born in {FACTS.origin}. Thursdays and Sundays at{" "}
              {VENUE_INFO.shortName}; every song ready to practise at home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/music" className={pill} style={{ backgroundColor: GLASS.amber, color: GLASS.night }}>
                Practise the songs
              </Link>
              <Link href="#semana" className={pill} style={{ border: `1px solid ${GLASS.amber}`, color: GLASS.amber }}>
                This week at {VENUE_INFO.shortName}
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="mx-auto max-w-sm rounded-t-full border p-2" style={{ borderColor: GLASS.amber }}>
              <div className={arch}>
                <HeroPicture
                  desktop={PHOTOS.laVueltaHeroMobile}
                  mobile={PHOTOS.laVueltaHeroMobile}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHT THROUGH GLASS */}
      <figure>
        <Image
          src={PHOTOS.mediopuntoLight.src}
          alt={PHOTOS.mediopuntoLight.alt}
          width={PHOTOS.mediopuntoLight.width}
          height={PHOTOS.mediopuntoLight.height}
          sizes="100vw"
          className="aspect-[16/9] w-full object-cover md:aspect-auto"
        />
        <figcaption className="mx-auto max-w-3xl px-4 py-6 text-center text-sm font-light italic opacity-80" style={serif}>
          Light through a mediopunto: the coloured glass fans above Havana doorways.
        </figcaption>
      </figure>

      {/* EVERY SONG IS A WINDOW */}
      <section className="px-4 py-16 md:px-10 md:py-24" style={{ backgroundColor: GLASS.plaster, color: GLASS.night }}>
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GLASS.ruby }}>
            Practise at home
          </p>
          <h2 className={`mt-3 italic ${H2}`} style={serif}>
            Every song is a window
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-light">
            Each pane is one section of the song, sized by how long it lasts and coloured by how to dance it. The player
            lights them up as the music plays. {SONG_COUNT} songs and counting.
          </p>

          <Link href={`/music/${featured.id}`} className="mx-auto mt-10 block max-w-2xl" aria-label={`Practise ${featured.title}`}>
            <SongFan song={featured} palette={GEARS} lead={GLASS.lead} className="w-full" />
            <p className={`mt-3 italic ${H3}`} style={serif}>
              {featured.title}
            </p>
            <p className="text-sm">
              {featured.artist} · {featured.segments.length} panes · {songDurationLabel(featured)}
            </p>
          </Link>

          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {gearsIn(featured).map((gear) => (
              <li key={gear} className="flex items-center gap-2">
                <span className="h-3 w-5 rounded-t-full" style={{ backgroundColor: GEARS[gear] }} aria-hidden="true" />
                {gear}
              </li>
            ))}
          </ul>

          {others.length > 0 && (
            <ul className="mx-auto mt-14 grid max-w-3xl gap-10 sm:grid-cols-2">
              {others.map((song) => (
                <li key={song.id}>
                  <Link href={`/music/${song.id}`} className="block">
                    <SongFan song={song} palette={GEARS} lead={GLASS.lead} className="w-full" />
                    <p className={`mt-2 italic ${H3}`} style={serif}>
                      {song.title}
                    </p>
                    <p className="text-sm">{song.artist}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <TileBand id="mp-tiles-a" />

      {/* MOVE LIBRARY TEASER: arched doorways */}
      <section className="px-4 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GLASS.amber }}>
            Coming soon
          </p>
          <h2 className={`mt-3 italic ${H2}`} style={serif}>
            The move library
          </h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {MOVE_FAMILIES.map((family, index) => (
              <li key={family.name}>
                <div className="rounded-t-full border p-1.5" style={{ borderColor: FAN_COLORS[index] }}>
                  <div className={`relative aspect-[3/4] ${arch}`}>
                    <Image src={family.photo.src} alt={family.photo.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                  </div>
                </div>
                <h3 className={`mt-4 italic ${H3}`} style={serif}>
                  {family.spanish}
                </h3>
                <p className="text-sm font-light">
                  {family.name}: {family.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WEEKLY SCHEDULE on plaster, between tile bands */}
      <TileBand id="mp-tiles-b" />
      <section id="semana" className="px-4 py-16 md:px-10 md:py-24" style={{ backgroundColor: GLASS.plaster, color: GLASS.night }}>
        <div className="mx-auto max-w-6xl">
          <h2 className={`italic ${H2}`} style={serif}>
            This week at {VENUE_INFO.shortName}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SCHEDULE.map((day, index) => (
              <article key={day.id} className="rounded-t-[3rem] border-t-8 bg-white/60 p-6 md:p-8" style={{ borderColor: index ? GLASS.cobalt : GLASS.ruby }}>
                <h3 className={`italic ${H2}`} style={serif}>
                  {day.dayPlural}
                </h3>
                <p className="mt-1 text-sm uppercase tracking-widest">
                  {day.headline} · doors {day.doorsTime}
                </p>
                <ul className="mt-6 space-y-4">
                  {day.classes.map((session) => (
                    <li key={session.id} className="grid grid-cols-[4rem_1fr] gap-3">
                      <span className={`tabular-nums ${H3}`} style={serif}>
                        {session.time}
                      </span>
                      <span>
                        <span className="block font-medium">{session.title}</span>
                        <span className="text-sm font-light">
                          {session.level} · {session.instructor}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                {day.social && (
                  <p className="mt-6 text-sm italic" style={serif}>
                    Then the social: {day.social.title}, {day.social.time}
                  </p>
                )}
              </article>
            ))}
          </div>
          <p className="mt-10 text-center">
            <span className={`italic ${H2}`} style={{ ...serif, color: GLASS.ruby }}>
              £{DOOR_PRICING.oneClassPounds} · £{DOOR_PRICING.twoClassesPounds}
            </span>
            <span className="mt-2 block text-sm">
              {DOOR_PRICING.summaryBadge}. {DOOR_PRICING.paymentMethodNote}.
            </span>
          </p>
        </div>
      </section>
      <TileBand id="mp-tiles-c" />

      {/* REAL PHOTOS: maestro + venue */}
      <section className="px-4 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="mx-auto w-full max-w-sm">
            <div className="rounded-t-full border p-2" style={{ borderColor: GLASS.amber }}>
              <Image
                src={REAL_PHOTOS.maestro.src}
                alt={REAL_PHOTOS.maestro.alt}
                width={REAL_PHOTOS.maestro.width}
                height={REAL_PHOTOS.maestro.height}
                sizes="(max-width: 768px) 90vw, 24rem"
                className="aspect-[4/5] w-full rounded-t-full object-cover"
              />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GLASS.amber }}>
              El maestro
            </p>
            <h2 className={`mt-3 italic ${H2}`} style={serif}>
              {FACTS.founder}
            </h2>
            <p className="mt-5 text-lg font-light">
              From {FACTS.origin}. {FACTS.heritage} of Cuban dance in the UK, {FACTS.dancers}{" "}
              {FACTS.dancersLabel.toLowerCase()}, {FACTS.award}.
            </p>
            <figure className="mt-8">
              <Image
                src={REAL_PHOTOS.venueSocial.src}
                alt={REAL_PHOTOS.venueSocial.alt}
                width={REAL_PHOTOS.venueSocial.width}
                height={REAL_PHOTOS.venueSocial.height}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-2 text-sm font-light">
                Real photo: a social at {VENUE_INFO.fullAddress}.{" "}
                <a href={VENUE_INFO.googleMapsUrl} className="inline-flex min-h-[40px] items-center underline underline-offset-4" style={{ color: GLASS.amber }}>
                  Directions
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      {NEXT_EVENTS.length > 0 && (
        <section className="px-4 pb-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className={`italic ${H2}`} style={serif}>
              Fiestas to come
            </h2>
            <ul className="mt-8 divide-y" style={{ borderColor: GLASS.lead }}>
              {NEXT_EVENTS.map((event, index) => (
                <li key={event.slug} className="grid gap-2 py-6 md:grid-cols-[12rem_1fr_auto] md:items-center md:gap-8">
                  <span className="text-sm uppercase tracking-widest" style={{ color: FAN_COLORS[index % FAN_COLORS.length] }}>
                    {event.dateBadge}
                  </span>
                  <span>
                    <span className={`block italic ${H3}`} style={serif}>
                      {event.title}
                    </span>
                    <span className="text-sm font-light">{event.priceDisplay}</span>
                  </span>
                  <Link href={`/events/${event.slug}`} className={pill} style={{ border: `1px solid ${GLASS.amber}`, color: GLASS.amber }}>
                    Tickets
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="flex flex-col items-center gap-4 border-t px-4 py-12 text-center" style={{ borderColor: GLASS.lead }}>
        <ClaveMark color={GLASS.amber} className="h-6 w-48" />
        <p className="text-sm font-light">
          {VENUE_INFO.phoneDisplay} · {VENUE_INFO.instagramHandle} · {VENUE_INFO.address}
        </p>
        <p className="text-xs uppercase tracking-widest opacity-60">Art-direction mock-up, not the live site</p>
      </footer>
    </main>
  );
}
