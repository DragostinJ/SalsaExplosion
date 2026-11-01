"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Volume2,
  Hand,
  Repeat,
  Filter,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RUEDA_CALLS } from "@/lib/rueda/rueda-calls-dictionary";

export function RuedaDictionaryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
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

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search Rueda calls"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by call name (e.g. Enchufla, Setenta, Dame, Sombrero)..."
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              aria-label="Filter by syllabus level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Syllabus Levels</option>
              <option value="Beginner">Level 1: Beginner</option>
              <option value="Improver">Level 2: Improver</option>
              <option value="Intermediate">Level 3: Intermediate</option>
              <option value="Advanced">Level 4: Advanced</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Buttons & Partner Switch Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
            {["ALL", "Beginner", "Improver", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
                  levelFilter === lvl
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {lvl === "ALL" ? "All Levels" : lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPartnerSwitchOnly((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap ${
              partnerSwitchOnly
                ? "bg-gold text-stone-950 font-bold shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Partner Changes Only</span>
          </button>
        </div>
      </div>

      {/* Rueda Calls Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCalls.length === 0 ? (
          <div className="col-span-2 text-center py-12 rounded-2xl border bg-muted/20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-bold text-base">No Rueda Calls Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or syllabus level filter.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("ALL");
                setPartnerSwitchOnly(false);
              }}
              className="mt-4 text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <Card
              key={call.name}
              className="rounded-2xl border bg-card shadow-xs hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                      {call.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Volume2 className="h-3 w-3" />
                      &ldquo;{call.phonetic}&rdquo;
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={`text-xs font-bold ${
                        call.level === "Beginner"
                          ? "bg-info-soft text-info border border-info-line"
                          : call.level === "Improver"
                          ? "bg-success-soft text-success border border-success-line"
                          : call.level === "Intermediate"
                          ? "bg-gold/15 text-gold border border-gold/30"
                          : "bg-role-follow-soft text-role-follow border border-role-follow-line"
                      }`}
                    >
                      {call.level}
                    </Badge>

                    {call.switchesPartner ? (
                      <span className="text-xs font-semibold text-gold flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        Switches Partner
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        Same Partner
                      </span>
                    )}
                  </div>
                </div>

                {/* Handhold & Entry/Exit Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge variant="outline" className="text-xs font-semibold border-amber-500/30 bg-amber-500/5 text-amber-300">
                    <Hand className="mr-1 h-2.5 w-2.5" />
                    {call.handholdType}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-semibold border-blue-500/30 bg-blue-500/5 text-blue-300">
                    <Compass className="mr-1 h-2.5 w-2.5" />
                    {call.entryExitGeometry}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {call.description}
                </p>

                {/* Hand Signal Callout for noisy clubs */}
                <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Hand className="h-3.5 w-3.5 text-amber-600" />
                    Cantante Visual Hand Signal:
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {call.handSignal}
                  </p>
                </div>

                {/* Clave Timing & Maestro Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="rounded-lg bg-background border p-2.5 space-y-0.5">
                    <span className="font-bold text-foreground block">Clave Cadence:</span>
                    <span className="text-muted-foreground">{call.claveTiming}</span>
                  </div>
                  <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/20 p-2.5 space-y-0.5">
                    <span className="font-bold text-amber-300 block">Maestro Tip:</span>
                    <span className="text-muted-foreground">{call.cantanteTip}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
