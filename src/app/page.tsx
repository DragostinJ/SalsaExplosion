import Image from "next/image";
import Link from "next/link";
import { InstructorRosterSection } from "@/components/home/InstructorRosterSection";
import { LiveTonightBanner } from "@/components/home/LiveTonightBanner";
import { ClaveMark, HeroPicture, SongStripes } from "@/components/poster/poster-art";
import {
  GEAR_INKS,
  KICKER,
  POSTER_BLOCKS,
  POSTER_BUTTON,
  POSTER_BUTTON_COLORS,
  POSTER_INK,
  TYPE,
  gearTextInk,
  halftone,
} from "@/components/poster/poster-kit";
import { upcomingCanonicalEvents } from "@/lib/academy-data";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { classNightSongList, nextClassNightAny, spanishDate } from "@/lib/cartel";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import {
  DOOR_PRICING,
  FACTS,
  FEATURED_SONG,
  MOVE_FAMILIES,
  PHOTOS,
  REAL_PHOTOS,
  SCHEDULE,
  SONG_COUNT,
  SPANISH_DAY,
  VENUE_INFO,
  gearsIn,
} from "@/lib/site-content";

// Re-render hourly so finished events leave the "Próximas funciones" stubs without a redeploy
export const revalidate = 3600;

const GRAPHICS = MEDIA_MANIFEST.mockupGraphics;
const BANNERS = MEDIA_MANIFEST.editorial;

/** Screen-print illustrations (transparent cut-outs on the paper) */
const FRIEZE = [
  { art: GRAPHICS.trumpet, word: "Metales" },
  { art: GRAPHICS.couple, word: "La pareja" },
  { art: GRAPHICS.conga, word: "Tumbadora" },
  { art: GRAPHICS.palmMalecon, word: "Malecón" },
  { art: GRAPHICS.guiro, word: "Güiro" },
  { art: GRAPHICS.rueda, word: "La rueda" },
  { art: GRAPHICS.timbales, word: "Timbales" },
  { art: GRAPHICS.car, word: "Almendrón" },
] as const;

/** Caption inks that read on the paper (mustard doesn't) */
const FRIEZE_INKS = ["text-poster-red", "text-poster-teal", "text-ink", "text-poster-blue"];

