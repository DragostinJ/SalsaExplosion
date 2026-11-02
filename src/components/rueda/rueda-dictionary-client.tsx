"use client";

import { useState, useMemo } from "react";
import { Search, Volume2, Repeat } from "lucide-react";
import { RUEDA_LEVELS, RUEDA_LEVEL_INK } from "@/components/rueda/rueda-level-ink";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";
import { cn } from "@/lib/utils";

const FILTERS = ["ALL", ...RUEDA_LEVELS] as const;

/** The rueda call dictionary: search and level filters over poster cards, one per call. */
export function RuedaDictionaryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [partnerSwitchOnly, setPartnerSwitchOnly] = useState(false);

  const filteredCalls = useMemo(() => {
    return RUEDA_CALLS.filter((call) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        call.name.toLowerCase().includes(q) ||
        call.phonetic.toLowerCase().includes(q) ||
        call.description.toLowerCase().includes(q) ||
        call.handholdType.toLowerCase().includes(q) ||
        call.entryExitGeometry.toLowerCase().includes(q) ||
        call.handSignal.toLowerCase().includes(q);

      const matchesLevel = levelFilter === "ALL" || call.level === levelFilter;
      const matchesSwitch = !partnerSwitchOnly || call.switchesPartner;

      return matchesSearch && matchesLevel && matchesSwitch;
    });
  }, [searchQuery, levelFilter, partnerSwitchOnly]);

  const resetFilters = () => {
    setSearchQuery("");
    setLevelFilter("ALL");
    setPartnerSwitchOnly(false);
  };

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <div className="space-y-3 border-4 border-ink bg-paper p-4 sm:p-5">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search Rueda calls"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search a call (Enchufla, Setenta, Dame, Sombrero…)"
            className="min-h-[44px] w-full border-2 border-ink bg-paper py-2 pl-9 pr-4 text-sm placeholder:text-ivory-muted"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0" role="group" aria-label="Level">
            {FILTERS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                aria-pressed={levelFilter === lvl}
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap border-2 border-ink px-3 text-xs font-bold uppercase tracking-wider",
                  levelFilter === lvl ? "bg-ink text-paper" : "bg-paper text-ink"
                )}
              >
                {lvl !== "ALL" && <span className={cn("h-3 w-3 border border-ink", RUEDA_LEVEL_INK[lvl].bg)} aria-hidden="true" />}
                {lvl === "ALL" ? "All levels" : lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-pressed={partnerSwitchOnly}
            onClick={() => setPartnerSwitchOnly((prev) => !prev)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border-2 border-ink px-3 text-xs font-bold uppercase tracking-wider",
              partnerSwitchOnly ? "bg-poster-red text-ink" : "bg-paper text-ink"
            )}
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
            Partner changes only
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold" aria-live="polite">
        {filteredCalls.length} of {RUEDA_CALLS.length} calls
      </p>

      {/* One poster card per call */}
      {filteredCalls.length === 0 ? (
        <div className="border-4 border-ink bg-poster-mustard p-6 text-ink">
          <h3 className="font-display text-3xl leading-none">Ninguna llamada</h3>
          <p className="mt-2 font-medium">No call matches. Try another name or clear the filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[44px] items-center border-4 border-ink bg-ink px-4 font-bold uppercase tracking-wider text-paper"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {filteredCalls.map((call) => {
            const ink = RUEDA_LEVEL_INK[call.level];
            return (
              <li key={call.name}>
                <article className="flex h-full flex-col border-4 border-ink bg-paper">
                  <p
                    className={cn(
                      "flex items-center justify-between gap-2 border-b-4 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider",
                      ink.bg,
                      ink.text
                    )}
                  >
                    <span>{call.level}</span>
                    <span className="flex items-center gap-1">
                      {call.switchesPartner && <Repeat className="h-3.5 w-3.5" aria-hidden="true" />}
                      {call.switchesPartner ? "Changes partner" : "Same partner"}
                    </span>
                  </p>

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3 className="font-display text-4xl leading-none">{call.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                        &ldquo;{call.phonetic}&rdquo;
                      </p>
                    </div>

                    <ul className="flex flex-wrap gap-2 text-xs font-bold" aria-label="Hold and path">
                      <li className="border-2 border-ink px-2 py-0.5">{call.handholdType}</li>
                      <li className="border-2 border-ink px-2 py-0.5">{call.entryExitGeometry}</li>
                    </ul>

                    <p className="text-sm">{call.description}</p>

                    <div className="border-l-4 border-poster-red pl-3">
                      <p className="text-xs font-bold uppercase tracking-wider">La señal · hand signal</p>
                      <p className="mt-1 text-sm">{call.handSignal}</p>
                    </div>

                    <dl className="mt-auto grid gap-3 border-t-2 border-ink pt-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider">Clave</dt>
                        <dd className="mt-1">{call.claveTiming}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider">Consejo del cantante</dt>
                        <dd className="mt-1">{call.cantanteTip}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
