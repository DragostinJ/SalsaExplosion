"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DanceLevel, DanceRole } from "@prisma/client";
import {
  CheckCircle2,
  Flame,
  Sparkles,
  Users,
  CalendarCheck,
  X,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateMyDanceRolePreferenceAction } from "@/actions/management.actions";
import { triggerStudioTutorial } from "@/components/onboarding/interactive-tutorial-modal";

interface NewDancerOnboardingProps {
  studentName: string;
  currentRole: DanceRole;
  currentLevel: DanceLevel;
  classCredits: number;
  hasActiveBooking: boolean;
}

export function NewDancerOnboarding({
  studentName,
  currentRole,
  currentLevel,
  classCredits,
  hasActiveBooking,
}: NewDancerOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);
  const [roleSelected, setRoleSelected] = useState<DanceRole>(currentRole);
  const [roleSaved, setRoleSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (dismissed) return null;

  const handleSelectRole = (newRole: DanceRole) => {
    setRoleSelected(newRole);
    startTransition(async () => {
      const res = await updateMyDanceRolePreferenceAction({
        preferredRole: newRole,
      });
      if (res.success) {
        setRoleSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-amber-500/[0.08] via-background to-orange-500/[0.05] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
            <span>First 60 Seconds • New Dancer Welcome Guide</span>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
            ¡Bienvenido a la Rueda, {studentName}! Ready for your first dance?
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground">
            No complicated menus. Complete these 3 quick steps in under 60 seconds so we can balance partners on the dance floor.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={triggerStudioTutorial}
            className="h-8 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-bold shadow-xs"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
            Interactive Studio Tour
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            Hide
          </Button>
        </div>
      </div>

      {/* 3-Step Visual Progression */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {/* Step 1: Choose Lead / Follow Role */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card/90 p-4 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px]"
              >
                Step 1 of 3
              </Badge>
              {roleSaved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-amber-500" />
              Pick Your Partner Role
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In Cuban Salsa, <strong>Leads</strong> guide the turn signals and <strong>Follows</strong> style and respond. We track both so no one stands alone!
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSelectRole(DanceRole.LEAD)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                roleSelected === DanceRole.LEAD
                  ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              🕺 Lead
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSelectRole(DanceRole.FOLLOW)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                roleSelected === DanceRole.FOLLOW
                  ? "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              💃 Follow
            </button>
          </div>
        </div>

        {/* Step 2: Your Welcome Level & Credit */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card/90 p-4 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
              >
                Step 2 of 3
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Unlocked
              </span>
            </div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Your Tier & Welcome Credit
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You start at <strong>{currentLevel}</strong> (no experience needed, two left feet welcome!) with <strong>{classCredits} Class Credit(s)</strong> ready in your wallet.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Wallet Balance: {classCredits} Credit{classCredits === 1 ? "" : "s"}
            </span>
            <Badge className="bg-emerald-600 text-white text-[10px]">
              Ready
            </Badge>
          </div>
        </div>

        {/* Step 3: Tap Book below & Show QR at Door */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card/90 p-4 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px]"
              >
                Step 3 of 3
              </Badge>
              {hasActiveBooking && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Class Booked!
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-amber-500" />
              Reserve Your Spot Below
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pick any <strong>{currentLevel}</strong> class below and tap <strong>Book as {roleSelected}</strong>. When you arrive at the studio, scan the door QR!
            </p>
          </div>

          <div className="mt-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                const grid = document.getElementById("schedule-classes-grid");
                grid?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full text-xs font-bold"
            >
              <span>Jump to Beginner Classes</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
