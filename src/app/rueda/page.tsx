import { PageHeader } from "@/components/layout/page-header";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import Link from "next/link";
import { RuedaDictionaryClient } from "@/components/rueda/rueda-dictionary-client";
import { RUEDA_LEVEL_INK } from "@/components/rueda/rueda-level-ink";
import { KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, TYPE } from "@/components/poster/poster-kit";
import { callOfTheDay } from "@/lib/rueda/call-of-the-day";
import { cn } from "@/lib/utils";

// The call of the day changes at midnight: re-render the page hourly
export const revalidate = 3600;

export const metadata = {
  title: "Rueda de Casino Calls Dictionary",
  description:
    "Every rueda de casino call taught at Salsa Explosion: what it means, the hand signal, the timing and whether you change partner.",
  alternates: { canonical: "/rueda" },
};

export default function RuedaDictionaryPage() {
  const call = callOfTheDay();
  const ink = RUEDA_LEVEL_INK[call.level];
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <CancionesTabs current="/rueda" />
      <PageHeader
        art={MEDIA_MANIFEST.mockupGraphics.caller}
        title="Rueda de Casino"
        titleHighlight="Call Dictionary"
        description="Master the figures called in the Rueda circle at BOH Studios and Bournemouth Havana Fiesta socials. Learn Spanish pronunciations, hand signals for loud dance floors, and exact clave timing."
        badge="Cuban Syllabus"
        eyebrow="CANTANTE COMMAND HANDBOOK • 16+ AUTHENTIC CALLS • BOH STUDIOS"
      />

      {/* La llamada del día: one call a day to learn, a small reason to come back */}
      <section
        aria-labelledby="call-of-the-day"
        className={cn("flex flex-col gap-4 border-4 border-ink p-5 sm:flex-row sm:items-center sm:justify-between", ink.bg, ink.text, ink.shadow)}
      >
        <div className="min-w-0">
          <p className={KICKER}>La llamada del día · {call.level}</p>
          <h2 id="call-of-the-day" className={`mt-2 font-display ${TYPE.card}`}>
            {call.name} <span className="font-sans text-base font-bold normal-case tracking-normal">&ldquo;{call.phonetic}&rdquo;</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium">{call.description}</p>
          <p className="mt-2 max-w-2xl text-sm">
            <span className="font-bold">La señal:</span> {call.handSignal}
          </p>
        </div>
        <Link href="/rueda/tarjetas" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} shrink-0 self-start sm:self-center`}>
          Practise with flashcards →
        </Link>
      </section>

      {/* Dictionary Client Component */}
      <RuedaDictionaryClient />
    </main>
  );
}
