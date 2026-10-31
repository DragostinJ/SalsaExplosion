/**
 * Rueda de casino calls a caller can shout in a section. The AI Studio song
 * maker may only use these (or "none"), so the "Rueda call" line in the player
 * never shows adjectives like "relaxed" or "dynamic".
 */
export const RUEDA_CALLS = [
  "Guapea",
  "Dile Que No",
  "Enchufla",
  "Enchufla Doble",
  "Dame",
  "Dame Dos",
  "Exhíbela",
  "Prima",
  "Setenta",
  "Setenta Complicado",
  "Vacílala",
  "Sombrero",
  "Kentucky",
  "Paséala",
  "Montana",
  "Dedo",
  "El Uno",
  "El Dos",
  "Siete",
  "Siete Loco",
  "Coca-Cola",
  "Bayamo",
  "Abanico",
  "Candado",
  "Tarro",
  "Rodeo",
  "Al Medio",
  "Pa'Fuera",
] as const;

export const NO_RUEDA_CALL = "none";

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Keeps a handGesture only when it starts with a real call (e.g. "Dedo" or
 * "Dedo (Index finger up)"); "none", "", adjectives and unknown words become undefined.
 */
export function normalizeRuedaCall(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const folded = fold(value);
  // Longest names first so "Enchufla Doble" isn't matched as "Enchufla"
  const match = [...RUEDA_CALLS]
    .sort((a, b) => b.length - a.length)
    .some((call) => {
      const name = fold(call);
      return folded === name || folded.startsWith(`${name} `) || folded.startsWith(`${name}(`);
    });
  return match ? value.trim() : undefined;
}
