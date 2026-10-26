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

      {/* Header — "The Place" Havana Nocturne Architecture */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-[#070605] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-[11px] font-black uppercase tracking-widest text-amber-300">
          <span>CANTANTE COMMAND HANDBOOK • 16+ AUTHENTIC CALLS</span>
          <span className="text-zinc-400 font-bold">BOH STUDIOS BOURNEMOUTH</span>
        </div>

        <div className="mt-4 space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none text-white">
              Rueda de Casino{" "}
              <span className="font-display italic font-normal text-amber-300 normal-case">
                Call Dictionary
              </span>
            </h1>
            <Badge className="bg-amber-400 text-stone-950 font-black text-xs">
              <Users className="mr-1 h-3.5 w-3.5" />
              Cuban Syllabus
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
            Master the figures called in the Rueda circle at BOH Studios and Bournemouth Havana Fiesta socials. Learn Spanish pronunciations, hand signals for loud dance floors, and exact clave timing.
          </p>
        </div>
      </div>

      {/* Dictionary Client Component */}
      <RuedaDictionaryClient />
    </main>
  );
}
