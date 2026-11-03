import Image from "next/image";
import Link from "next/link";
import { KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, TYPE } from "@/components/poster/poster-kit";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { CartelDaySchema, cartelSchedule, nextClassNight, spanishDate, type CartelDay } from "@/lib/cartel";

export const metadata = {
  title: "Carteles: class-night posters",
  description: "Ready-to-post Instagram posters for the Thursday and Sunday class nights at BOH Studios, and the wall poster for the studio.",
  robots: { index: false },
};

// The date on each poster moves on every day
export const revalidate = 3600;

/** Enrique's poster desk: tonight's class posters for Instagram, plus the printable wall poster. */
export default function CartelPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className={KICKER}>Para Instagram · for Instagram</p>
          <h1 className={`mt-3 ${TYPE.section}`}>
            Carteles de la noche
            <span className="mt-3 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">
              Class-night posters, made from the timetable
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium">
            Each poster shows the next class night&apos;s date, classes, teachers and the door price. Download it on your phone and
            post it as a story or in the feed. If the timetable changes, the posters change with it.
          </p>
        </div>
        <Image
          src={MEDIA_MANIFEST.mockupGraphics.calendar.src}
          alt=""
          width={MEDIA_MANIFEST.mockupGraphics.calendar.width}
          height={MEDIA_MANIFEST.mockupGraphics.calendar.height}
          sizes="(max-width: 768px) 5rem, 10rem"
          className="w-20 shrink-0 sm:w-28 md:w-40"
        />
      </header>

      <ul className="grid gap-10 md:grid-cols-2">
        {CartelDaySchema.options.map((day) => (
          <CartelCard key={day} day={day} />
        ))}
      </ul>

      <section className="flex flex-col gap-4 border-4 border-ink bg-poster-teal p-6 text-ink md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className={TYPE.card}>Cartel de pared</h2>
          <p className="mt-2 max-w-xl font-medium">
            An A3 poster for the studio wall with a QR code that opens the song list, so dancers can practise the class songs at
            home.
          </p>
        </div>
        <Link href="/cartel/pared" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} shrink-0`}>
          Open the wall poster
        </Link>
      </section>
    </main>
  );
}

function CartelCard({ day }: { day: CartelDay }) {
  const schedule = cartelSchedule(day);
  const when = spanishDate(nextClassNight(schedule.dayOfWeekNumber));
  return (
    <li className="space-y-4">
      <h2 className={TYPE.card}>{when}</h2>
      {/* The story PNG itself (drawn by /cartel/[dia]); a plain img keeps its exact pixels */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/cartel/${day}?formato=story`}
        alt={`Instagram story poster for ${schedule.dayName}'s classes`}
        width={1080}
        height={1920}
        loading="lazy"
        className="w-full max-w-sm border-4 border-ink"
      />
      <div className="flex flex-wrap gap-3">
        <a href={`/cartel/${day}?formato=story`} download={`salsa-explosion-${day}-story.png`} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
          Story
        </a>
        <a href={`/cartel/${day}?formato=post`} download={`salsa-explosion-${day}-post.png`} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
          Feed post
        </a>
      </div>
    </li>
  );
}
