import Image from "next/image";
import Link from "next/link";
import { ClaveMark, HeroPicture, MockupSwitcher, SongScore } from "@/components/mockups/mockup-art";
import { GEARS, H1, H2, H3, WALL, WallLabel, instrument, serif, textLink } from "@/components/mockups/gallery-theme";
import {
  DOOR_PRICING,
  FACTS,
  NEXT_EVENTS,
  PHOTOS,
  REAL_PHOTOS,
  SCHEDULE,
  SCORE_SONGS,
  SONG_COUNT,
  VENUE_INFO,
  songDurationLabel,
} from "@/components/mockups/mockup-data";

export const metadata = { title: "Mock-up · Gallery" };

const EXHIBITS = [
  { photo: PHOTOS.rumbaSolar, title: "Guaguancó", medium: "Rumba · the vacunao", span: "md:col-span-7" },
  { photo: PHOTOS.despelote, title: "Despelote", medium: "Body movement · timba", span: "md:col-span-5 md:mt-24" },
  { photo: PHOTOS.feetHavanaTiles, title: "Pasitos", medium: "Shines · solo footwork", span: "md:col-span-4" },
  { photo: PHOTOS.ruedaOverhead, title: "La rueda", medium: "Six couples, one caller", span: "md:col-span-4 md:mt-16" },
  { photo: PHOTOS.congaHands, title: "Tumbadora", medium: "Musicality · the conga", span: "md:col-span-4" },
  { photo: PHOTOS.sonCouple, title: "Son", medium: "Close hold · contratiempo", span: "md:col-span-5" },
  { photo: PHOTOS.casinoCouple, title: "Casino", medium: "Partnerwork · the turn", span: "md:col-span-7 md:mt-20" },
  { photo: PHOTOS.timbalero, title: "Timbalero", medium: "Musicality · the timbales", span: "md:col-span-6" },
  { photo: PHOTOS.dancerKit, title: "El equipo", medium: "Still life · shoes, claves, towel", span: "md:col-span-6 md:mt-24" },
] as const;

