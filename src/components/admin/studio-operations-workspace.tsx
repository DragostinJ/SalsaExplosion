"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ShoppingBag,
  Users,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updatePrivateLessonBookingStatusAction,
  updateMerchReservationStatusAction,
  updatePartnerWaitlistStatusAction,
  replyAnonymousQuestionAction,
} from "@/actions/management.actions";
import { toast } from "sonner";

interface PrivateBookingItem {
  id: string;
  instructorName: string;
  focusTopic: string;
  packageType: string;
  preferredSlot: string;
  totalPricePounds: number;
  status: string;
  createdAt: Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface MerchItem {
  id: string;
  itemId: string;
  itemName: string;
  size: string | null;
  pricePounds: number;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface WaitlistItem {
  id: string;
  role: string;
  status: string;
  partnerEmail: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SentimentItem {
  id: string;
  sentiment: string;
  notes: string | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
  classSession: {
    title: string;
  };
}

interface QuestionItem {
  id: string;
  category: string;
  question: string;
  email: string | null;
  status: string;
  response: string | null;
  createdAt: Date;
}

interface StudioOperationsWorkspaceProps {
  initialTab?: string;
  privateBookings: PrivateBookingItem[];
  merchReservations: MerchItem[];
  waitlistEntries: WaitlistItem[];
  sentimentFeedbacks: SentimentItem[];
  anonymousQuestions: QuestionItem[];
}

export function StudioOperationsWorkspace({
  initialTab = "coaching",
  privateBookings,
  merchReservations,
  waitlistEntries,
  sentimentFeedbacks,
  anonymousQuestions,
}: StudioOperationsWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isPending, startTransition] = useTransition();
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const handleUpdateBooking = (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    startTransition(async () => {
      const res = await updatePrivateLessonBookingStatusAction({ bookingId, status });
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to update booking.");
      }
    });
  };

  const handleUpdateMerch = (reservationId: string, status: "COLLECTED" | "CANCELLED") => {
    startTransition(async () => {
      const res = await updateMerchReservationStatusAction({ reservationId, status });
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to update reservation.");
      }
    });
  };

