import Image from "next/image";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { KICKER, TYPE } from "@/components/poster/poster-kit";
import { RuedaFlashcards } from "@/components/rueda/rueda-flashcards";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";

const CALLER = MEDIA_MANIFEST.mockupGraphics.caller;

export const metadata = {
  title: "Rueda Call Flashcards",
  description:
    "Practise the Rueda de Casino calls and hand signals taught at Salsa Explosion with quick flip cards: see the call, recall the signal and the timing.",
  alternates: { canonical: "/rueda/tarjetas" },
};

export default function RuedaFlashcardsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl space-y-8 px-2.5 py-6 sm:px-6 lg:px-8">
      <CancionesTabs current="/rueda/tarjetas" />
      <header className="grid items-end gap-4 px-1.5 md:grid-cols-12">
        <div className="md:col-span-8">
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
        </div>
        <Image
          src={CALLER.src}
          alt=""
          width={CALLER.width}
          height={CALLER.height}
          sizes="(max-width: 768px) 8rem, 14rem"
          className="mx-auto w-32 md:col-span-4 md:w-56"
        />
      </header>
      <RuedaFlashcards />
    </main>
  );
}
