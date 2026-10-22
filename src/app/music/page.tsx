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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-border bg-muted/40 text-muted-foreground font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Headphones className="h-3.5 w-3.5 text-primary-base" />
          Havana Social Floor Playlists
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cuban Music & Social Playlist Hub
            </h1>
            <Badge className="bg-primary-base text-white font-bold">
              <Music className="mr-1 h-3.5 w-3.5" />
              BPM & Clave Guide
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Learn the songs played every Thursday & Sunday at BOH Studios and the Bournemouth Summer Cuban Congress. Categorized by tempo with direct Spotify search links.
          </p>
        </div>
      </div>

      {/* Music Client Component */}
      <CubanMusicHubClient />
    </main>
  );
}
