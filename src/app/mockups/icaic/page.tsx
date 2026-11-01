import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Anton, Archivo } from "next/font/google";
import { ClaveMark, HeroPicture, MockupSwitcher, SongStripes } from "@/components/mockups/mockup-art";
import {
  DOOR_PRICING,
  FACTS,
  FEATURED_SONG,
  MOVE_FAMILIES,
  NEXT_EVENTS,
  PHOTOS,
  REAL_PHOTOS,
  SCHEDULE,
  SONG_COUNT,
  SPANISH_DAY,
  VENUE_INFO,
  gearsIn,
  type GearPalette,
} from "@/components/mockups/mockup-data";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--ic-display", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--ic-text", display: "swap" });

export const metadata = { title: "Mock-up · ICAIC Poster" };

/** Candidate silkscreen inks; they would become design tokens if this direction wins. */
const INK = {
  paper: "#F1E6D0",
  ink: "#161311",
  red: "#E4412B",
  mustard: "#F4B41A",
  teal: "#12938F",
  blue: "#22418F",
  pink: "#EE7BA0",
  plum: "#5B2A6E",
} as const;

const GEARS: GearPalette = {
  "Wait / Breathe": "#D9CCB2",
  "Son Cubano": INK.blue,
  "Casino (Smooth)": INK.teal,
  "Casino (Flow)": INK.mustard,
  "Rumba Guaguancó": INK.red,
  "Afro-Cuban Orishas": INK.plum,
  "Suelta / Shines": INK.pink,
  "Despelote / Reparto": INK.ink,
};
const DARK_TEXT_GEARS = new Set(["Wait / Breathe", "Casino (Flow)", "Suelta / Shines"]);
const POSTER_COLORS = [INK.red, INK.teal, INK.mustard, INK.blue];

// Type scale (max 9 sizes per route)
const H1 = "text-[21vw] leading-[0.82] md:text-[10.5vw]";
const H2 = "text-6xl leading-[0.9] md:text-8xl";
const H3 = "text-3xl leading-none";
const BIG = "text-5xl leading-none";
const display: CSSProperties = { fontFamily: "var(--ic-display)" };

const halftone = (color: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `radial-gradient(circle, ${INK.ink} 1.4px, transparent 1.8px)`,
  backgroundSize: "9px 9px",
});

const button =
  "inline-flex min-h-[48px] items-center border-4 px-5 font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5";

