"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { BookingStatus, DanceLevel, DanceRole, DanceStyle } from "@prisma/client";
import {
  bookClassAction,
  cancelBookingAction,
} from "@/actions/booking.actions";
import {
  CANCELLATION_WINDOW_HOURS,
  LEVEL_WEIGHT,
} from "@/lib/constants/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { triggerQuickBookDrawer } from "@/components/booking/QuickBookDrawer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { toast } from "sonner";
import { AddToCalendarButton } from "@/components/calendar/add-to-calendar-button";
import {
  DigitalEtiquetteModal,
  ETIQUETTE_STORAGE_KEY,
} from "@/components/beginners/digital-etiquette-modal";
import { PostClassCheckinModal } from "@/components/beginners/post-class-checkin-modal";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface ClassScheduleItem {
  id: string;
  title: string;
  description: string | null;
  style: DanceStyle;
  minLevel: DanceLevel;
  startTime: string; // ISO string from Server Component
  endTime: string;
  room: string;
  maxCapacity: number;
  maxLeads: number | null;
  maxFollows: number | null;
  bookedCount: number;
  currentLeadsCount: number;
  currentFollowsCount: number;
  creditCost: number;
  isCancelled: boolean;
  instructor: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  userBooking: {
    id: string;
    danceRole: DanceRole;
    status?: BookingStatus;
  } | null;
}

export interface StudentContext {
  currentLevel: DanceLevel;
  preferredRole: DanceRole;
  classCredits: number;
  hasActiveSubscription: boolean;
  isGuest?: boolean;
}

interface ClassScheduleCardProps {
  session: ClassScheduleItem;
  student: StudentContext | null;
}

interface OptimisticBookingState {
  isBooked: boolean;
  bookingId: string | null;
  bookedRole: DanceRole | null;
  bookedCount: number;
  leadsCount: number;
  followsCount: number;
}

type OptimisticAction =
  | { type: "BOOK"; role: DanceRole }
  | { type: "CANCEL" };

// ==========================================
// COMPONENT
// ==========================================