  const handleUpdateWaitlist = (waitlistId: string, status: "PAIRED" | "CANCELLED") => {
    startTransition(async () => {
      const res = await updatePartnerWaitlistStatusAction({ waitlistId, status });
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to update waitlist.");
      }
    });
  };

  const handleReplyQuestion = (questionId: string) => {
    const text = replyTexts[questionId]?.trim();
    if (!text) {
      toast.error("Please enter a response before submitting.");
      return;
    }

    startTransition(async () => {
      const res = await replyAnonymousQuestionAction({ questionId, response: text });
      if (res.success) {
        toast.success(res.message);
        setReplyTexts((prev) => ({ ...prev, [questionId]: "" }));
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to submit response.");
      }
    });
  };

  // Counts for tabs
  const pendingCoachingCount = privateBookings.filter((b) => b.status === "PENDING").length;
  const pendingMerchCount = merchReservations.filter((m) => m.status === "RESERVED").length;
  const waitingWaitlistCount = waitlistEntries.filter((w) => w.status === "WAITING").length;
  const unansweredQCount = anonymousQuestions.filter((q) => q.status !== "ANSWERED").length;

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("coaching")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "coaching"
              ? "bg-accent-tangerine text-zinc-950 shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Private Coaching</span>
          {pendingCoachingCount > 0 && (
            <Badge className="bg-rose-600 text-white text-[10px] h-4 px-1.5 font-bold">
              {pendingCoachingCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("merch")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "merch"
              ? "bg-accent-tangerine text-zinc-950 shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Click & Collect Merch</span>
          {pendingMerchCount > 0 && (
            <Badge className="bg-rose-600 text-white text-[10px] h-4 px-1.5 font-bold">
              {pendingMerchCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("waitlist")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "waitlist"
              ? "bg-accent-tangerine text-zinc-950 shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Partner Waitlist</span>
          {waitingWaitlistCount > 0 && (
            <Badge className="bg-amber-600 text-white text-[10px] h-4 px-1.5 font-bold">
              {waitingWaitlistCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "qa"
              ? "bg-accent-tangerine text-zinc-950 shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Beginner Sentiment & Q&A</span>
          {unansweredQCount > 0 && (
            <Badge className="bg-blue-600 text-white text-[10px] h-4 px-1.5 font-bold">
              {unansweredQCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab 1: Private Coaching */}
      {activeTab === "coaching" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Private Lesson & Coaching Queue ({privateBookings.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              {pendingCoachingCount} pending confirmation
            </span>
          </div>

          {privateBookings.length === 0 ? (
            <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
              <CalendarPlus className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">No 1-on-1 private lesson requests received yet.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {privateBookings.map((b) => {
                const isPendingStatus = b.status === "PENDING";
                const isConfirmed = b.status === "CONFIRMED";
                return (
                  <Card key={b.id} className="rounded-2xl border shadow-xs overflow-hidden">
                    <CardHeader className="p-4 pb-2 bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {b.student.firstName} {b.student.lastName}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">{b.student.email}</p>
                        </div>
                        <Badge
                          className={`text-[10px] font-bold ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : b.status === "COMPLETED"
                              ? "bg-muted text-muted-foreground"
                              : b.status === "CANCELLED"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {b.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 space-y-3 text-xs">
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Instructor:</span>
                          <span className="font-semibold text-foreground">{b.instructorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Focus Topic:</span>
                          <span className="font-semibold text-foreground">{b.focusTopic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Package:</span>
                          <span className="font-semibold text-foreground">
                            {b.packageType === "BLOCK_5HR" ? "5-Hour Intensive" : "1-Hour Focus"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Time:</span>
                          <span className="font-semibold text-foreground">{b.preferredSlot}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span>Price:</span>
                          <span className="font-bold text-foreground">£{b.totalPricePounds}.00</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        {isPendingStatus && (
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleUpdateBooking(b.id, "CONFIRMED")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Confirm
                          </Button>
                        )}
                        {isConfirmed && (
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleUpdateBooking(b.id, "COMPLETED")}
                            className="flex-1 bg-primary-base hover:bg-primary-base/90 text-white text-[11px] h-8 font-bold"
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Completed
                          </Button>
                        )}
                        {(isPendingStatus || isConfirmed) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleUpdateBooking(b.id, "CANCELLED")}
                            className="text-rose-600 hover:text-rose-700 border-rose-300 dark:border-rose-800 text-[11px] h-8 px-2 font-bold"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Merch Click & Collect */}
      {activeTab === "merch" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Merch Desk Pickup Reservations ({merchReservations.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              {pendingMerchCount} awaiting studio desk collection
            </span>
          </div>

          {merchReservations.length === 0 ? (
            <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">No merchandise click-and-collect reservations yet.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {merchReservations.map((m) => {
                const isReserved = m.status === "RESERVED";
                return (
                  <Card key={m.id} className="rounded-2xl border shadow-xs overflow-hidden">
                    <CardHeader className="p-4 pb-2 bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {m.itemName}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">
                            {m.user.firstName} {m.user.lastName} ({m.user.email})
                          </p>
                        </div>
                        <Badge
                          className={`text-[10px] font-bold ${
                            m.status === "COLLECTED"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : m.status === "CANCELLED"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {m.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 space-y-3 text-xs">
                      <div className="space-y-1 text-muted-foreground">
                        {m.size && (
                          <div className="flex justify-between">
                            <span>Selected Size:</span>
                            <span className="font-semibold text-foreground uppercase">{m.size}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Due at Studio Desk:</span>
                          <span className="font-bold text-foreground">£{m.pricePounds}.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reserved On:</span>
                          <span className="font-medium text-foreground">
                            {new Date(m.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      </div>

                      {isReserved && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleUpdateMerch(m.id, "COLLECTED")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Mark Collected & Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleUpdateMerch(m.id, "CANCELLED")}
                            className="text-rose-600 hover:text-rose-700 border-rose-300 dark:border-rose-800 text-[11px] h-8 px-2 font-bold"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Partner Waitlist */}
      {activeTab === "waitlist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Partner Waitlist Queue ({waitlistEntries.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              {waitingWaitlistCount} dancers waiting for role balance pairing
            </span>
          </div>

          {waitlistEntries.length === 0 ? (
            <Card className="rounded-2xl border-dashed py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">No dancers currently on the partner waitlist.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {waitlistEntries.map((w) => {
                const isWaiting = w.status === "WAITING";
                return (
                  <Card key={w.id} className="rounded-2xl border shadow-xs overflow-hidden">
                    <CardHeader className="p-4 pb-2 bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {w.user.firstName} {w.user.lastName}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">{w.user.email}</p>
                        </div>
                        <Badge
                          className={`text-[10px] font-bold ${
                            w.status === "PAIRED"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : w.status === "CANCELLED"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {w.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 space-y-3 text-xs">
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Registered Role:</span>
                          <span className="font-bold text-foreground">{w.role}</span>
                        </div>
                        {w.partnerEmail && (
                          <div className="flex justify-between">
                            <span>Preferred Partner:</span>
                            <span className="font-medium text-foreground">{w.partnerEmail}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Joined Queue:</span>
                          <span className="font-medium text-foreground">
                            {new Date(w.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      </div>

                      {isWaiting && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleUpdateWaitlist(w.id, "PAIRED")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 font-bold"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Confirm Paired
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleUpdateWaitlist(w.id, "CANCELLED")}
                            className="text-rose-600 hover:text-rose-700 border-rose-300 dark:border-rose-800 text-[11px] h-8 px-2 font-bold"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Beginner Sentiment & Anonymous Q&A */}
      {activeTab === "qa" && (
        <div className="space-y-6">
          {/* Sentiment Metrics */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">
              Post-Class Student Sentiment & Feedback
            </h3>
            {sentimentFeedbacks.length === 0 ? (
              <Card className="rounded-2xl border-dashed py-8 text-center text-muted-foreground">
                <p className="text-xs">No post-class sentiment surveys submitted yet.</p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sentimentFeedbacks.map((fb) => (
                  <Card key={fb.id} className="rounded-2xl border shadow-xs p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {fb.user.firstName} {fb.user.lastName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">{fb.classSession.title}</p>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold ${
                          fb.sentiment === "LOVED_IT"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : fb.sentiment === "A_BIT_OVERWHELMED"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                        }`}
                      >
                        {fb.sentiment.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {fb.notes && (
                      <p className="text-xs text-muted-foreground italic bg-muted/40 rounded-xl p-2.5">
                        &ldquo;{fb.notes}&rdquo;
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground block text-right">
                      {new Date(fb.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Questions & Instructor Answers */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">
                Anonymous Beginner Questions ({anonymousQuestions.length})
              </h3>
              <span className="text-xs text-muted-foreground">
                {unansweredQCount} awaiting instructor reply
              </span>
            </div>

            {anonymousQuestions.length === 0 ? (
              <Card className="rounded-2xl border-dashed py-8 text-center text-muted-foreground">
                <p className="text-xs">No beginner questions submitted yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {anonymousQuestions.map((q) => {
                  const isAnswered = q.status === "ANSWERED";
                  return (
                    <Card key={q.id} className="rounded-2xl border shadow-xs p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {q.category}
                            </Badge>
                            {q.email && (
                              <span className="text-[11px] text-muted-foreground">
                                (Contact: {q.email})
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">{q.question}</p>
                        </div>
                        <Badge
                          className={`text-[10px] font-bold shrink-0 ${
                            isAnswered
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {q.status}
                        </Badge>
                      </div>

                      {/* Existing Response */}
                      {q.response && (
                        <div className="rounded-xl bg-accent-tangerine/[0.07] border border-accent-tangerine/30 p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-accent-tangerine font-bold text-xs">
                            <Sparkles className="h-3.5 w-3.5" />
                            Instructor Answer:
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{q.response}</p>
                        </div>
                      )}

                      {/* Reply Input Box */}
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          placeholder="Type instructor answer for the beginner FAQ..."
                          value={replyTexts[q.id] ?? ""}
                          onChange={(e) =>
                            setReplyTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-accent-tangerine"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            disabled={isPending || !replyTexts[q.id]?.trim()}
                            onClick={() => handleReplyQuestion(q.id)}
                            className="bg-accent-tangerine hover:bg-accent-tangerine/90 text-zinc-950 text-xs font-bold h-8"
                          >
                            {isPending ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Publish Answer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
