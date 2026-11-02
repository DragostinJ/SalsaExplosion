import type { RuedaCall } from "@/lib/rueda/rueda-calls-dictionary";

type Level = RuedaCall["level"];

/**
 * One poster ink per syllabus level, shared by the rueda dictionary and the flashcards:
 * the block colour, the text that reads on it, and the card's hard offset shadow.
 */
export const RUEDA_LEVEL_INK: Record<Level, { bg: string; text: string; shadow: string }> = {
  Beginner: { bg: "bg-poster-teal", text: "text-ink", shadow: "shadow-[10px_10px_0_var(--color-poster-teal)]" },
  Improver: { bg: "bg-poster-mustard", text: "text-ink", shadow: "shadow-[10px_10px_0_var(--color-poster-mustard)]" },
  Intermediate: { bg: "bg-poster-red", text: "text-ink", shadow: "shadow-[10px_10px_0_var(--color-poster-red)]" },
  Advanced: { bg: "bg-poster-blue", text: "text-paper", shadow: "shadow-[10px_10px_0_var(--color-poster-blue)]" },
};

export const RUEDA_LEVELS: readonly Level[] = ["Beginner", "Improver", "Intermediate", "Advanced"];
