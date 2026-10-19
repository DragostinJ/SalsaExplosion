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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TeacherAvatar } from "@/components/ui/teacher-avatar";
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
}

interface ClassScheduleCardProps {
  session: ClassScheduleItem;
  student: StudentContext;
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
// UI DISPLAY MAPS
// ==========================================

const STYLE_BADGE_CONFIG: Record<
  DanceStyle,
  { label: string; className: string }
> = {
  CUBAN_SALSA: {
    label: "Cuban Salsa",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
};

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

  const [selectedRole, setSelectedRole] = React.useState<DanceRole>(
    session.userBooking?.danceRole ??
      (isSoloClass ? DanceRole.SOLO : student.preferredRole)
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

  const isLevelUnlocked =
    LEVEL_WEIGHT[student.currentLevel] >= LEVEL_WEIGHT[session.minLevel];

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

  const canAfford =
    student.hasActiveSubscription ||
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
        setFeedback({
          type: "error",
          message: result.error.message,
        });
        return;
      }

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
        setFeedback({
          type: "error",
          message: result.error.message,
        });
        return;
      }

      setFeedback({
        type: result.data.isLateCancellation ? "warning" : "success",
        message: result.message,
      });
      router.refresh();
    });
  };

  const styleConfig = STYLE_BADGE_CONFIG[session.style];

  return (
    <Card
      className={`flex flex-col justify-between transition-all ${
        optimisticState.isBooked
          ? "border-emerald-500/50 bg-emerald-500/[0.02] ring-1 ring-emerald-500/30"
          : ""
      } ${!isLevelUnlocked ? "opacity-90" : ""}`}
    >
      <CardHeader className="space-y-3 pb-4">
        {/* Top Badges: Style, Level, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={styleConfig.className}>
              {styleConfig.label}
            </Badge>
            <Badge
              variant="secondary"
              className={
                session.minLevel === DanceLevel.BEGINNER
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold"
                  : "font-semibold"
              }
            >
              {session.minLevel === DanceLevel.BEGINNER
                ? "Level 0: Absolute Beginner"
                : session.minLevel}
            </Badge>
            {session.minLevel === DanceLevel.BEGINNER && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                Zero Experience Needed
              </Badge>
            )}
          </div>

          {optimisticState.isBooked ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Booked ({optimisticState.bookedRole})
            </Badge>
          ) : !isLevelUnlocked ? (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
              <Lock className="mr-1 h-3 w-3" />
              Level Locked
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {student.hasActiveSubscription
                ? "Included in Membership"
                : `${session.creditCost} ${
                    session.creditCost === 1 ? "Credit" : "Credits"
                  }`}
            </Badge>
          )}
        </div>

        {/* Title & Instructor with Avatar */}
        <div className="flex items-start gap-3">
          <TeacherAvatar
            name={`${session.instructor.firstName} ${session.instructor.lastName}`}
            avatarUrl={session.instructor.avatarUrl}
            size="md"
            className="mt-0.5"
          />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg leading-snug font-bold">
              {session.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1 font-medium text-muted-foreground flex items-center gap-1">
              <span>Maestro {session.instructor.firstName} {session.instructor.lastName}</span>
            </CardDescription>
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                <Users className="h-3 w-3" />
                No Partner Needed • Circular Rotation
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4 text-sm">
        {/* Time & Studio Room Metadata */}
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {startDate.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
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
          <div className="col-span-2 flex items-center gap-2 pt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{session.room}</span>
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

          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-300 ${
                spotsRemaining === 0 ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (optimisticState.bookedCount / session.maxCapacity) * 100
                  )
                )}%`,
              }}
            />
          </div>

          {/* Partner Role Selector */}
          {!isSoloClass && !optimisticState.isBooked && isLevelUnlocked && (
            <div className="pt-2">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Select Dance Role:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isPending || isLeadFull}
                  onClick={() => setSelectedRole(DanceRole.LEAD)}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium transition-all ${
                    selectedRole === DanceRole.LEAD
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-background hover:bg-accent"
                  } ${isLeadFull ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span>Lead</span>
                  {session.maxLeads !== null && (
                    <span className="text-[11px] text-muted-foreground">
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
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium transition-all ${
                    selectedRole === DanceRole.FOLLOW
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-background hover:bg-accent"
                  } ${isFollowFull ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span>Follow</span>
                  {session.maxFollows !== null && (
                    <span className="text-[11px] text-muted-foreground">
                      {isFollowFull
                        ? "Full"
                        : `${
                            session.maxFollows - optimisticState.followsCount
                          } left`}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inline Action Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-md border p-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : feedback.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
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
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              Submit {session.minLevel} Video to Unlock
            </Link>
          </Button>
        ) : optimisticState.isBooked ? (
          session.userBooking?.status === BookingStatus.ATTENDED ? (
            <div className="w-full space-y-2">
              <Button
                asChild
                variant="secondary"
                className="w-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
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
                className="w-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/20"
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
                    <QrCode className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
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
                  !student.hasActiveSubscription
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
        ) : !canAfford ? (
          <Button asChild variant="secondary" className="w-full">
            <Link href="/pricing">
              Top Up Credits ({session.creditCost} Required)
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isPending || isSelectedRoleFull || session.isCancelled}
            onClick={attemptBook}
            className="w-full"
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
