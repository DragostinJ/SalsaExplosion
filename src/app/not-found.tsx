import Link from "next/link";
import { Compass, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-lg shadow-primary-base/20">
          <Compass className="h-8 w-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-base">
            404 • Step Count Missed
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Lost on the Dance Floor?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn&apos;t find the page you were stepping toward. In Cuban Casino, when you lose count, you simply reset to the basic step on count 1!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold shadow-md shadow-primary-base/20 transition-colors"
          >
            <Link href="/dashboard/schedule">
              <CalendarDays className="mr-2 h-4 w-4" />
              Reset to Class Schedule
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-secondary-base/40 text-secondary-hover hover:bg-secondary-light/40 font-semibold"
          >
            <Link href="/events">
              <Sparkles className="mr-2 h-4 w-4 text-secondary-base" />
              Browse Festivals & Events
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/70 pt-4">
          Need assistance? Talk to any floor ambassador or visit Maestro Enrique at BOH Studios Bournemouth.
        </p>
      </div>
    </main>
  );
}
