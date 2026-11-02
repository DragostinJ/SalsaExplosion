"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
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
  ChevronDown,
  ChevronUp,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateMyDanceRolePreferenceAction } from "@/actions/management.actions";
import { triggerStudioTutorial } from "@/components/onboarding/interactive-tutorial-modal";
import { DOOR_PRICING } from "@/lib/academy-data";

const ONBOARDING_DISMISS_KEY = "salsa_explosion_onboarding_guide_dismissed_v1";

interface NewDancerOnboardingProps {
  studentName: string;
  currentRole: DanceRole;
  currentLevel: DanceLevel;
  hasActiveBooking: boolean;
}

export function NewDancerOnboarding({
  studentName,
  currentRole,
  currentLevel,
  hasActiveBooking,
}: NewDancerOnboardingProps) {
  const [dismissed, setDismissed] = useState(true); // default true to prevent layout shift before hydration
  const [isExpanded, setIsExpanded] = useState(true);
  const [roleSelected, setRoleSelected] = useState<DanceRole>(currentRole);
  const [roleSaved, setRoleSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Read dismissal from localStorage on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const isDismissed = window.localStorage.getItem(ONBOARDING_DISMISS_KEY);
        if (isDismissed !== "true") {
          setDismissed(false);
        }
      } catch {
        setDismissed(false);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissPermanently = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(ONBOARDING_DISMISS_KEY, "true");
    } catch {
      // Ignore storage errors in private browsing
    }
  };

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

  if (dismissed) {
    return (
      <div className="flex items-center justify-between border-2 border-ink bg-poster-mustard px-4 py-2 text-xs text-ink">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Need a refresher on partner roles or passes?</span>
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerStudioTutorial}
            className="h-7 text-xs font-bold text-amber-300 hover:text-amber-800"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Quick Tour
          </Button>
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground p-0"
          >
            <Link href="/how-it-works">How It Works →</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden border-4 border-ink bg-paper p-4 text-ink shadow-[6px_6px_0_var(--color-ink)] sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            <Flame className="h-3 w-3 fill-amber-500 text-amber-600" />
            <span>New Dancer Quick Start</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
            ¡Bienvenido a la Rueda, {studentName}!
          </h2>
          <p className="max-w-2xl text-xs text-muted-foreground">
            No partner required! In Cuban Salsa we rotate in a circle. Pick your role below so we balance Leads & Follows.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={triggerStudioTutorial}
            className="min-h-[40px] rounded-none border-2 border-ink bg-ink px-3 text-xs font-bold text-paper hover:bg-ink"
          >
            <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            <span className="hidden xs:inline">Interactive</span> Tour
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex h-7 sm:h-8 text-xs font-semibold px-2.5 sm:px-3 border-amber-500/30 text-amber-300"
          >
            <Link href="/how-it-works">How It Works</Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Collapse onboarding guide" : "Expand onboarding guide"}
            className="h-7 sm:h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismissPermanently}
            aria-label="Dismiss guide permanently"
            className="h-7 sm:h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible 3-Step Content */}
      {isExpanded && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 animate-in fade-in duration-200">
          {/* Step 1: Choose Lead / Follow Role */}
          <div className="flex flex-col justify-between border-2 border-ink bg-paper p-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold text-xs"
                >
                  Step 1 • Partner Role
                </Badge>
                {roleSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-600" />
                Pick Your Role
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                <strong>Leads</strong> guide turn signals; <strong>Follows</strong> respond and style. Both dance with everyone!
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelectRole(DanceRole.LEAD)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  roleSelected === DanceRole.LEAD
                    ? "border-role-lead-line bg-role-lead-soft text-role-lead ring-1 ring-role-lead"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Footprints className="h-3.5 w-3.5 text-role-lead" aria-hidden="true" />
                <span>Lead</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelectRole(DanceRole.FOLLOW)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  roleSelected === DanceRole.FOLLOW
                    ? "border-role-follow-line bg-role-follow-soft text-role-follow ring-1 ring-role-follow"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Footprints className="h-3.5 w-3.5 text-role-follow" aria-hidden="true" />
                <span>Follow</span>
              </button>
            </div>
          </div>

          {/* Step 2: Your level, and how paying works (at the door, never online) */}
          <div className="flex flex-col justify-between border-2 border-ink bg-paper p-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold text-xs"
                >
                  Step 2 • Your Tier
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              </div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                {currentLevel} Tier
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Two left feet are 100% welcome! Pay at the door, cash or card.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs">
              <span className="font-semibold text-emerald-200 text-[11px]">
                £{DOOR_PRICING.oneClassPounds} one class · £{DOOR_PRICING.twoClassesPounds} two
              </span>
              <span className="text-xs font-bold text-emerald-300">
                Social free
              </span>
            </div>
          </div>

          {/* Step 3: Tap Book below & Show QR at Door */}
          <div className="flex flex-col justify-between border-2 border-ink bg-paper p-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold text-xs"
                >
                  Step 3 • Optional
                </Badge>
                {hasActiveBooking && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> See you there!
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5 text-amber-600" />
                Tell the teachers
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                No booking needed. If you like, tap <strong>I&apos;m coming</strong> on a class below so the teachers know to expect you.
              </p>
            </div>

            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  const grid = document.getElementById("schedule-classes-grid");
                  grid?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full h-7 text-xs font-bold"
              >
                <span>Jump to Classes</span>
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