export function ClassScheduleCard({
  session,
  student,
}: ClassScheduleCardProps) {
  const router = useRouter();
  const isSoloClass =
    session.maxLeads === null && session.maxFollows === null;

  const isGuest = !student || student.isGuest;
  const [selectedRole, setSelectedRole] = React.useState<DanceRole>(
    session.userBooking?.danceRole ??
      (isSoloClass ? DanceRole.SOLO : student?.preferredRole ?? DanceRole.LEAD)
  );

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const [showEtiquetteModal, setShowEtiquetteModal] = React.useState(false);
  const [showCheckinModal, setShowCheckinModal] = React.useState(false);

  // Optimistic State for instant spot counter & badge feedback
  const [optimisticState, addOptimisticUpdate] = React.useOptimistic<
    OptimisticBookingState,
    OptimisticAction
  >(
    {
      isBooked: Boolean(session.userBooking),
      bookingId: session.userBooking?.id ?? null,
      bookedRole: session.userBooking?.danceRole ?? null,
      bookedCount: session.bookedCount,
      leadsCount: session.currentLeadsCount,
      followsCount: session.currentFollowsCount,
    },
    (state, action) => {
      if (action.type === "BOOK") {
        return {
          isBooked: true,
          bookingId: "optimistic-id",
          bookedRole: action.role,
          bookedCount: state.bookedCount + 1,
          leadsCount:
            action.role === DanceRole.LEAD
              ? state.leadsCount + 1
              : state.leadsCount,
          followsCount:
            action.role === DanceRole.FOLLOW
              ? state.followsCount + 1
              : state.followsCount,
        };
      }
      return {
        isBooked: false,
        bookingId: null,
        bookedRole: null,
        bookedCount: Math.max(0, state.bookedCount - 1),
        leadsCount:
          state.bookedRole === DanceRole.LEAD
            ? Math.max(0, state.leadsCount - 1)
            : state.leadsCount,
        followsCount:
          state.bookedRole === DanceRole.FOLLOW
            ? Math.max(0, state.followsCount - 1)
            : state.followsCount,
      };
    }
  );

  const startDate = new Date(session.startTime);
  const [isWithinCancellationWindow] = React.useState(() => {
    const startTimeMs = new Date(session.startTime).getTime();
    const hours = (startTimeMs - Date.now()) / (1000 * 60 * 60);
    return hours < CANCELLATION_WINDOW_HOURS;
  });

  const isLevelUnlocked = isGuest
    ? true // Allow guests to view and evaluate all levels
    : LEVEL_WEIGHT[student.currentLevel] >= LEVEL_WEIGHT[session.minLevel];

  const isTotalFull = optimisticState.bookedCount >= session.maxCapacity;
  const isLeadFull =
    session.maxLeads !== null && optimisticState.leadsCount >= session.maxLeads;
  const isFollowFull =
    session.maxFollows !== null &&
    optimisticState.followsCount >= session.maxFollows;

  const isSelectedRoleFull =
    isTotalFull ||
    (selectedRole === DanceRole.LEAD && isLeadFull) ||
    (selectedRole === DanceRole.FOLLOW && isFollowFull);

  const canAfford = isGuest
    ? true
    : student.hasActiveSubscription ||
      student.classCredits >= session.creditCost;

  const spotsRemaining = Math.max(
    0,
    session.maxCapacity - optimisticState.bookedCount
  );

  const handleBook = () => {
    setFeedback(null);

    startTransition(async () => {
      addOptimisticUpdate({ type: "BOOK", role: selectedRole });

      const result = await bookClassAction({
        classSessionId: session.id,
        danceRole: selectedRole,
      });

      if (!result.success) {
        toast.error(result.error.message);
        setFeedback({
          type: "error",
          message: result.error.message,
        });
        return;
      }

      toast.success("You're in! See you on the floor 💃", {
        description: `${session.title} secured as ${selectedRole}.`,
      });
      setFeedback({
        type: "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  const attemptBook = () => {
    try {
      const agreed = window.localStorage.getItem(ETIQUETTE_STORAGE_KEY);
      if (agreed !== "true") {
        setShowEtiquetteModal(true);
        return;
      }
    } catch {
      // ignore
    }
    handleBook();
  };

  const handleCancel = () => {
    if (!session.userBooking?.id) return;
    setFeedback(null);

    startTransition(async () => {
      addOptimisticUpdate({ type: "CANCEL" });

      const result = await cancelBookingAction({
        bookingId: session.userBooking!.id,
      });

      if (!result.success) {
        toast.error(result.error.message);
        setFeedback({
          type: "error",
          message: result.error.message,
        });
        return;
      }

      if (result.data.isLateCancellation) {
        toast.warning(result.message);
      } else {
        toast.success(result.message);
      }
      setFeedback({
        type: result.data.isLateCancellation ? "warning" : "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  return (
    <Card
      className={`flex flex-col justify-between transition-all ${
        optimisticState.isBooked
          ? "border-emerald-500/50 bg-emerald-500/[0.02] ring-1 ring-emerald-500/30"
          : ""
      } ${!isLevelUnlocked ? "opacity-90" : ""}`}
    >
      <CardHeader className="space-y-3 pb-4">
        {/* Top Badges: Level & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-border bg-muted/50 text-muted-foreground font-medium text-[11px]"
          >
            {session.minLevel === DanceLevel.BEGINNER
              ? "Level 0: Absolute Beginner"
              : session.minLevel}
          </Badge>

          {optimisticState.isBooked ? (
            <Badge className="bg-secondary-base text-white hover:bg-secondary-hover">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Booked ({optimisticState.bookedRole})
            </Badge>
          ) : !isLevelUnlocked ? (
            <Badge variant="outline" className="border-accent-tangerine/40 text-accent-tangerine">
              <Lock className="mr-1 h-3 w-3" />
              Level Locked
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {student?.hasActiveSubscription
                ? "Included in Membership"
                : `${session.creditCost} ${
                    session.creditCost === 1 ? "Credit (or \u00A310 Drop-In)" : "Credits (or \u00A310 Drop-In)"
                  }`}
            </Badge>
          )}
        </div>

        {/* Title & Instructor with Avatar */}
        <div className="flex items-start gap-3.5 pt-0.5">
          <TeacherAvatar
            name={`${session.instructor.firstName} ${session.instructor.lastName}`}
            avatarUrl={session.instructor.avatarUrl}
            size="lg"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg leading-snug font-bold">
              {session.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1 font-medium text-muted-foreground flex items-center gap-1">
              <span>Maestro {session.instructor.firstName} {session.instructor.lastName}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4 text-sm">
        {/* Time, Studio Room & Partner Reassurance Metadata */}
        <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5 text-xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground">
                Every {startDate.toLocaleDateString("en-GB", { weekday: "long" })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground/90 font-medium">
                {startDate.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(session.endTime).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/50 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{session.room}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/85">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>No Partner Needed • Rotations</span>
            </div>
          </div>
        </div>

        {/* Capacity & Partner Ratio Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Class Capacity
            </span>
            <span
              className={`font-semibold ${
                spotsRemaining <= 3
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              }`}
            >
              {spotsRemaining === 0
                ? "Sold Out"
                : `${spotsRemaining} of ${session.maxCapacity} spots left`}
            </span>
          </div>

          {/* Dual-Color Automated Lead vs Follow Ratio Meter */}
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted flex">
              <div
                title={`Leads booked: ${optimisticState.leadsCount}`}
                className="h-full bg-sky-500/60 dark:bg-sky-400/50 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    session.maxCapacity > 0
                      ? Math.round((optimisticState.leadsCount / session.maxCapacity) * 100)
                      : 0
                  )}%`,
                }}
              />
              <div
                title={`Follows booked: ${optimisticState.followsCount}`}
                className="h-full bg-rose-400/60 dark:bg-rose-400/50 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    session.maxCapacity > 0
                      ? Math.round((optimisticState.followsCount / session.maxCapacity) * 100)
                      : 0
                  )}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-sky-500/75" />
                {optimisticState.leadsCount} Leads
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-400/75" />
                {optimisticState.followsCount} Follows
              </span>
            </div>
          </div>

          {/* Partner Role Selector */}
          {!isSoloClass && !optimisticState.isBooked && isLevelUnlocked && (
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                type="button"
                disabled={isPending || isLeadFull}
                onClick={() => setSelectedRole(DanceRole.LEAD)}
                className={`flex items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all min-h-[40px] ${
                  selectedRole === DanceRole.LEAD
                    ? "border-sky-500/45 bg-sky-500/12 text-sky-950 dark:text-sky-100 shadow-xs ring-1 ring-sky-500/20"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                } ${isLeadFull ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedRole === DanceRole.LEAD
                        ? "bg-sky-600 dark:bg-sky-400"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  Lead
                </span>
                {session.maxLeads !== null && (
                  <span
                    className={`text-[11px] font-bold ${
                      selectedRole === DanceRole.LEAD
                        ? "text-sky-900/80 dark:text-sky-200/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isLeadFull
                      ? "Full"
                      : `${session.maxLeads - optimisticState.leadsCount} left`}
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={isPending || isFollowFull}
                onClick={() => setSelectedRole(DanceRole.FOLLOW)}
                className={`flex items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all min-h-[40px] ${
                  selectedRole === DanceRole.FOLLOW
                    ? "border-rose-400/45 bg-rose-500/12 text-rose-950 dark:text-rose-100 shadow-xs ring-1 ring-rose-400/20"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                } ${isFollowFull ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedRole === DanceRole.FOLLOW
                        ? "bg-rose-500 dark:bg-rose-400"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  Follow
                </span>
                {session.maxFollows !== null && (
                  <span
                    className={`text-[11px] font-bold ${
                      selectedRole === DanceRole.FOLLOW
                        ? "text-rose-900/80 dark:text-rose-200/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isFollowFull
                      ? "Full"
                      : `${session.maxFollows - optimisticState.followsCount} left`}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Inline Action Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-md border p-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "border-secondary-base/30 bg-secondary-light/30 text-secondary-hover"
                : feedback.type === "warning"
                  ? "border-accent-tangerine/30 bg-accent-tangerine/10 text-accent-tangerine"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : feedback.type === "warning" ? (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/10 pt-4">
        {!isLevelUnlocked ? (
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/progression">
              <Sparkles className="mr-2 h-4 w-4 text-accent-tangerine" />
              Submit {session.minLevel} Video to Unlock
            </Link>
          </Button>
        ) : optimisticState.isBooked ? (
          session.userBooking?.status === BookingStatus.ATTENDED ? (
            <div className="w-full space-y-2">
              <Button
                asChild
                variant="secondary"
                className="w-full border border-secondary-base/40 bg-secondary-light/40 text-secondary-hover font-bold"
              >
                <Link href={`/checkin/${session.id}`}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Checked In at Door ✓ (View QR Pass)
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCheckinModal(true)}
                className="w-full border-accent-tangerine/40 bg-accent-tangerine/10 text-accent-tangerine font-bold text-xs hover:bg-accent-tangerine/20"
              >
                💬 How was your class? (Share Comfort Check-In)
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full font-semibold text-xs"
                >
                  <Link href={`/checkin/${session.id}`}>
                    <QrCode className="mr-1.5 h-3.5 w-3.5 text-accent-tangerine" />
                    Door QR Pass
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleCancel}
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                >
                  {isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isWithinCancellationWindow &&
                  !student?.hasActiveSubscription
                    ? "Cancel (No Refund)"
                    : "Cancel Spot"}
                </Button>
              </div>
              <AddToCalendarButton
                event={{
                  title: `${session.title} — Salsa Explosion UK`,
                  description: `Cuban Salsa & Rueda de Casino class at BOH Studios Bournemouth with ${session.instructor.firstName} ${session.instructor.lastName}. Role: ${optimisticState.bookedRole || selectedRole}.`,
                  location: `BOH Studios Bournemouth, 12-14 Post Office Rd, Bournemouth BH1 1DH, UK`,
                  startDate: new Date(session.startTime),
                  endDate: new Date(session.endTime),
                }}
                className="w-full justify-center"
              />
            </div>
          )
        ) : isGuest ? (
          <div className="w-full space-y-2">
            <Button
              type="button"
              onClick={() =>
                triggerQuickBookDrawer({
                  title: session.title,
                  time: startDate.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  level: session.minLevel,
                  instructor: `${session.instructor.firstName} ${session.instructor.lastName}`.trim(),
                  day: startDate.getDay() === 0 ? "sunday" : "thursday",
                })
              }
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs h-10 rounded-xl shadow-md transition-colors"
            >
              Instant 2-Tap QuickBook →
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
              <Link href={`/sign-in?redirect_url=${encodeURIComponent("/dashboard/schedule")}`}>
                Sign In with Full Account
              </Link>
            </Button>
          </div>
        ) : !canAfford ? (
          <Button asChild variant="secondary" className="w-full h-10 rounded-xl font-bold">
            <Link href="/pricing">
              Top Up Credits ({session.creditCost} Required)
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isPending || isSelectedRoleFull || session.isCancelled}
            onClick={attemptBook}
            className="w-full font-bold shadow-xs transition-colors h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Securing Spot...
              </>
            ) : isSelectedRoleFull ? (
              `${selectedRole} Spots Full`
            ) : (
              `Book as ${selectedRole}`
            )}
          </Button>
        )}
      </CardFooter>

      {/* Beginner Safety Modals */}
      <DigitalEtiquetteModal
        isOpen={showEtiquetteModal}
        onClose={() => setShowEtiquetteModal(false)}
        onAgree={handleBook}
      />
      <PostClassCheckinModal
        classSessionId={session.id}
        classTitle={session.title}
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
      />
    </Card>
  );
}