export default function GalleryMockupPage() {
  return (
    <main
      className={`${instrument.variable} min-h-screen`}
      style={{ backgroundColor: WALL.obsidian, color: WALL.ivory, fontFamily: "var(--font-geist-sans)" }}
    >
      <MockupSwitcher current="gallery" />

      {/* HERO: title wall + one hung work */}
      <section className="px-4 pb-16 pt-10 md:px-12 md:pb-24 md:pt-16">
        <p className="flex flex-wrap gap-x-6 gap-y-1 text-xs uppercase tracking-[0.3em]" style={{ color: WALL.ash }}>
          <span>Salsa Explosion</span>
          <span>Cuban dance since {FACTS.since}</span>
          <span>{VENUE_INFO.city}</span>
        </p>
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:items-end">
          <h1 className={`md:col-span-7 ${H1}`} style={serif}>
            Salsa
            <br />
            <em style={{ color: WALL.crimson }}>Explosion</em>
          </h1>
          <div className="md:col-span-5">
            <div className="border p-3" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
              <HeroPicture
                desktop={PHOTOS.laVueltaHero}
                mobile={PHOTOS.laVueltaHeroMobile}
                className="aspect-[4/5] w-full object-cover object-[68%_center] md:aspect-[4/3]"
              />
            </div>
            <WallLabel number={1} title="La vuelta" medium="Casino, a study in crimson" note="Editorial image" />
          </div>
        </div>
        <div className="mt-14 grid gap-8 border-t pt-8 md:grid-cols-12" style={{ borderColor: WALL.line }}>
          <p className={`md:col-span-7 ${H3}`} style={serif}>
            Cuban casino, rueda and timba with {FACTS.founder}, every Thursday and Sunday at {VENUE_INFO.name}. Between
            classes, every song waits for you at home.
          </p>
          <div className="flex flex-wrap items-start gap-6 md:col-span-5 md:justify-end">
            <Link href="/music" className={textLink} style={{ borderColor: WALL.crimson }}>
              Practise the songs →
            </Link>
            <Link href="#hours" className={textLink} style={{ borderColor: WALL.line }}>
              Opening hours
            </Link>
          </div>
        </div>
      </section>

      {/* THE COLLECTION: studies for the move library */}
      <section className="px-4 py-16 md:px-12 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className={H2} style={serif}>
            The collection
          </h2>
          <p className="max-w-xs text-sm" style={{ color: WALL.ash }}>
            Studies for the move library: shines, rumba, body movement and the rueda. Opening soon.
          </p>
        </div>
        <ul className="mt-12 grid gap-10 md:grid-cols-12">
          {EXHIBITS.map((exhibit, index) => (
            <li key={exhibit.title} className={exhibit.span}>
              <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
                <Image
                  src={exhibit.photo.src}
                  alt={exhibit.photo.alt}
                  width={exhibit.photo.width}
                  height={exhibit.photo.height}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full object-cover"
                />
              </div>
              <WallLabel number={index + 2} title={exhibit.title} medium={exhibit.medium} />
            </li>
          ))}
        </ul>
      </section>

      {/* SCORES: songs as thin section maps */}
      <section className="border-y px-4 py-16 md:px-12 md:py-24" style={{ borderColor: WALL.line }}>
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className={H2} style={serif}>
              Every song, <em style={{ color: WALL.amber }}>scored</em>
            </h2>
            <p className="mt-4 max-w-xl text-sm" style={{ color: WALL.ash }}>
              {SONG_COUNT} songs mapped section by section. In the player each bar lights up as the music reaches it: what
              to dance now, what comes next.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
              <Image
                src={PHOTOS.countingHands.src}
                alt={PHOTOS.countingHands.alt}
                width={PHOTOS.countingHands.width}
                height={PHOTOS.countingHands.height}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="w-full object-cover"
              />
            </div>
            <WallLabel number={EXHIBITS.length + 2} title="Cinco, seis, siete, ocho" medium="Counting in, before the music" note="Editorial image" />
          </div>
        </div>
        <ul className="mt-12 space-y-10">
          {SCORE_SONGS.map((song) => (
            <li key={song.id}>
              <Link href={`/music/${song.id}`} className="group block">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`${H3} group-hover:italic`} style={serif}>
                    {song.title}
                  </span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
                    {song.artist} · {song.segments.length} sections · {song.bpm} BPM · {songDurationLabel(song)}
                  </span>
                </div>
                <SongScore song={song} palette={GEARS} className="mt-3 h-4" gap={3} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* OPENING HOURS */}
      <section id="hours" className="grid gap-12 px-4 py-16 md:grid-cols-12 md:px-12 md:py-24">
        <div className="md:col-span-7">
          <h2 className={H2} style={serif}>
            Opening hours
          </h2>
          <dl className="mt-10 divide-y border-y" style={{ borderColor: WALL.line }}>
            {SCHEDULE.map((day) => (
              <div key={day.id} className="grid gap-4 py-6 md:grid-cols-[10rem_1fr]" style={{ borderColor: WALL.line }}>
                <dt>
                  <span className={`block ${H3}`} style={serif}>
                    {day.dayPlural}
                  </span>
                  <span className="text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
                    Doors {day.doorsTime}
                  </span>
                </dt>
                <dd className="space-y-3">
                  {day.classes.map((session) => (
                    <p key={session.id} className="grid grid-cols-[3.5rem_1fr] gap-3 text-sm">
                      <span className="tabular-nums" style={{ color: WALL.amber }}>
                        {session.time}
                      </span>
                      <span>
                        {session.title}
                        <span className="block text-xs" style={{ color: WALL.ash }}>
                          {session.level} · {session.instructor}
                        </span>
                      </span>
                    </p>
                  ))}
                  {day.social && (
                    <p className="grid grid-cols-[3.5rem_1fr] gap-3 text-sm italic">
                      <span />
                      <span>
                        {day.social.title}, {day.social.time}
                      </span>
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8">
            <span className={H3} style={serif}>
              Admission £{DOOR_PRICING.oneClassPounds} · £{DOOR_PRICING.twoClassesPounds}
            </span>
            <span className="mt-1 block text-sm" style={{ color: WALL.ash }}>
              {DOOR_PRICING.summaryBadge}. {DOOR_PRICING.paymentMethodNote}.
            </span>
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
            <Image
              src={REAL_PHOTOS.venueSocial.src}
              alt={REAL_PHOTOS.venueSocial.alt}
              width={REAL_PHOTOS.venueSocial.width}
              height={REAL_PHOTOS.venueSocial.height}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="w-full object-cover"
            />
          </div>
          <WallLabel number={EXHIBITS.length + 3} title={VENUE_INFO.shortName} medium={VENUE_INFO.fullAddress} note="Real photograph" />
          <a href={VENUE_INFO.googleMapsUrl} className={`${textLink} mt-4`} style={{ borderColor: WALL.crimson }}>
            Directions →
          </a>
        </div>
      </section>

      {/* THE MAESTRO (real portrait) */}
      <section className="grid items-end gap-10 border-t px-4 py-16 md:grid-cols-12 md:px-12 md:py-24" style={{ borderColor: WALL.line }}>
        <div className="md:col-span-4">
          <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
            <Image
              src={REAL_PHOTOS.maestro.src}
              alt={REAL_PHOTOS.maestro.alt}
              width={REAL_PHOTOS.maestro.width}
              height={REAL_PHOTOS.maestro.height}
              sizes="(max-width: 768px) 100vw, 30vw"
              className="w-full object-cover"
            />
          </div>
          <WallLabel number={EXHIBITS.length + 4} title={FACTS.founderShort} medium={`Born in ${FACTS.origin}`} note="Real photograph" />
        </div>
        <div className="md:col-span-8">
          <h2 className={H2} style={serif}>
            {FACTS.founder}
          </h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              [FACTS.heritage, "of Cuban dance in the UK"],
              [FACTS.dancers, FACTS.dancersLabel.toLowerCase()],
              ["Award", FACTS.award],
            ].map(([value, label]) => (
              <div key={value} className="border-t pt-4" style={{ borderColor: WALL.crimson }}>
                <dt className={H3} style={serif}>
                  {value}
                </dt>
                <dd className="mt-1 text-sm" style={{ color: WALL.ash }}>
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* UPCOMING EXHIBITIONS = events */}
      {NEXT_EVENTS.length > 0 && (
        <section className="border-t px-4 py-16 md:px-12 md:py-24" style={{ borderColor: WALL.line }}>
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-8">
              <h2 className={H2} style={serif}>
                Upcoming
              </h2>
              <ul className="mt-10 divide-y border-y" style={{ borderColor: WALL.line }}>
                {NEXT_EVENTS.map((event) => (
                  <li key={event.slug} style={{ borderColor: WALL.line }}>
                    <Link href={`/events/${event.slug}`} className="group grid gap-2 py-6 md:grid-cols-[14rem_1fr_auto] md:items-baseline md:gap-8">
                      <span className="text-xs uppercase tracking-widest" style={{ color: WALL.amber }}>
                        {event.dateBadge}
                      </span>
                      <span className={`${H3} group-hover:italic`} style={serif}>
                        {event.title}
                      </span>
                      <span className="text-sm" style={{ color: WALL.ash }}>
                        {event.priceDisplay} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-4">
              <div className="border p-2" style={{ borderColor: WALL.line, backgroundColor: WALL.frame }}>
                <Image
                  src={PHOTOS.brassSection.src}
                  alt={PHOTOS.brassSection.alt}
                  width={PHOTOS.brassSection.width}
                  height={PHOTOS.brassSection.height}
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="w-full object-cover"
                />
              </div>
              <WallLabel number={EXHIBITS.length + 5} title="La orquesta" medium="Live timba, the brass section" note="Editorial image" />
            </div>
          </div>
        </section>
      )}

      <footer className="flex flex-col gap-5 border-t px-4 py-12 md:flex-row md:items-center md:justify-between md:px-12" style={{ borderColor: WALL.line }}>
        <ClaveMark color={WALL.crimson} tickColor={WALL.ash} className="h-5 w-40" />
        <p className="text-sm" style={{ color: WALL.ash }}>
          {VENUE_INFO.phoneDisplay} · {VENUE_INFO.instagramHandle} · {VENUE_INFO.address}
        </p>
        <p className="text-xs uppercase tracking-widest" style={{ color: WALL.ash }}>
          Art-direction mock-up, not the live site
        </p>
      </footer>
    </main>
  );
}
