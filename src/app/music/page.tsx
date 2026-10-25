import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Music, Headphones } from "lucide-react";
import { CubanMusicHubClient } from "@/components/music/cuban-music-hub-client";

export const metadata = {
  title: "Cuban Music & Social Playlists | Salsa Explosion Bournemouth",
  description:
    "Curated Cuban Son, Casino, and Timba music tracks recommended by Maestro Enrique Perez Valdes. Master timing, clave, and find beat 1 on the dance floor.",
};

export default function CubanMusicPage() {
  return (
    <main className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-2.5 sm:space-y-6">
      {/* Compact 1-Line Mobile Top Bar (< md) + Full Desktop Header (md+) */}
      <div className="flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border bg-card px-3 py-2 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <BackButton fallbackUrl="/dashboard/schedule" label="Schedule" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-2xl font-black tracking-tight text-foreground truncate">
                Cuban Music &amp; Social Playlist Hub
              </h1>
              <Badge className="hidden sm:inline-flex bg-primary-base text-white font-bold text-xs">
                <Music className="mr-1 h-3.5 w-3.5" />
                BPM &amp; Clave Guide
              </Badge>
            </div>
            <p className="hidden md:block mt-0.5 text-xs text-muted-foreground max-w-3xl">
              Learn the songs played every Thursday &amp; Sunday at BOH Studios. Follow the live Timba Song Trainer below.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="border-border bg-muted/40 text-muted-foreground font-semibold px-2.5 py-0.5 text-[10px] sm:text-xs flex items-center gap-1 shrink-0"
        >
          <Headphones className="h-3 w-3 text-primary-base" />
          <span className="hidden sm:inline">Havana Social Floor</span>
          <span className="sm:hidden">Havana HUD</span>
        </Badge>
      </div>

      {/* Music Client Component */}
      <CubanMusicHubClient />
    </main>
  );
}
