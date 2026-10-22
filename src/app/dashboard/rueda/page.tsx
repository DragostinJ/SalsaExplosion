import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { RuedaDictionaryClient } from "@/components/rueda/rueda-dictionary-client";

export const metadata = {
  title: "Rueda de Casino Call Dictionary | Salsa Explosion UK",
  description:
    "Official Cuban Rueda de Casino calls, hand signals, phonetic pronunciations, and partner rotation rules taught by Maestro Enrique Perez Valdes in Bournemouth.",
};

export default function RuedaDictionaryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Cantante Command Handbook
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Rueda de Casino Call Dictionary
            </h1>
            <Badge className="bg-amber-500 text-zinc-950 font-bold">
              <Users className="mr-1 h-3.5 w-3.5" />
              16+ Authentic Calls
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Master the figures called in the Rueda circle at BOH Studios and Bournemouth Havana Fiesta socials. Learn Spanish pronunciations, hand signals for loud dance floors, and exact clave timing.
          </p>
        </div>
      </div>

      {/* Dictionary Client Component */}
      <RuedaDictionaryClient />
    </main>
  );
}
