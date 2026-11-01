"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";
import { RUEDA_CALLS, type RuedaCall } from "@/lib/rueda/rueda-calls-dictionary";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";
import { cn } from "@/lib/utils";

type Level = RuedaCall["level"];
type Side = "name" | "signal";

const LEVELS: readonly Level[] = ["Beginner", "Improver", "Intermediate", "Advanced"];
/** One poster ink per level, for the card's offset shadow and chip */
const LEVEL_INK: Record<Level, string> = {
  Beginner: "bg-poster-teal",
  Improver: "bg-poster-mustard",
  Intermediate: "bg-poster-red",
  Advanced: "bg-poster-blue",
};
const LEVEL_SHADOW: Record<Level, string> = {
  Beginner: "shadow-[10px_10px_0_var(--color-poster-teal)]",
  Improver: "shadow-[10px_10px_0_var(--color-poster-mustard)]",
  Intermediate: "shadow-[10px_10px_0_var(--color-poster-red)]",
  Advanced: "shadow-[10px_10px_0_var(--color-poster-blue)]",
};
const STORAGE_KEY = "ritmoflow-rueda-known";
/** A card marked "again" comes back after this many other cards */
const AGAIN_GAP = 3;

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function deckFor(levels: ReadonlySet<Level>): RuedaCall[] {
  return RUEDA_CALLS.filter((call) => levels.has(call.level));
}

const KNOWN_CHANGED = "ritmoflow-rueda-known-changed";

/** The calls you already know are kept on this phone (localStorage), read as an external store */
function subscribeKnown(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(KNOWN_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(KNOWN_CHANGED, onChange);
  };
}

function readKnownRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseKnown(raw: string): Set<string> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveKnown(known: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
    window.dispatchEvent(new Event(KNOWN_CHANGED));
  } catch {
    // Private mode or blocked storage: the round still works, it just isn't remembered
  }
}

/** Rueda calls as flip cards: see the call and recall its hand signal and timing, or the reverse. */
export function RuedaFlashcards() {
  const [levels, setLevels] = useState<ReadonlySet<Level>>(new Set<Level>(["Beginner", "Improver"]));
  const [front, setFront] = useState<Side>("name");
  // The first round follows the syllabus order (same on server and phone); later rounds shuffle
  const [queue, setQueue] = useState<RuedaCall[]>(() => deckFor(levels));
  const [flipped, setFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const knownRaw = useSyncExternalStore(subscribeKnown, readKnownRaw, () => "");
  const known = useMemo(() => parseKnown(knownRaw), [knownRaw]);

  const deck = useMemo(() => deckFor(levels), [levels]);

  function newRound(nextDeck: RuedaCall[]) {
    setQueue(shuffled(nextDeck));
    setGotIt(0);
    setFlipped(false);
  }

  const card = queue[0];
  const roundSize = deck.length;

  function answer(remembered: boolean) {
    if (!card) return;
    setFlipped(false);
    if (remembered) {
      setGotIt((n) => n + 1);
      saveKnown(new Set(known).add(card.name));
      setQueue((q) => q.slice(1));
    } else {
      setQueue((q) => {
        const rest = q.slice(1);
        return [...rest.slice(0, AGAIN_GAP), q[0], ...rest.slice(AGAIN_GAP)];
      });
    }
  }

  function toggleLevel(level: Level) {
    const next = new Set(levels);
    if (next.has(level) && next.size > 1) next.delete(level);
    else next.add(level);
    setLevels(next);
    newRound(deckFor(next));
  }

  const knownInDeck = deck.filter((call) => known.has(call.name)).length;

  return (
    <section aria-labelledby="flashcards-heading" className="space-y-6">
      <h2 id="flashcards-heading" className="sr-only">
        Rueda call flashcards
      </h2>

      {/* Deck settings */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Levels in the deck">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={levels.has(level)}
              onClick={() => toggleLevel(level)}
              className={cn(
                "inline-flex min-h-[40px] items-center gap-2 border-2 border-ink px-3 text-xs font-bold uppercase tracking-wider",
                levels.has(level) ? "bg-ink text-paper" : "bg-paper text-ink"
              )}
            >
              <span className={cn("h-3 w-3 border border-ink", LEVEL_INK[level])} aria-hidden="true" />
              {level}
            </button>
          ))}
        </div>
        <div className="flex border-2 border-ink text-xs font-bold uppercase" role="group" aria-label="Card front">
          {(["name", "signal"] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-pressed={front === side}
              onClick={() => {
                setFront(side);
                setFlipped(false);
              }}
              className={cn("min-h-[40px] flex-1 px-3", front === side ? "bg-ink text-paper" : "bg-paper text-ink")}
            >
              {side === "name" ? "Show the call" : "Show the signal"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold" aria-live="polite">
        {gotIt} of {roundSize} this round · {knownInDeck} of {roundSize} known overall
      </p>

      {card ? (
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show the front of the card" : "Turn the card over"}
            className={cn(
              "block min-h-[320px] w-full border-[6px] border-ink bg-paper p-6 text-left transition-transform active:translate-x-1 active:translate-y-1",
              LEVEL_SHADOW[card.level]
            )}
          >
            <span className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.3em]">
              <span>{flipped ? "Respuesta" : front === "name" ? "La llamada" : "La señal"}</span>
              <span className={cn("border-2 border-ink px-2 py-0.5 tracking-wider text-ink", LEVEL_INK[card.level])}>{card.level}</span>
            </span>

            {!flipped && front === "name" && (
              <span className="mt-8 block">
                <span className="block font-display text-6xl leading-[0.9]">{card.name}</span>
                <span className="mt-3 block text-lg font-semibold">{card.phonetic}</span>
                <span className="mt-8 block text-sm">What&apos;s the hand signal, and when does it happen? Tap to check.</span>
              </span>
            )}
            {!flipped && front === "signal" && (
              <span className="mt-8 block">
                <span className="block text-2xl font-bold leading-snug">{card.handSignal}</span>
                <span className="mt-8 block text-sm">Which call is this? Tap to check.</span>
              </span>
            )}
            {flipped && (
              <span className="mt-6 block space-y-3">
                <span className="block font-display text-5xl leading-none">{card.name}</span>
                <span className="block text-sm">
                  <strong>Signal:</strong> {card.handSignal}
                </span>
                <span className="block text-sm">
                  <strong>Timing:</strong> {card.claveTiming}
                </span>
                <span className="block text-sm">{card.description}</span>
                <span className="block text-sm font-bold uppercase">
                  {card.switchesPartner ? "Changes partner" : "Same partner"}
                </span>
              </span>
            )}
          </button>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => answer(false)} className={cn(POSTER_BUTTON, POSTER_BUTTON_COLORS.outline, "bg-paper")}>
              Again
            </button>
            <button type="button" onClick={() => answer(true)} className={cn(POSTER_BUTTON, POSTER_BUTTON_COLORS.ink)}>
              Got it
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl border-[6px] border-ink bg-poster-mustard p-6 text-ink">
          <p className="font-display text-5xl leading-none">¡Bien hecho!</p>
          <p className="mt-3 font-semibold">You went through all {roundSize} calls. Shuffle and go again, or add a level.</p>
          <button
            type="button"
            onClick={() => newRound(deck)}
            className={cn(POSTER_BUTTON, POSTER_BUTTON_COLORS.ink, "mt-6 gap-2")}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Shuffle again
          </button>
        </div>
      )}
    </section>
  );
}
