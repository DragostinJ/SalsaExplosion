"use client";

import { useState, useMemo } from "react";
import {
  Music,
  Headphones,
  ExternalLink,
  Flame,
  Volume2,
  Search,
  Radio,
  Sparkles,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CURRICULUM_REFERENCE_SONGS,
  CurriculumReferenceSong,
  CurriculumLevel,
} from "@/lib/constants/cuban-curriculum-2027";
import { TimbaSongAnatomyPlayer } from "@/components/music/timba-song-anatomy-player";

export function CubanMusicHubClient() {
  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevel | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredSongId, setFeaturedSongId] = useState<string>("me-dicen-cuba");

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CURRICULUM_REFERENCE_SONGS.filter((track: CurriculumReferenceSong) => {
      const matchesLevel = selectedLevel === "ALL" || track.level === selectedLevel;
      const matchesSearch =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.subGenre.toLowerCase().includes(q) ||
        track.whyThisSong.toLowerCase().includes(q) ||
        track.gearShiftsObserved.some((g) => g.toLowerCase().includes(q)) ||
        track.instrumentsToListenFor.some((inst) => inst.toLowerCase().includes(q));

      return matchesLevel && matchesSearch;
    });
  }, [selectedLevel, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Interactive Timba Song Anatomy Trainer (Featured at Top of /music) */}
      <div id="timba-song-anatomy-section">
        <TimbaSongAnatomyPlayer key={featuredSongId} initialSongId={featuredSongId} />
      </div>

      {/* Musicality Guide from Maestro Enrique */}
      <div className="rounded-3xl border border-border/80 bg-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary-base text-white font-bold text-xs">
            Maestro Enrique&apos;s Musicality Masterclass
          </Badge>
          <span className="text-xs text-muted-foreground font-semibold">
            How to Find Beat 1 Every Single Time
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-foreground">
          Never Lose the Clave on the Social Floor
        </h2>

        <div className="grid gap-4 md:grid-cols-3 pt-2 text-xs text-muted-foreground leading-relaxed">
          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-primary-base" />
              1. Listen for the Piano Montuno
            </span>
            <p>
              The piano keyboard sets the groove. In Cuban salsa, the pianist plays a cyclical arpeggio (montuno) that always accents the preparation on count 8 and resolves firmly on beat 1.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-rose-600" />
              2. Feel the Conga Slap
            </span>
            <p>
              The conga drum makes a dry &apos;slap&apos; sound on beat 2 and beat 6, followed by two open ringing tones on counts 4 and 8. When you hear the open tones, step forward on 1!
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-600" />
              3. The Singer&apos;s Breath
            </span>
            <p>
              In authentic Cuban Son and Timba, vocal phrases almost always begin on count 1. Notice when the singer draws breath right on count 8 before shouting out the chorus!
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search reference songs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by track, artist, instrument (e.g. Batá, Campana), or subgenre..."
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
            />
          </div>

          <span className="text-xs text-muted-foreground font-semibold shrink-0">
            Showing {filteredTracks.length} of {CURRICULUM_REFERENCE_SONGS.length} benchmark tracks
          </span>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar border-t pt-3">
          <button
            type="button"
            onClick={() => setSelectedLevel("ALL")}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
              selectedLevel === "ALL"
                ? "bg-foreground text-background shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tracks ({CURRICULUM_REFERENCE_SONGS.length})
          </button>
          {(["Beginner", "Improver", "Intermediate", "Advanced"] as CurriculumLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-10 shrink-0 whitespace-nowrap flex items-center justify-center ${
                selectedLevel === lvl
                  ? "bg-foreground text-background shadow-xs"
                  : "border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Level: {lvl}
            </button>
          ))}
        </div>

        {/* Tempo Breakdown Guide */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Tempo & Genre Categories:</span>
          <span className="rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 font-semibold text-[11px]">
            Slow Son (80–90 BPM)
          </span>
          <span className="rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 font-semibold text-[11px]">
            Classic Casino (95–102 BPM)
          </span>
          <span className="rounded-full bg-orange-500/10 text-orange-800 dark:text-orange-300 px-2.5 py-0.5 font-semibold text-[11px]">
            High-Energy Timba (105+ BPM)
          </span>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredTracks.length === 0 ? (
          <div className="col-span-2 text-center py-12 rounded-2xl border bg-muted/20">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-bold text-base">No Matching Tracks Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching by artist (e.g., Alexander Abreu, Maykel Blanco) or clearing filters.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("ALL");
              }}
              className="mt-4 text-xs font-bold"
            >
              Reset Search
            </Button>
          </div>
        ) : (
          filteredTracks.map((track) => (
            <Card
              key={track.id}
              className="rounded-2xl border bg-card shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all overflow-hidden"
            >
              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Top Bar: Title, Artist, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                        <Music className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{track.title}</span>
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {track.artist}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1">
                        <Badge
                          className={`text-[10px] font-bold ${
                            track.level === "Beginner"
                              ? "bg-blue-700 text-white"
                              : track.level === "Improver"
                              ? "bg-emerald-800 text-white"
                              : track.level === "Intermediate"
                              ? "bg-amber-800 text-white"
                              : "bg-purple-700 text-white"
                          }`}
                        >
                          {track.level}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                          {track.bpm} BPM
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {track.subGenre}
                      </span>
                    </div>
                  </div>

                  {/* Why This Song? Callout */}
                  <div className="rounded-xl border border-amber-300/60 bg-amber-500/[0.05] dark:border-amber-500/20 dark:bg-amber-500/[0.04] p-3 space-y-1">
                    <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Pedagogical Focus &amp; Why This Song:
                    </span>
                    <p className="text-xs text-slate-800 dark:text-muted-foreground leading-relaxed">
                      {track.whyThisSong}
                    </p>
                  </div>

                  {/* Gear Shifts Observed */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-foreground block">
                      Musical Gear Shifts in this Track:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {track.gearShiftsObserved.map((gear) => (
                        <Badge
                          key={gear}
                          variant="outline"
                          className="text-[10px] font-semibold border-border bg-muted/40 text-foreground/80"
                        >
                          {gear}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Instruments to Listen For */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-foreground block">
                      Instruments to Listen For:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {track.instrumentsToListenFor.map((inst) => (
                        <Badge
                          key={inst}
                          variant="secondary"
                          className="text-[10px] font-medium"
                        >
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 mt-3">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Radio className="h-3.5 w-3.5 text-emerald-600" />
                    BOH Studios Playlist
                  </span>

                  <div className="flex items-center gap-2">
                    {(track.id === "ref-beg-1" || track.id === "ref-int-1") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const targetId =
                            track.id === "ref-beg-1"
                              ? "me-dicen-cuba"
                              : "la-cosa-mala";
                          setFeaturedSongId(targetId);
                          document
                            .getElementById("timba-song-anatomy-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="h-8 text-xs font-bold border-rose-700/30 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Compass className="mr-1.5 h-3.5 w-3.5" />
                        Song Map ↑
                      </Button>
                    )}

                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 shadow-xs"
                    >
                      <a
                        href={track.spotifySearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Spotify
                        <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
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
