import type { Metadata } from "next";
import Image from "next/image";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { SongMapImporter } from "@/components/instructor/song-map-importer";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export const metadata: Metadata = {
  title: "Song Map Importer | Salsa Explosion Faculty",
  description: "Validate Argus song timing maps and preview them in the practice player before publishing.",
  robots: { index: false, follow: false },
};

export default async function SongMapsPage() {
  await requireRole(STAFF_ROLES);
  const stopwatch = MEDIA_MANIFEST.mockupGraphics.stopwatch;

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <InstructorNav />
        <div className="mb-6 flex items-center gap-4">
          <Image src={stopwatch.src} alt="" width={stopwatch.width} height={stopwatch.height} sizes="5rem" className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
          <div>
            <h1 className="font-display text-2xl font-bold">Song map importer</h1>
            <p className="mt-1 text-sm text-ivory-muted">
              Turn Argus timing output into a checked, playable song for the practice player.
            </p>
          </div>
        </div>
        <SongMapImporter />
      </div>
    </div>
  );
}
