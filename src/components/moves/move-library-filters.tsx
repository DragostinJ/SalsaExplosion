"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORY_INK, MovePosterCard } from "@/components/moves/move-poster-card";
import { RUEDA_LEVELS, RUEDA_LEVEL_INK } from "@/components/rueda/rueda-level-ink";
import { TYPE } from "@/components/poster/poster-kit";
import { MOVE_CATEGORIES, type Move, type MoveCategory } from "@/lib/moves/move-schema";
import type { CurriculumLevel } from "@/lib/constants/cuban-curriculum-2027";
import { cn } from "@/lib/utils";

type LevelFilter = "ALL" | CurriculumLevel;
type FamilyFilter = "ALL" | MoveCategory;

const PILL =
  "inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap border-2 border-ink px-3 text-xs font-bold uppercase tracking-wider";

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** The move library with search, level and family filters over the poster cards. */
export function MoveLibraryFilters({ moves }: { moves: readonly Move[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("ALL");
  const [family, setFamily] = useState<FamilyFilter>("ALL");

  const familiesPresent = useMemo(
    () => MOVE_CATEGORIES.filter((category) => moves.some((move) => move.category === category)),
    [moves]
  );

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return moves.filter((move) => {
      const matchesQuery =
        !q ||
        fold(move.name).includes(q) ||
        fold(move.spanishName ?? "").includes(q) ||
        fold(move.summary).includes(q) ||
        move.variations.some((v) => fold(v).includes(q));
      return (
        matchesQuery && (level === "ALL" || move.level === level) && (family === "ALL" || move.category === family)
      );
    });
  }, [moves, query, level, family]);

  const sections = familiesPresent
    .map((category) => ({ category, moves: filtered.filter((move) => move.category === category) }))
    .filter((section) => section.moves.length > 0);

  const reset = () => {
    setQuery("");
    setLevel("ALL");
    setFamily("ALL");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3 border-4 border-ink bg-paper p-4 sm:p-5">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search moves"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a move (Setenta, Dame, Sombrero, Vacílala…)"
            className="min-h-[44px] w-full border-2 border-ink bg-paper py-2 pl-9 pr-4 text-sm placeholder:text-ivory-muted"
          />
        </label>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0" role="group" aria-label="Level">
          {(["ALL", ...RUEDA_LEVELS] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={level === option}
              onClick={() => setLevel(option)}
              className={cn(PILL, level === option ? "bg-ink text-paper" : "bg-paper text-ink")}
            >
              {option !== "ALL" && <span className={cn("h-3 w-3 border border-ink", RUEDA_LEVEL_INK[option].bg)} aria-hidden="true" />}
              {option === "ALL" ? "All levels" : option}
            </button>
          ))}
        </div>

        {familiesPresent.length > 1 && (
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0" role="group" aria-label="Family">
            {(["ALL", ...familiesPresent] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={family === option}
                onClick={() => setFamily(option)}
                className={cn(PILL, family === option ? "bg-ink text-paper" : "bg-paper text-ink")}
              >
                {option !== "ALL" && <span className={cn("h-3 w-3 border border-ink", CATEGORY_INK[option].bg)} aria-hidden="true" />}
                {option === "ALL" ? "All families" : option}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm font-semibold" aria-live="polite">
        {filtered.length} of {moves.length} moves
      </p>

      {sections.length === 0 ? (
        <div className="border-4 border-ink bg-poster-mustard p-6 text-ink">
          <h2 className={TYPE.card}>Ningún paso</h2>
          <p className="mt-2 font-medium">No move matches. Try another name or clear the filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex min-h-[44px] items-center border-4 border-ink bg-ink px-4 font-bold uppercase tracking-wider text-paper"
          >
            Clear filters
          </button>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.category} aria-labelledby={`family-${section.category}`} className="space-y-4">
            <h2 id={`family-${section.category}`} className={TYPE.section}>
              {section.category}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.moves.map((move, index) => (
                <li key={move.id}>
                  <MovePosterCard move={move} number={index + 1} href={`/moves/${move.id}`} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
