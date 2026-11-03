import Link from "next/link";
import type { Move, MoveCategory } from "@/lib/moves/move-schema";
import { cn } from "@/lib/utils";

/** What a poster card and the library search need: a fraction of a whole move, so /moves stays light. */
export type MoveCardData = Pick<Move, "id" | "name" | "spanishName" | "category" | "level" | "summary" | "eightCounts" | "variations">;

export function toMoveCardData({ id, name, spanishName, category, level, summary, eightCounts, variations }: Move): MoveCardData {
  return { id, name, spanishName, category, level, summary, eightCounts, variations };
}

/** One poster ink per move family (with the text colour that reads on it) */
export const CATEGORY_INK: Record<MoveCategory, { bg: string; text: string; cell: string }> = {
  "Casino figure": { bg: "bg-poster-teal", text: "text-ink", cell: "bg-ink text-paper" },
  "Rueda call": { bg: "bg-poster-mustard", text: "text-ink", cell: "bg-ink text-paper" },
  "Shine / suelta": { bg: "bg-poster-pink", text: "text-ink", cell: "bg-ink text-paper" },
  "Body movement": { bg: "bg-ink", text: "text-paper", cell: "bg-paper text-ink" },
  Rumba: { bg: "bg-poster-red", text: "text-ink", cell: "bg-ink text-paper" },
  Son: { bg: "bg-poster-blue", text: "text-paper", cell: "bg-paper text-ink" },
  Reparto: { bg: "bg-ink", text: "text-paper", cell: "bg-paper text-ink" },
  "Afro-Cuban Orishas": { bg: "bg-poster-plum", text: "text-paper", cell: "bg-paper text-ink" },
};

/**
 * The move's length as 8-count bars, every count numbered: filled squares are the steps (1-2-3, 5-6-7),
 * hollow ones the Cuban pauses on 4 and 8.
 * The numbers are the dance count, not timing advice: the teacher verified the bar count.
 */
export function CountStrip({ eightCounts, cell, className }: { eightCounts: number; cell: string; className?: string }) {
  return (
    <div role="img" aria-label={`${eightCounts} eight-count${eightCounts === 1 ? "" : "s"}`} className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: eightCounts }, (_, bar) => (
        <div key={bar} className="flex gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
            <span
              key={count}
              className={cn(
                "flex h-6 w-5 items-center justify-center text-xs font-bold",
                count % 4 === 0 ? "border-2 border-current opacity-60" : cell
              )}
            >
              {count}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A move as a mini ICAIC poster, for the dancer library and the teacher's review preview. */
export function MovePosterCard({ move, number, href }: { move: MoveCardData; number?: number; href?: string }) {
  const ink = CATEGORY_INK[move.category];
  const title = move.spanishName ?? move.name;
  const body = (
    <>
      <p className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span>{move.category}</span>
        <span className="border-2 border-current px-2 py-0.5">{move.level}</span>
      </p>
      {number !== undefined && <p className="mt-4 font-display text-5xl leading-none">{String(number).padStart(2, "0")}</p>}
      <h3 className="mt-2 font-display text-3xl leading-none">{title}</h3>
      {move.spanishName && move.spanishName !== move.name && <p className="mt-1 text-sm font-semibold">{move.name}</p>}
      <p className="mt-3 line-clamp-3 text-sm font-medium">{move.summary}</p>
      <CountStrip eightCounts={move.eightCounts} cell={ink.cell} className="mt-4" />
    </>
  );
  const frame = cn("block h-full border-4 border-ink p-5", ink.bg, ink.text);
  return href ? (
    <Link href={href} className={cn(frame, "transition-transform hover:-translate-y-1")}>
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  );
}
