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
import { LEVEL_WEIGHT } from "@/lib/constants/booking";
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
import { toast } from "sonner";
import { AddToCalendarButton } from "@/components/calendar/add-to-calendar-button";
import {
  DigitalEtiquetteModal,
  ETIQUETTE_STORAGE_KEY,
} from "@/components/beginners/digital-etiquette-modal";
import { PostClassCheckinModal } from "@/components/beginners/post-class-checkin-modal";
import { DOOR_PRICING } from "@/lib/academy-data";

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

  const isLevelUnlocked = isGuest
    ? true // Allow guests to view and evaluate all levels
    : LEVEL_WEIGHT[student.currentLevel] >= LEVEL_WEIGHT[session.minLevel];


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

      toast.success("You're in! See you on the floor!", {
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
            className="border-border bg-muted/50 text-muted-foreground font-medium text-xs"
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
              Pay at the door \u00B7 \u00A3{DOOR_PRICING.oneClassPounds} / \u00A3{DOOR_PRICING.twoClassesPounds}
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
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/85">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>No Partner Needed • Rotations</span>
            </div>
          </div>
        </div>

        {/* Who's coming: information for the teachers, never a limit (everyone can come in) */}
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {optimisticState.bookedCount} coming
            </span>
            {!isSoloClass && (
              <span className="text-muted-foreground">
                {optimisticState.leadsCount} leads · {optimisticState.followsCount} follows
              </span>
            )}
          </p>

          {/* Partner Role Selector */}
          {!isSoloClass && !optimisticState.isBooked && isLevelUnlocked && (
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                type="button"
                disabled={isPending}
                aria-pressed={selectedRole === DanceRole.LEAD}
                onClick={() => setSelectedRole(DanceRole.LEAD)}
                className={`flex items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all min-h-[40px] ${
                  selectedRole === DanceRole.LEAD
                    ? "border-sky-500/45 bg-sky-500/12 text-sky-100 shadow-xs ring-1 ring-sky-500/20"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedRole === DanceRole.LEAD
                        ? "bg-sky-400"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  Lead
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                aria-pressed={selectedRole === DanceRole.FOLLOW}
                onClick={() => setSelectedRole(DanceRole.FOLLOW)}
                className={`flex items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all min-h-[40px] ${
                  selectedRole === DanceRole.FOLLOW
                    ? "border-rose-400/45 bg-rose-500/12 text-rose-100 shadow-xs ring-1 ring-rose-400/20"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5 font-extrabold tracking-wide">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedRole === DanceRole.FOLLOW
                        ? "bg-rose-400"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  Follow
                </span>
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
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
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
                variant="outline"
                className="w-full border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
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
                  Cancel spot
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
            {/* Guests need nothing to come in: no booking, pay at the door. Signing in only adds "I'm coming". */}
            <p className="text-sm font-semibold">
              Just come along and pay at the door. No booking needed.
            </p>
            <Button asChild variant="outline" size="sm" className="min-h-[40px] w-full text-xs font-semibold">
              <Link href={`/sign-in?redirect_url=${encodeURIComponent("/dashboard/schedule")}`}>
                Sign in to tell the teachers you&apos;re coming
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled={isPending || session.isCancelled}
            onClick={attemptBook}
            className="w-full font-bold shadow-xs transition-colors h-10 rounded-xl bg-brand hover:bg-brand-hover text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Securing Spot...
              </>
            ) : isSoloClass ? (
              "I'm coming"
            ) : (
              `I'm coming as ${selectedRole === DanceRole.FOLLOW ? "Follow" : "Lead"}`
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
