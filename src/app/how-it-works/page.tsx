import Link from "next/link";
import { Flame, Users, QrCode, ArrowRight } from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { CubanCurriculumSkillTree } from "@/components/progression/cuban-curriculum-skill-tree";
import { CubanDanceGearsMatrix } from "@/components/progression/cuban-dance-gears-matrix";
import { SongPracticeList } from "@/components/music/song-player/song-practice-list";
import { TYPE, KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, POSTER_BLOCKS } from "@/components/poster/poster-kit";
import { DOOR_PRICING, VENUE_INFO, WEEKLY_SCHEDULE } from "@/lib/academy-data";
import { PosterBanner } from "@/components/poster/poster-art";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export const metadata = {
  title: "How It Works: Classes, Songs, Festivals",
  description:
    "Come on Thursday or Sunday, pay £12 at the door and dance with everyone. No partner or booking needed. Practise the songs at home.",
  alternates: { canonical: "/how-it-works" },
};

/** The four doors of the app, in the order a new dancer meets them. */
const STEPS = [
  {
    word: "Ven a clase",
    english: "Come to class",
    text: `Thursdays (doors ${WEEKLY_SCHEDULE.thursday.doorsTime}) and Sundays (doors ${WEEKLY_SCHEDULE.sunday.doorsTime}) at ${VENUE_INFO.shortName}. £${DOOR_PRICING.oneClassPounds} for one class, £${DOOR_PRICING.twoClassesPounds} for two, the social included, cash or card at the door. No partner and no booking needed: everyone dances, even when the class is uneven, because the teachers rotate partners.`,
    href: "/classes",
    cta: "Clases",
  },
  {
    word: "Practica en casa",
    english: "Practise at home",
    text: "Every song from the classes, mapped section by section: the player shows what to dance now and what comes next. Learn the rueda calls with flashcards, and the moves as the teachers add them to the library.",
    href: "/music",
    cta: "Canciones",
  },
  {
    word: "Fiestas",
    english: "Festivals & parties",
    text: "Weekenders and special nights are booked online, paid securely with Stripe. You choose Lead or Follow so the teachers know who is coming; it never stops anyone from booking.",
    href: "/events",
    cta: "Fiestas",
  },
  {
    word: "Mi carnet",
    english: "Your pass",
    text: "Sign in to keep your festival passes with their door QR code, tell the teachers \"I'm coming\" to a class if you like, and collect a stub for every class you dance.",
    href: "/dashboard/carnet",
    cta: "Mi carnet",
  },
] as const;

