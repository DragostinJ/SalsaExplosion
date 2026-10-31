"use client";

import { ChevronDown } from "lucide-react";
import { resolveCurriculumMove, type SongSegment } from "@/lib/constants/timba-song-anatomy";
import type { CurriculumSkillItem } from "@/lib/constants/cuban-curriculum-2027";

/** Opened details can land below the card's visible area; bring them into view. */
function revealWhenOpened(event: React.SyntheticEvent<HTMLDetailsElement>) {
  const details = event.currentTarget;
  if (details.open) {
    details.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

interface SectionMovesListProps {
  segment: SongSegment;
}

/**
 * "What can I dance here?" options for the current section. Each move is a
 * native <details> disclosure; sharing a `name` makes them an exclusive
 * accordion, so only one move is open at a time and the card stays readable.
 */
export function SectionMovesList({ segment }: SectionMovesListProps) {
  const moves = segment.recommendedMoveSlugs
    .map((slug) => resolveCurriculumMove(slug))
    .filter((move): move is CurriculumSkillItem => Boolean(move));

  if (moves.length === 0) return null;

  return (
    <div className="mt-3">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-ivory-muted">
        Moves to try · {moves.length}
      </h3>
      <ul className="mt-1.5 space-y-1.5">
        {moves.map((move) => (
          <li key={move.id}>
            <details
              name={`moves-${segment.id}`}
              onToggle={revealWhenOpened}
              className="group rounded-xl border border-line bg-canvas/40"
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-3 focus-visible:outline-2 focus-visible:outline-gold rounded-xl [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{move.name}</span>
                <span className="shrink-0 text-[11px] text-ivory-muted">{move.level}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-ivory-muted transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="space-y-1.5 px-3 pb-3 text-xs leading-snug">
                {(move.aliases?.length || move.phonetic) && (
                  <p className="text-ivory-muted">
                    {move.aliases?.join(" · ")}
                    {move.aliases?.length && move.phonetic ? " · " : ""}
                    {move.phonetic && <span className="italic">{move.phonetic}</span>}
                  </p>
                )}
                <p>{move.summary}</p>
                {move.handholdType && (
                  <p>
                    <span className="font-bold text-ivory-muted">Hold: </span>
                    {move.handholdType}
                  </p>
                )}
                {move.claveSync && (
                  <p>
                    <span className="font-bold text-ivory-muted">Timing: </span>
                    {move.claveSync}
                  </p>
                )}
                <p className="border-l-2 border-gold pl-2">
                  <span className="font-bold text-gold">Tip: </span>
                  {move.unConfuserTip}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
