import { PageHeader } from "@/components/layout/page-header";
import { CubanMusicHubClient } from "@/components/music/cuban-music-hub-client";

export const metadata = {
  title: "Cuban Music & Social Playlists | Salsa Explosion Bournemouth",
  description:
    "Curated Cuban Son, Casino, and Timba music tracks recommended by Maestro Enrique Perez Valdes. Master timing, clave, and find beat 1 on the dance floor.",
};

export default function CubanMusicPage() {
  return (
    <main className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-2.5 sm:space-y-6">
      <PageHeader
        title="Cuban Music &"
        titleHighlight="Social Playlist Hub"
        description="Learn the songs played every Thursday & Sunday at BOH Studios. Follow the live Timba Song Trainer below to master timing, clave, and find beat 1 on the dance floor."
        badge="BPM & Clave Guide"
        eyebrow="HAVANA SOCIAL FLOOR • TIMBA HUD"
        backHref="/dashboard/schedule"
        backLabel="Schedule"
      />

      {/* Music Client Component */}
      <CubanMusicHubClient />
    </main>
  );
}
