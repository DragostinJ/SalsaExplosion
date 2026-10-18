"use client";

import { useState } from "react";
import {
  Music,
  Headphones,
  ExternalLink,
  Flame,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  category: "SON" | "CASINO" | "TIMBA";
  categoryLabel: string;
  keyFeature: string;
  recommendedFor: string;
  spotifySearchUrl: string;
}

const PLAYLIST_TRACKS: TrackItem[] = [
  // 1. Slow Cuban Son
  {
    id: "son-1",
    title: "Chan Chan",
    artist: "Buena Vista Social Club",
    bpm: 84,
    category: "SON",
    categoryLabel: "Classic Cuban Son",
    keyFeature: "Clean acoustic guitar syncopation, slow tempo to clearly hear count 1 and the 2-3 clave.",
    recommendedFor: "Beginners learning foundational Guapea and weight transfers.",
    spotifySearchUrl: "https://open.spotify.com/search/Buena%20Vista%20Social%20Club%20Chan%20Chan",
  },
  {
    id: "son-2",
    title: "El Cuarto de Tula",
    artist: "Buena Vista Social Club",
    bpm: 88,
    category: "SON",
    categoryLabel: "Mid-Tempo Son Tradicional",
    keyFeature: "Accelerating montuno, prominent bongo martillo pattern on counts 1, 3, 5, 7.",
    recommendedFor: "Practicing continuous partner turns with calm upper body posture.",
    spotifySearchUrl: "https://open.spotify.com/search/El%20Cuarto%20de%20Tula",
  },
  {
    id: "son-3",
    title: "Son al Son",
    artist: "Septeto Santiaguero",
    bpm: 86,
    category: "SON",
    categoryLabel: "Traditional Son Cubano",
    keyFeature: "Tres guitar arpeggio and clear maracas driving counts 1-2-3.",
    recommendedFor: "Finding beat 1 without rushing during introductory classes.",
    spotifySearchUrl: "https://open.spotify.com/search/Septeto%20Santiaguero%20Son%20al%20Son",
  },

  // 2. Classic Casino
  {
    id: "cas-1",
    title: "Este Amor Que Se Muere",
    artist: "Los Van Van",
    bpm: 96,
    category: "CASINO",
    categoryLabel: "Songo & Classic Casino",
    keyFeature: "Signature songo drum beat created by Changuito; prominent cowbell accents.",
    recommendedFor: "Improvers mastering Dile Que No and Setenta combinations.",
    spotifySearchUrl: "https://open.spotify.com/search/Los%20Van%20Van%20Este%20Amor%20Que%20Se%20Muere",
  },
  {
    id: "cas-2",
    title: "Que Sorpresa",
    artist: "Los Van Van",
    bpm: 98,
    category: "CASINO",
    categoryLabel: "Classic Casino",
    keyFeature: "Melodic trombone horn lines followed by an irresistible piano montuno groove.",
    recommendedFor: "Rueda de Casino circles with fast Cantante commands.",
    spotifySearchUrl: "https://open.spotify.com/search/Los%20Van%20Van%20Que%20Sorpresa",
  },
  {
    id: "cas-3",
    title: "Brujería",
    artist: "Elito Revé y Su Charangón",
    bpm: 99,
    category: "CASINO",
    categoryLabel: "Changüí-Casino",
    keyFeature: "Deep rustic Changüí bassline; powerful lead vocal improvisations.",
    recommendedFor: "Practicing Cuban arm wraps and Sombrero styling.",
    spotifySearchUrl: "https://open.spotify.com/search/Elito%20Reve%20Brujeria",
  },

  // 3. High-Energy Timba & Reparto
  {
    id: "tim-1",
    title: "Me Dicen Cuba",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 106,
    category: "TIMBA",
    categoryLabel: "Modern Timba Anthem",
    keyFeature: "Virtuoso trumpet fanfares and explosive brass breaks on count 1. The official anthem of Bournemouth Friday socials.",
    recommendedFor: "Social dancers ready for high-energy partner rotations.",
    spotifySearchUrl: "https://open.spotify.com/search/Alexander%20Abreu%20Me%20Dicen%20Cuba",
  },
  {
    id: "tim-2",
    title: "Chaca Chaca",
    artist: "Maykel Blanco y Su Salsa Mayor",
    bpm: 108,
    category: "TIMBA",
    categoryLabel: "Timba Brava",
    keyFeature: "Rapid piano tumbaos, syncopated floor breaks, and intense Afro-Cuban despelote mambos.",
    recommendedFor: "Advanced Casineros and Bournemouth Summer Congress socials.",
    spotifySearchUrl: "https://open.spotify.com/search/Maykel%20Blanco%20Chaca%20Chaca",
  },
  {
    id: "tim-3",
    title: "Pasaporte",
    artist: "Alexander Abreu y Havana D'Primera",
    bpm: 104,
    category: "TIMBA",
    categoryLabel: "Modern Timba",
    keyFeature: "Deep rhythmic swing, vocal call-and-response, and dynamic energy shifts.",
    recommendedFor: "Practicing musicality stops, footwork accents, and afro ribcage isolations.",
    spotifySearchUrl: "https://open.spotify.com/search/Havana%20D%27Primera%20Pasaporte",
  },
  {
    id: "tim-4",
    title: "Ya Te Olvidé",
    artist: "Maykel Blanco y Su Salsa Mayor",
    bpm: 105,
    category: "TIMBA",
    categoryLabel: "Timba Romántica",
    keyFeature: "Catchy romantic chorus followed by an aggressive bass drop and timbal roll.",
    recommendedFor: "Friday Havana Fiesta midnight social sets at BOH Studios.",
    spotifySearchUrl: "https://open.spotify.com/search/Maykel%20Blanco%20Ya%20Te%20Olvide",
  },
];