export default function IcaicMockupPage() {
  const legend = gearsIn(FEATURED_SONG);

  return (
    <main
      className={`${anton.variable} ${archivo.variable} min-h-screen`}
      style={{ backgroundColor: INK.paper, color: INK.ink, fontFamily: "var(--ic-text)" }}
    >
      <MockupSwitcher current="icaic" />

      {/* HERO: film-poster composition */}
      <section className="relative overflow-hidden px-4 pb-10 pt-8 md:px-10 md:pb-14 md:pt-12">
        <div
          aria-hidden="true"
          className="absolute -right-28 top-16 h-[380px] w-[380px] rounded-full md:right-[8%] md:top-10 md:h-[600px] md:w-[600px]"
          style={{ backgroundColor: INK.red }}
        />
        <div aria-hidden="true" className="absolute left-0 top-[52%] h-40 w-3/4 md:top-24 md:h-64 md:w-1/3" style={halftone(INK.mustard)} />

        <div className="relative grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.3em]">
              Bournemouth · Cuban salsa · since {FACTS.since}
            </p>
            <h1 className={`mt-3 uppercase ${H1}`} style={display}>
              Salsa
              <br />
              Explo<span style={{ color: INK.blue }}>s</span>ion
            </h1>
            <p className="mt-5 max-w-md text-lg font-medium">
              Cuban casino, rueda and timba with {FACTS.founderShort}, every Thursday and Sunday at {VENUE_INFO.shortName}. Then
              practise every song at home.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/music" className={button} style={{ backgroundColor: INK.ink, color: INK.paper, borderColor: INK.ink }}>
                Practise the songs
              </Link>
              <Link href="#cartelera" className={button} style={{ borderColor: INK.ink }}>
                This week
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative rotate-[-3deg] border-[6px]" style={{ borderColor: INK.ink, boxShadow: `14px 14px 0 ${INK.teal}` }}>
              <HeroPicture
                desktop={PHOTOS.laVueltaHero}
                mobile={PHOTOS.laVueltaHeroMobile}
                className="aspect-[4/5] w-full object-cover object-[68%_center] md:aspect-[5/4]"
              />
            </div>
          </div>
        </div>

        <dl
          className="relative mt-12 grid grid-cols-2 gap-x-6 gap-y-3 border-t-4 px-1 pb-2 pt-4 text-xs uppercase tracking-wider md:grid-cols-4"
          style={{ borderColor: INK.ink, backgroundColor: INK.paper }}
        >
          {[
            ["Dirección", FACTS.founder],
            ["Desde", FACTS.origin],
            ["Lugar", VENUE_INFO.name],
            ["Funciones", SCHEDULE.map((day) => SPANISH_DAY[day.dayName]).join(" & ")],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="opacity-60">{term}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* SONG ANATOMY POSTER */}
      <section className="px-4 py-14 md:px-10 md:py-20" style={{ backgroundColor: INK.ink, color: INK.paper }}>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: INK.mustard }}>
              Practica en casa
            </p>
            <h2 className={`mt-3 uppercase ${H2}`} style={display}>
              La anatomía de una timba
            </h2>
            <p className="mt-6 max-w-sm">
              <strong>{FEATURED_SONG.title}</strong> by {FEATURED_SONG.artist}: {FEATURED_SONG.segments.length} sections at{" "}
              {FEATURED_SONG.bpm} BPM. The player shows what to dance now and what&apos;s next, timed to the music.{" "}
              {SONG_COUNT} songs mapped so far.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase">
              {legend.map((gear) => (
                <li key={gear} className="flex items-center gap-2 border-2 px-2 py-1" style={{ borderColor: INK.paper }}>
                  <span className="h-3 w-3 border" style={{ backgroundColor: GEARS[gear], borderColor: INK.paper }} aria-hidden="true" />
                  {gear}
                </li>
              ))}
            </ul>
            <Link
              href={`/music/${FEATURED_SONG.id}`}
              className={`${button} mt-8`}
              style={{ backgroundColor: INK.mustard, color: INK.ink, borderColor: INK.mustard }}
            >
              Open the player →
            </Link>
          </div>
          <div className="min-w-0 md:col-span-7">
            <SongStripes
              song={FEATURED_SONG}
              palette={GEARS}
              inkOn={(gear) => (DARK_TEXT_GEARS.has(gear) ? INK.ink : INK.paper)}
              className="h-[680px] border-4 text-sm font-bold uppercase md:h-[760px]"
            />
          </div>
        </div>
      </section>

      {/* MOVE LIBRARY TEASER: four mini posters */}
      <section className="px-4 py-14 md:px-10 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Próximamente · coming soon</p>
        <h2 className={`mt-3 uppercase ${H2}`} style={display}>
          La biblioteca de pasos
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOVE_FAMILIES.map((family, index) => (
            <li key={family.name} className="border-4" style={{ borderColor: INK.ink, backgroundColor: POSTER_COLORS[index] }}>
              <div className="relative m-3 aspect-[4/5] overflow-hidden border-4" style={{ borderColor: INK.ink }}>
                <Image src={family.photo.src} alt={family.photo.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
              </div>
              <div className="px-4 pb-5" style={{ color: index === 2 ? INK.ink : INK.paper }}>
                <p className={BIG} style={display}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className={`mt-1 uppercase ${H3}`} style={display}>
                  {family.spanish}
                </h3>
                <p className="mt-2 text-sm font-medium">
                  {family.name}: {family.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* WEEKLY SCHEDULE: the "cartelera" */}
      <section id="cartelera" className="px-4 py-14 md:px-10 md:py-20" style={{ backgroundColor: INK.mustard }}>
        <h2 className={`uppercase ${H2}`} style={display}>
          Cartelera semanal
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SCHEDULE.map((day) => (
            <article key={day.id} className="border-4 p-5 md:p-7" style={{ borderColor: INK.ink, backgroundColor: INK.paper }}>
              <p className={`uppercase ${H2}`} style={{ ...display, color: INK.red }}>
                {SPANISH_DAY[day.dayName]}
              </p>
              <p className="mt-2 font-bold uppercase tracking-wider">{day.headline}</p>
              <p className="text-sm">Doors {day.doorsTime}</p>
              <ul className="mt-5 border-t-4" style={{ borderColor: INK.ink }}>
                {day.classes.map((session) => (
                  <li key={session.id} className="flex gap-4 border-b-2 py-3" style={{ borderColor: INK.ink }}>
                    <span className={`w-20 shrink-0 tabular-nums ${H3}`} style={display}>
                      {session.time}
                    </span>
                    <span>
                      <span className="block font-bold">{session.title}</span>
                      <span className="text-sm">
                        {session.level} · {session.instructor}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {day.social && (
                <p className="mt-4 text-sm font-bold uppercase">
                  Then: {day.social.title} · {day.social.time}
                </p>
              )}
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t-4 pt-6 md:flex-row md:items-center md:gap-10" style={{ borderColor: INK.ink }}>
          <p className={BIG} style={display}>
            £{DOOR_PRICING.oneClassPounds} / £{DOOR_PRICING.twoClassesPounds}
          </p>
          <p className="max-w-xl font-semibold">
            {DOOR_PRICING.summaryBadge}. {DOOR_PRICING.paymentMethodNote}.
          </p>
        </div>
      </section>

      {/* REAL PHOTOS: venue + maestro */}
      <section className="grid md:grid-cols-2">
        <figure className="relative aspect-[4/3] border-b-4 md:border-b-0 md:border-r-4" style={{ borderColor: INK.ink }}>
          <Image
            src={REAL_PHOTOS.venueSocial.src}
            alt={REAL_PHOTOS.venueSocial.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-3 left-3 px-2 py-1 text-xs font-bold uppercase" style={{ backgroundColor: INK.paper }}>
            Real photo · {VENUE_INFO.name}
          </figcaption>
        </figure>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10" style={{ backgroundColor: INK.teal, color: INK.paper }}>
          <h2 className={`uppercase ${H2}`} style={display}>
            {VENUE_INFO.shortName}
          </h2>
          <p className="text-lg font-medium">{VENUE_INFO.fullAddress}</p>
          <p>
            {VENUE_INFO.floor}. {VENUE_INFO.parkingSummary}.
          </p>
          <a
            href={VENUE_INFO.googleMapsUrl}
            className={`${button} self-start`}
            style={{ backgroundColor: INK.paper, color: INK.ink, borderColor: INK.paper }}
          >
            Directions
          </a>
        </div>
      </section>

      <section className="grid items-center gap-8 px-4 py-14 md:grid-cols-12 md:px-10 md:py-20">
        <div className="relative mx-auto w-64 md:col-span-4 md:w-full">
          <div className="absolute -left-4 -top-4 h-full w-full" style={halftone(INK.red)} aria-hidden="true" />
          <Image
            src={REAL_PHOTOS.maestro.src}
            alt={REAL_PHOTOS.maestro.alt}
            width={REAL_PHOTOS.maestro.width}
            height={REAL_PHOTOS.maestro.height}
            sizes="(max-width: 768px) 16rem, 30vw"
            className="relative w-full border-[6px] object-cover"
            style={{ borderColor: INK.ink }}
          />
        </div>
        <div className="md:col-span-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">El maestro</p>
          <h2 className={`mt-3 uppercase ${H2}`} style={display}>
            {FACTS.founder}
          </h2>
          <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
            {[
              [FACTS.heritage, "of Cuban dance in the UK"],
              [FACTS.dancers, FACTS.dancersLabel.toLowerCase()],
              [FACTS.origin, FACTS.award],
            ].map(([value, label]) => (
              <div key={value} className="border-t-4 pt-3" style={{ borderColor: INK.ink }}>
                <dt className={`uppercase ${H3}`} style={display}>
                  {value}
                </dt>
                <dd className="mt-1 text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* EVENTS: ticket stubs */}
      {NEXT_EVENTS.length > 0 && (
        <section className="px-4 py-14 md:px-10 md:py-20" style={{ backgroundColor: INK.red, color: INK.paper }}>
          <h2 className={`uppercase ${H2}`} style={display}>
            Próximas funciones
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {NEXT_EVENTS.map((event) => (
              <li key={event.slug} className="flex border-4" style={{ borderColor: INK.ink, backgroundColor: INK.paper, color: INK.ink }}>
                <p
                  className="flex items-center border-r-4 border-dashed px-3 text-sm font-bold uppercase tracking-wider [writing-mode:vertical-rl]"
                  style={{ borderColor: INK.ink }}
                >
                  {event.dateBadge}
                </p>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">{event.categoryLabel}</p>
                  <h3 className={`uppercase ${H3}`} style={display}>
                    {event.title}
                  </h3>
                  <p className="text-sm font-semibold">{event.priceDisplay}</p>
                  <Link href={`/events/${event.slug}`} className="mt-auto inline-flex min-h-[40px] items-center font-bold uppercase underline underline-offset-4">
                    Tickets →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-col items-start gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-10" style={{ backgroundColor: INK.ink, color: INK.paper }}>
        <ClaveMark color={INK.mustard} className="h-6 w-48" />
        <p className="text-sm">
          {VENUE_INFO.phoneDisplay} · {VENUE_INFO.instagramHandle} · {VENUE_INFO.address}
        </p>
        <p className="text-xs uppercase tracking-wider opacity-60">Art-direction mock-up, not the live site</p>
      </footer>
    </main>
  );
}
