import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { RuedaFlashcards } from "@/components/rueda/rueda-flashcards";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";

export const metadata = {
  title: "Rueda Call Flashcards | Salsa Explosion Bournemouth",
  description:
    "Practise the Rueda de Casino calls and hand signals taught at Salsa Explosion with quick flip cards: see the call, recall the signal and the timing.",
  alternates: { canonical: "/dashboard/rueda/tarjetas" },
};

export default function RuedaFlashcardsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-8 px-2.5 py-6 sm:px-6 lg:px-8">
      <CancionesTabs current="/dashboard/rueda/tarjetas" />
      <header className="px-1.5">
        <p className={KICKER}>Practica en casa · {RUEDA_CALLS.length} llamadas</p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          Tarjetas de rueda
          <span className="mt-3 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">
            Rueda call flashcards
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-lg font-medium">
          See the call, say the hand signal and the timing out loud, then turn the card. In the circle the caller won&apos;t
          wait for you, so practise until it&apos;s automatic.
        </p>
      </header>
      <RuedaFlashcards />
    </main>
  );
}
