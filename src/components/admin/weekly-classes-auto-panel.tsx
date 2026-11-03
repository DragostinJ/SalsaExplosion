"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createUpcomingWeeklyClassesAction } from "@/actions/management/weekly-sessions.actions";

/** Tells the owner the weekly classes look after themselves, with a button for "do it now". */
export function WeeklyClassesAutoPanel({ upcomingCount, lastStartLabel }: { upcomingCount: number; lastStartLabel: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runNow = () => {
    startTransition(async () => {
      const res = await createUpcomingWeeklyClassesAction();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <section aria-labelledby="weekly-auto-heading" className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />
        <h2 id="weekly-auto-heading" className="text-base font-bold">
          Thursday and Sunday classes are added automatically
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Every morning the site adds any missing classes for the next 4 weeks, straight from the timetable, with the right
        teacher. Nights when a festival or party uses the hall are left out. To skip a night, like a holiday, cancel that
        class below: it won&apos;t come back.
      </p>
      <p className="text-sm font-semibold">
        {upcomingCount > 0
          ? `${upcomingCount} classes coming up${lastStartLabel ? `, until ${lastStartLabel}` : ""}.`
          : "No classes coming up yet. They'll appear tomorrow morning, or press the button."}
      </p>
      <Button type="button" onClick={runNow} disabled={isPending} variant="outline" className="min-h-10 font-bold">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {isPending ? "Adding classes..." : "Add the next 4 weeks now"}
      </Button>
    </section>
  );
}