export default async function Home() {
  const events = upcomingCanonicalEvents().slice(0, 3);
  const legend = gearsIn(FEATURED_SONG);
  // The songs the teachers picked for the next class night: a reason to practise before coming
  const classNight = nextClassNightAny();
  const classSongs = await classNightSongList(classNight);

  return (
    <div className="flex min-h-screen flex-col text-ink">
      <main id="main-content" tabIndex={-1} className="flex-1">
        <LiveTonightBanner />

        {/* HERO: film-poster composition */}
        <section className="relative overflow-hidden px-4 pb-10 pt-8 md:px-10 md:pb-14 md:pt-12">
          <div
            aria-hidden="true"
            className="absolute -right-28 top-16 h-[380px] w-[380px] rounded-full bg-poster-red md:right-[8%] md:top-10 md:h-[600px] md:w-[600px]"
          />
          <div aria-hidden="true" className="absolute left-0 top-[52%] h-40 w-3/4 md:top-24 md:h-64 md:w-1/3" style={halftone(POSTER_INK.mustard)} />

          <div className="relative mx-auto grid max-w-7xl gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className={KICKER}>
                Bournemouth · Cuban salsa · since {FACTS.since}
              </p>
              <h1 className={`mt-3 ${TYPE.hero}`}>
                Salsa
                <br />
                Explo<span className="text-poster-blue">s</span>ion
                <span className="mt-4 block font-sans text-lg font-bold normal-case leading-snug tracking-normal md:text-2xl">
                  Cuban salsa &amp; rueda de casino classes in Bournemouth
                </span>
              </h1>
              <p className="mt-4 max-w-md text-lg font-medium">
                With {FACTS.founderShort}, every Thursday and Sunday at {VENUE_INFO.shortName}. £{DOOR_PRICING.oneClassPounds}{" "}
                for one class, £{DOOR_PRICING.twoClassesPounds} for two, paid at the door. Then practise every song at home.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
                  Thu &amp; Sun classes
                </Link>
                <Link href="/music" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper`}>
                  Practise the songs
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative rotate-[-3deg] border-[6px] border-ink shadow-[14px_14px_0_var(--color-poster-teal)]">
                <HeroPicture
                  desktop={PHOTOS.laVueltaHero}
                  mobile={PHOTOS.laVueltaHeroMobile}
                  className="aspect-[4/5] w-full object-cover object-[68%_center] md:aspect-[5/4]"
                />
              </div>
            </div>
          </div>

          <dl className="relative mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-x-6 gap-y-3 border-t-4 border-ink bg-paper px-1 pb-2 pt-4 text-xs uppercase tracking-wider md:grid-cols-4">
            {[
              ["Dirección", FACTS.founder],
              ["Desde", FACTS.origin],
              ["Lugar", VENUE_INFO.name],
              ["Funciones", SCHEDULE.map((day) => SPANISH_DAY[day.dayName]).join(" & ")],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="opacity-70">{term}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ILLUSTRATION FRIEZE: one swipeable row on phones (decoration shouldn't cost four screens), a grid from md up */}
        <section
          aria-label="Illustrations"
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto border-y-4 border-ink md:grid md:grid-cols-4 md:overflow-visible"
        >
          {FRIEZE.map((item, index) => (
            <figure
              key={item.word}
              className="flex w-[42%] shrink-0 snap-start flex-col items-center border-ink px-4 pb-4 max-md:border-r-4 max-md:last:border-r-0 md:w-auto md:[&:not(:nth-child(4n))]:border-r-4 md:[&:nth-child(-n+4)]:border-b-4"
            >
              <Image
                src={item.art.src}
                alt={item.art.alt}
                width={item.art.width}
                height={item.art.height}
                sizes={item.art.sizes}
                className="w-full max-w-[220px]"
              />
              <figcaption className={`font-display ${TYPE.card} ${FRIEZE_INKS[index % FRIEZE_INKS.length]}`}>{item.word}</figcaption>
            </figure>
          ))}
        </section>

        {/* THIS WEEK'S CLASS SONGS: only when a teacher attached songs to the next class night */}
        {classSongs.length > 0 && (
          <section aria-labelledby="class-songs-heading" className="theme-ink bg-canvas px-4 py-10 text-ivory md:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={KICKER}>Esta semana en clase · {spanishDate(classNight)}</p>
                <h2 id="class-songs-heading" className={`mt-3 ${TYPE.section}`}>
                  Practica las canciones
                </h2>
                <p className="mt-2 max-w-xl font-medium">
                  The teachers will dance to these on the night. Learn what happens in each section before you come.
                </p>
              </div>
              <ul className="flex flex-wrap gap-3">
                {classSongs.map((song) => (
                  <li key={song.id}>
                    <Link href={`/music/${song.id}`} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.mustard}`}>
                      {song.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* WEEKLY SCHEDULE: the "cartelera" */}
        <section id="cartelera" className="bg-poster-mustard px-4 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={KICKER}>Pay at the door · no partner needed</p>
                <h2 className={`mt-3 ${TYPE.section}`}>Cartelera semanal</h2>
              </div>
              <Image
                src={GRAPHICS.clock.src}
                alt=""
                width={GRAPHICS.clock.width}
                height={GRAPHICS.clock.height}
                sizes="(max-width: 768px) 7rem, 11rem"
                className="w-28 shrink-0 -rotate-6 md:w-44"
              />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {SCHEDULE.map((day) => (
                <article key={day.id} className="border-4 border-ink bg-paper p-5 md:p-7">
                  <h3 className={`font-display text-poster-red ${TYPE.section}`}>{SPANISH_DAY[day.dayName]}</h3>
                  <p className="mt-2 font-bold uppercase tracking-wider">{day.headline}</p>
                  <p className="text-sm">Doors {day.doorsTime}</p>
                  <ul className="mt-5 border-t-4 border-ink">
                    {day.classes.map((session) => (
                      <li key={session.id} className="flex gap-4 border-b-2 border-ink py-3">
                        <span className={`w-20 shrink-0 font-display tabular-nums ${TYPE.card}`}>{session.time}</span>
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
            <div className="mt-10 flex flex-col gap-4 border-t-4 border-ink pt-6 md:flex-row md:items-center md:gap-10">
              <p className={`flex items-center gap-3 font-display ${TYPE.number}`}>
                <Image src={GRAPHICS.ticket.src} alt="" width={GRAPHICS.ticket.width} height={GRAPHICS.ticket.height} sizes="6rem" className="w-24" />
                £{DOOR_PRICING.oneClassPounds} / £{DOOR_PRICING.twoClassesPounds}
              </p>
              <p className="max-w-xl font-semibold">
                {DOOR_PRICING.summaryBadge}. {DOOR_PRICING.paymentMethodNote}.
              </p>
              <Link href="/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} md:ml-auto`}>
                Full timetable
              </Link>
            </div>
            <figure className="mt-10 border-4 border-ink">
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <Image src={PHOTOS.socialNight.src} alt={PHOTOS.socialNight.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <figcaption className={`border-t-4 border-ink bg-poster-red px-4 py-2 font-display text-ink ${TYPE.card}`}>
                Y después: la fiesta
              </figcaption>
            </figure>
          </div>
        </section>

        {/* SONG ANATOMY: the practice player, on ink */}
        <section className="cv-auto theme-ink bg-ink px-4 py-14 text-paper md:px-10 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12">
            <div className="min-w-0 md:col-span-5">
              <p className={`${KICKER} text-poster-mustard`}>Practica en casa</p>
              <h2 className={`mt-3 ${TYPE.section}`}>La anatomía de una timba</h2>
              <p className="mt-6 max-w-sm">
                <strong>{FEATURED_SONG.title}</strong> by {FEATURED_SONG.artist}: {FEATURED_SONG.segments.length} sections at{" "}
                {FEATURED_SONG.bpm} BPM. The player shows what to dance now and what&apos;s next, timed to the music.{" "}
                {SONG_COUNT} songs mapped so far.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase">
                {legend.map((gear) => (
                  <li key={gear} className="flex items-center gap-2 border-2 border-paper px-2 py-1">
                    <span className="h-3 w-3 border border-paper" style={{ backgroundColor: GEAR_INKS[gear] }} aria-hidden="true" />
                    {gear}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/music/${FEATURED_SONG.id}`} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.mustard}`}>
                  Open the player →
                </Link>
                <Link href="/music" className={`${POSTER_BUTTON} border-paper text-paper`}>
                  All {SONG_COUNT} songs
                </Link>
              </div>
              <figure className="mt-10 max-w-sm border-4 border-paper">
                <Image
                  src={PHOTOS.practiceHome.src}
                  alt={PHOTOS.practiceHome.alt}
                  width={PHOTOS.practiceHome.width}
                  height={PHOTOS.practiceHome.height}
                  sizes="(max-width: 768px) 100vw, 24rem"
                  className="w-full object-cover"
                />
                <figcaption className={`bg-paper px-3 py-2 font-display text-poster-red ${TYPE.card}`}>La clase sigue en casa</figcaption>
              </figure>
            </div>
            <div className="min-w-0 md:col-span-7">
              <SongStripes
                song={FEATURED_SONG}
                palette={GEAR_INKS}
                inkOn={gearTextInk}
                className="h-[680px] border-4 border-paper text-sm font-bold uppercase md:h-[760px]"
              />
            </div>
          </div>
        </section>

        {/* EVENTS: ticket stubs */}
        {events.length > 0 && (
          <section className="cv-auto bg-poster-red px-4 py-14 text-ink md:px-10 md:py-20">
            <div className="mx-auto max-w-7xl">
              <p className={KICKER}>Festivals &amp; parties · book online</p>
              <h2 className={`mt-3 ${TYPE.section}`}>Próximas funciones</h2>
              <figure className="mt-8 border-4 border-ink bg-paper">
                <Image
                  src={BANNERS.bannerBigBand.src}
                  alt={BANNERS.bannerBigBand.alt}
                  width={BANNERS.bannerBigBand.width}
                  height={BANNERS.bannerBigBand.height}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="aspect-[21/9] w-full object-cover"
                />
              </figure>
              <ul className="mt-8 grid gap-5 md:grid-cols-3">
                {events.map((event, index) => (
                  <li key={event.slug} className="flex border-4 border-ink bg-paper">
                    <p className="flex items-center border-r-4 border-dashed border-ink px-3 text-sm font-bold uppercase tracking-wider [writing-mode:vertical-rl]">
                      {event.dateBadge}
                    </p>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {index === 0 ? "Next up · " : ""}
                        {event.categoryLabel}
                      </p>
                      <h3 className={`font-display ${TYPE.card}`}>{event.title}</h3>
                      <p className="text-sm font-semibold">{event.priceDisplay}</p>
                      <Link
                        href={`/events/${event.slug}`}
                        className="mt-auto inline-flex min-h-[40px] items-center font-bold uppercase underline underline-offset-4"
                      >
                        Tickets →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/events" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} mt-8`}>
                All festivals &amp; passes
              </Link>
            </div>
          </section>
        )}

        {/* EL MAESTRO (real photo) */}
        <section className="cv-auto px-4 py-14 md:px-10 md:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-12">
            <div className="relative mx-auto w-64 md:col-span-4 md:w-full">
              <div className="absolute -left-4 -top-4 h-full w-full" style={halftone(POSTER_INK.red)} aria-hidden="true" />
              <Image
                src={REAL_PHOTOS.maestro.src}
                alt={REAL_PHOTOS.maestro.alt}
                width={REAL_PHOTOS.maestro.width}
                height={REAL_PHOTOS.maestro.height}
                sizes="(max-width: 768px) 16rem, 30vw"
                className="relative w-full border-[6px] border-ink object-cover"
              />
            </div>
            <div className="md:col-span-8">
              <p className={KICKER}>El maestro</p>
              <h2 className={`mt-3 ${TYPE.section}`}>{FACTS.founder}</h2>
              <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                {[
                  [FACTS.heritage, "of Cuban dance in the UK"],
                  [FACTS.dancers, FACTS.dancersLabel.toLowerCase()],
                  [FACTS.origin, FACTS.award],
                ].map(([value, label]) => (
                  <div key={value} className="border-t-4 border-ink pt-3">
                    <dt className={`font-display ${TYPE.card}`}>{value}</dt>
                    <dd className="mt-1 text-sm">{label}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/about" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} mt-8`}>
                Our story
              </Link>
            </div>
          </div>
        </section>

        {/* The teaching team */}
        <InstructorRosterSection id="instructors" />

        {/* THE VENUE (real photo); the full arrival guide lives on /venues */}
        <section data-testid="home-venue" className="cv-auto grid border-y-4 border-ink md:grid-cols-2">
          <figure className="relative aspect-[4/3] border-b-4 border-ink md:border-b-0 md:border-r-4">
            <Image
              src={REAL_PHOTOS.venueSocial.src}
              alt={REAL_PHOTOS.venueSocial.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 bg-paper px-2 py-1 text-xs font-bold uppercase">{VENUE_INFO.name}</figcaption>
          </figure>
          <div className="flex flex-col justify-center gap-4 bg-poster-teal p-6 text-ink md:p-10">
            <Image src={GRAPHICS.pier.src} alt="" width={GRAPHICS.pier.width} height={GRAPHICS.pier.height} sizes="10rem" className="w-32 md:w-40" />
            <h2 className={TYPE.section}>{VENUE_INFO.shortName}</h2>
            <p className="text-lg font-medium">{VENUE_INFO.fullAddress}</p>
            <p>
              {VENUE_INFO.floor}. {VENUE_INFO.parkingSummary}.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={VENUE_INFO.googleMapsUrl} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
                Directions
              </a>
              <Link href="/venues" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
                Parking guide
              </Link>
            </div>
          </div>
        </section>

        {/* MOVE LIBRARY: six mini posters, one per family */}
        <section className="cv-auto px-4 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className={KICKER}>Practica en casa · {getPublishedMoves().length} pasos</p>
            <h2 className={`mt-3 ${TYPE.section}`}>La biblioteca de pasos</h2>
            <Link href="/moves" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} mt-6`}>
              Open the move library →
            </Link>
            {/* Two columns on phones, so six families don't take three screens */}
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {MOVE_FAMILIES.map((family, index) => {
                const block = POSTER_BLOCKS[index % POSTER_BLOCKS.length];
                return (
                  <li key={family.name} className={`border-4 border-ink ${block.bg}`}>
                    <div className="relative m-2 aspect-[4/5] overflow-hidden border-4 border-ink sm:m-3">
                      <Image src={family.photo.src} alt={family.photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                    </div>
                    <div className={`px-3 pb-4 sm:px-4 sm:pb-5 ${block.text}`}>
                      <p className={`font-display ${TYPE.number}`}>{String(index + 1).padStart(2, "0")}</p>
                      <h3 className={`mt-1 font-display ${TYPE.card}`}>{family.spanish}</h3>
                      <p className="mt-2 hidden text-sm font-medium sm:block">
                        {family.name}: {family.note}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Gift vouchers */}
        <div className="flex flex-col items-center gap-3 border-t-4 border-ink bg-poster-mustard px-4 py-6 text-center text-ink md:flex-row md:justify-center md:gap-6">
          <Image src={GRAPHICS.gift.src} alt="" width={GRAPHICS.gift.width} height={GRAPHICS.gift.height} sizes="5rem" className="w-20" />
          <p className="text-sm font-semibold">
            Looking for a Cuban dance gift?{" "}
            <Link href="/pricing#vouchers" className="inline-flex min-h-[40px] items-center font-bold underline underline-offset-4">
              Salsa Explosion gift vouchers →
            </Link>
          </p>
          <ClaveMark color={POSTER_INK.ink} className="h-5 w-40" />
        </div>
      </main>
    </div>
  );
}
