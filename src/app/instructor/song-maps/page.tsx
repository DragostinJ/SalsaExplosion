import type { Metadata } from "next";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { SongMapImporter } from "@/components/instructor/song-map-importer";

export const metadata: Metadata = {
  title: "Song Map Importer | Salsa Explosion Faculty",
  description: "Validate Argus song timing maps and preview them in the practice player before publishing.",
  robots: { index: false, follow: false },
};

export default async function SongMapsPage() {
  await requireRole(STAFF_ROLES);

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <InstructorNav />
        <h1 className="font-display text-2xl font-bold">Song map importer</h1>
        <p className="mt-1 mb-6 text-sm text-ivory-muted">
          Turn Argus timing output into a checked, playable song for the practice player.
        </p>
        <SongMapImporter />
      </div>
    </div>
  );
}
