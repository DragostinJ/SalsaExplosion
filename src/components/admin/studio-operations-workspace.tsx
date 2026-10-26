"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ShoppingBag,
  Users,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  updatePrivateLessonBookingStatusAction,
  updateMerchReservationStatusAction,
  updatePartnerWaitlistStatusAction,
  replyAnonymousQuestionAction,
  autoPairWaitlistDancersAction,
} from "@/actions/management.actions";
import { toast } from "sonner";
import type {
  PrivateBookingItem,
  MerchItem,
  WaitlistItem,
  SentimentItem,
  QuestionItem,
} from "./operations/types";
import { CoachingRequestsTab } from "./operations/coaching-requests-tab";
import { MerchFulfillmentTab } from "./operations/merch-fulfillment-tab";
import { PartnerWaitlistTab } from "./operations/partner-waitlist-tab";
import { SentimentFeedbackTab } from "./operations/sentiment-feedback-tab";

export type {
  PrivateBookingItem,
  MerchItem,
  WaitlistItem,
  SentimentItem,
  QuestionItem,
};

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

  const handleAutoPairWaitlist = () => {
    startTransition(async () => {
      const res = await autoPairWaitlistDancersAction();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to auto-pair dancers.");
      }
    });
  };

  // Counts & Revenue for tabs & summary strip
  const pendingCoachingCount = privateBookings.filter((b) => b.status === "PENDING").length;
  const pendingCoachingRevenue = privateBookings
    .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalPricePounds || 0), 0);

  const pendingMerchCount = merchReservations.filter((m) => m.status === "RESERVED").length;
  const pendingMerchRevenue = merchReservations
    .filter((m) => m.status === "RESERVED")
    .reduce((sum, m) => sum + (m.pricePounds || 0), 0);

  const waitingWaitlistCount = waitlistEntries.filter((w) => w.status === "WAITING").length;
  const waitingLeadsCount = waitlistEntries.filter(
    (w) => w.status === "WAITING" && w.role === "LEAD"
  ).length;
  const waitingFollowsCount = waitlistEntries.filter(
    (w) => w.status === "WAITING" && w.role === "FOLLOW"
  ).length;

  const unansweredQCount = anonymousQuestions.filter((q) => q.status !== "ANSWERED").length;

  return (
    <div className="space-y-6">
      {/* Tonight's Desk & Revenue Summary Strip */}
      <div
        data-testid="tonights-desk-summary-strip"
        className="grid gap-3 sm:grid-cols-3"
      >
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Pending Coaching Revenue
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {pendingCoachingCount} Pending
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h4 className="text-2xl font-black text-foreground">
              £{pendingCoachingRevenue}.00
            </h4>
            <span className="text-xs text-muted-foreground font-medium">
              Due Cash/Card
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Merch Collection Due
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {pendingMerchCount} Reserved
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h4 className="text-2xl font-black text-foreground">
              £{pendingMerchRevenue}.00
            </h4>
            <span className="text-xs text-muted-foreground font-medium">
              Awaiting Desk Pickup
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Partner Waitlist Queue
            </span>
            <Badge className="bg-amber-500 text-stone-950 text-[10px] font-bold">
              {waitingWaitlistCount} Waiting
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h4 className="text-lg font-black text-foreground">
              {waitingLeadsCount} Leads / {waitingFollowsCount} Follows
            </h4>
            <span className="text-xs text-emerald-400 font-semibold">
              {Math.min(waitingLeadsCount, waitingFollowsCount)} Couple(s) Pairable
            </span>
          </div>
        </Card>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("coaching")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "coaching"
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-stone-400 hover:bg-surface-2 hover:text-ivory"
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
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-stone-400 hover:bg-surface-2 hover:text-ivory"
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
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-stone-400 hover:bg-surface-2 hover:text-ivory"
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
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-stone-400 hover:bg-surface-2 hover:text-ivory"
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
        <CoachingRequestsTab
          privateBookings={privateBookings}
          pendingCoachingCount={pendingCoachingCount}
          isPending={isPending}
          onUpdateBooking={handleUpdateBooking}
        />
      )}

      {/* Tab 2: Merch Click & Collect */}
      {activeTab === "merch" && (
        <MerchFulfillmentTab
          merchReservations={merchReservations}
          pendingMerchCount={pendingMerchCount}
          isPending={isPending}
          onUpdateMerch={handleUpdateMerch}
        />
      )}

      {/* Tab 3: Partner Waitlist */}
      {activeTab === "waitlist" && (
        <PartnerWaitlistTab
          waitlistEntries={waitlistEntries}
          waitingWaitlistCount={waitingWaitlistCount}
          waitingLeadsCount={waitingLeadsCount}
          waitingFollowsCount={waitingFollowsCount}
          isPending={isPending}
          onAutoPairWaitlist={handleAutoPairWaitlist}
          onUpdateWaitlist={handleUpdateWaitlist}
        />
      )}

      {/* Tab 4: Beginner Sentiment & Anonymous Q&A */}
      {activeTab === "qa" && (
        <SentimentFeedbackTab
          sentimentFeedbacks={sentimentFeedbacks}
          anonymousQuestions={anonymousQuestions}
          unansweredQCount={unansweredQCount}
          replyTexts={replyTexts}
          isPending={isPending}
          onReplyTextChange={(id, text) =>
            setReplyTexts((prev) => ({ ...prev, [id]: text }))
          }
          onReplyQuestion={handleReplyQuestion}
        />
      )}
    </div>
  );
}
