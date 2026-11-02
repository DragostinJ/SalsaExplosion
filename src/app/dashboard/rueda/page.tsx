import { PageHeader } from "@/components/layout/page-header";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { CancionesTabs } from "@/components/navigation/door-tabs";
import { RuedaDictionaryClient } from "@/components/rueda/rueda-dictionary-client";

export const metadata = {
  title: "Rueda de Casino Call Dictionary | Salsa Explosion UK",
  description:
    "Official Cuban Rueda de Casino calls, hand signals, phonetic pronunciations, and partner rotation rules taught by Maestro Enrique Perez Valdes in Bournemouth.",
};

export default function RuedaDictionaryPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <CancionesTabs current="/dashboard/rueda" />
      <PageHeader
        art={MEDIA_MANIFEST.mockupGraphics.caller}
        title="Rueda de Casino"
        titleHighlight="Call Dictionary"
        description="Master the figures called in the Rueda circle at BOH Studios and Bournemouth Havana Fiesta socials. Learn Spanish pronunciations, hand signals for loud dance floors, and exact clave timing."
        badge="Cuban Syllabus"
        eyebrow="CANTANTE COMMAND HANDBOOK • 16+ AUTHENTIC CALLS • BOH STUDIOS"
      />

      {/* Dictionary Client Component */}
      <RuedaDictionaryClient />
    </main>
  );
}