const FAQS = [
  {
    q: "Do I need a partner?",
    a: "No. Cuban salsa is danced in rotation: in casino and in the rueda you change partners all the time, so you dance with everyone.",
  },
  {
    q: "What if the class has more leads than follows?",
    a: "Everyone still comes in and everyone dances. The teachers rotate the couples, and dancing the other role for a while is part of learning.",
  },
  {
    q: "Do I have to book a class?",
    a: `No. Just come and pay at the door (£${DOOR_PRICING.oneClassPounds} / £${DOOR_PRICING.twoClassesPounds}). If you sign in you can tap "I'm coming" so the teachers know, but it's never required and it doesn't cost anything.`,
  },
  {
    q: "It's my first time. What should I do?",
    a: "Arrive 15 minutes early, say hello at the desk, and join the beginners class. Wear comfortable shoes that turn on a wooden floor, and stay for the social afterwards.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <BackButton fallbackUrl="/classes" label="Back to Schedule" />
      </div>

      {/* Hero */}
      <section data-testid="page-header" className="border-4 border-ink bg-paper p-6 text-ink shadow-[8px_8px_0_0_var(--color-ink)] sm:p-10">
        <p className={KICKER}>Cómo funciona · how it works</p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          Simple, <span className="text-accent-red">como debe ser</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium">
          Come on Thursday or Sunday, pay at the door and dance with everyone. Practise the class songs at home. Book the
          festivals online.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} gap-1.5`}>
            Thu &amp; Sun classes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/music" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper`}>
            Practise the songs
          </Link>
        </div>
      </section>

      <PosterBanner image={MEDIA_MANIFEST.editorial.bannerTeacher} caption="Uno, dos, tres" />

      {/* The four doors */}
      <section aria-labelledby="steps-heading" className="space-y-6">
        <h2 id="steps-heading" className={TYPE.section}>
          Cuatro puertas
        </h2>
        <ol className="grid gap-6 md:grid-cols-2">
          {STEPS.map((step, index) => {
            const block = POSTER_BLOCKS[index % POSTER_BLOCKS.length];
            return (
              <li key={step.word} className="flex flex-col border-4 border-ink bg-paper">
                <p className={`flex items-center justify-between border-b-4 border-ink px-5 py-2 ${block.bg} ${block.text}`}>
                  <span className="font-display text-4xl leading-none">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{step.english}</span>
                </p>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className={`font-display ${TYPE.card}`}>{step.word}</h3>
                  <p className="text-sm font-medium leading-relaxed">{step.text}</p>
                  <Link href={step.href} className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} mt-auto self-start`}>
                    {step.cta} →
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Syllabus and musicality */}
      <section className="space-y-8" aria-label="Cuban Salsa Syllabus and Musicality Roadmap">
        <div>
          <p className={KICKER}>El programa · the syllabus</p>
          <h2 className={`mt-3 ${TYPE.section}`}>De principiante a timbero</h2>
          <p className="mt-3 max-w-2xl text-sm font-medium">
            Four levels, from your first basic step to timba. Browse the figures of each level and how the music changes
            gear through a song.
          </p>
        </div>

        <CubanCurriculumSkillTree defaultLevel="Beginner" />

        <CubanDanceGearsMatrix initiallyCollapsed={true} practiceList={<SongPracticeList />} />
      </section>

      {/* Staff & Faculty Operations Guide */}
      <section
        data-testid="staff-operations-guide"
        aria-label="Teacher and Door Staff Operations Guide"
        className="space-y-6 border-4 border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)] sm:p-10"
      >
        <div className="flex flex-col justify-between gap-3 border-b-4 border-ink pb-4 sm:flex-row sm:items-center">
          <div>
            <p className={KICKER}>For Enrique and the teachers</p>
            <h2 className={`mt-2 font-display ${TYPE.card}`}>How Teachers &amp; Door Staff Run Class Check-In</h2>
            <p className="mt-1 text-sm font-medium">
              Check-in records who danced (each dancer collects a stub in Mi carnet). Payment still happens at the door.
            </p>
          </div>
          <Link href="/instructor/roster" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} shrink-0`}>
            Open the roster
          </Link>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="space-y-2 border-2 border-ink p-4">
            <p className="flex items-center gap-2 font-bold">
              <QrCode className="h-4 w-4" aria-hidden="true" />
              1. Self-Serve Door QR
            </p>
            <p className="font-medium leading-relaxed">
              Open the class on the roster and tap &ldquo;Door QR&rdquo;. Dancers scan the code on arrival.
            </p>
          </div>
          <div className="space-y-2 border-2 border-ink p-4">
            <p className="flex items-center gap-2 font-bold">
              <Flame className="h-4 w-4" aria-hidden="true" />
              2. Live Camera Scanner
            </p>
            <p className="font-medium leading-relaxed">
              Scan a dancer&apos;s festival pass (<code className="font-mono">RF-PASS-…</code>) from Mi carnet with your
              phone camera.
            </p>
          </div>
          <div className="space-y-2 border-2 border-ink p-4">
            <p className="flex items-center gap-2 font-bold">
              <Users className="h-4 w-4" aria-hidden="true" />
              3. Tick by name
            </p>
            <p className="font-medium leading-relaxed">
              No phone? Tick the dancer&apos;s name on the roster, or print the A4 register before class.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="space-y-6">
        <h2 id="faq-heading" className={TYPE.section}>
          Preguntas
        </h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-t-4 border-ink pt-3">
              <dt className="font-bold uppercase tracking-wide">{faq.q}</dt>
              <dd className="mt-2 text-sm font-medium leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final call to action */}
      <section className="space-y-4 border-4 border-ink bg-poster-mustard p-8 text-center text-ink shadow-[8px_8px_0_0_var(--color-ink)] sm:p-10">
        <h2 className={TYPE.section}>Nos vemos en la pista</h2>
        <p className="mx-auto max-w-xl font-semibold">See you on the dance floor, Thursday or Sunday at {VENUE_INFO.shortName}.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
            Timetable
          </Link>
          <Link href="/venues" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline}`}>
            How to get there
          </Link>
        </div>
      </section>
    </main>
  );
}