export function CubanMusicHubClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredTracks = PLAYLIST_TRACKS.filter((t) =>
    selectedCategory === "ALL" ? true : t.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Musicality Guide from Maestro Enrique */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.04] to-background p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-600 text-white font-bold text-xs">
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
          <div className="rounded-2xl border bg-background/80 p-4 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-amber-600" />
              1. Listen for the Piano Montuno
            </span>
            <p>
              The piano keyboard sets the groove. In Cuban salsa, the pianist plays a cyclical arpeggio (montuno) that always accents the preparation on count 8 and resolves firmly on beat 1.
            </p>
          </div>

          <div className="rounded-2xl border bg-background/80 p-4 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-rose-600" />
              2. Feel the Conga Slap
            </span>
            <p>
              The conga drum makes a dry &apos;slap&apos; sound on beat 2 and beat 6, followed by two open ringing tones on counts 4 and 8. When you hear the open tones, step forward on 1!
            </p>
          </div>

          <div className="rounded-2xl border bg-background/80 p-4 space-y-2">
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "ALL"
                ? "bg-amber-600 text-white shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tracks ({PLAYLIST_TRACKS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("SON")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "SON"
                ? "bg-amber-600 text-white shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Slow Son (80–90 BPM)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("CASINO")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "CASINO"
                ? "bg-amber-600 text-white shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Classic Casino (95–102 BPM)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("TIMBA")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === "TIMBA"
                ? "bg-amber-600 text-white shadow-xs"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Timba & Congress (105+ BPM)
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-semibold">
          Showing {filteredTracks.length} curated tracks
        </span>
      </div>

      {/* Tracks Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTracks.map((track) => (
          <Card
            key={track.id}
            className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {track.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {track.artist}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={`text-[10px] font-bold ${
                      track.category === "SON"
                        ? "bg-blue-600 text-white"
                        : track.category === "CASINO"
                        ? "bg-emerald-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {track.bpm} BPM
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {track.categoryLabel}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {track.keyFeature}
              </p>

              <div className="rounded-xl border bg-muted/30 p-2.5 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground">Best Practice Use:</span>
                <p className="text-muted-foreground">{track.recommendedFor}</p>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Music className="h-3.5 w-3.5 text-amber-600" />
                Featured at BOH Studios Socials
              </span>

              <Button
                asChild
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <a
                  href={track.spotifySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Listen on Spotify
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
