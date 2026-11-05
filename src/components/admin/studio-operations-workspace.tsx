"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  updatePrivateLessonBookingStatusAction,
  replyAnonymousQuestionAction,
} from "@/actions/management.actions";
import { toast } from "sonner";
import type {
  PrivateBookingItem,
  SentimentItem,
  QuestionItem,
} from "./operations/types";
import { CoachingRequestsTab } from "./operations/coaching-requests-tab";
import { SentimentFeedbackTab } from "./operations/sentiment-feedback-tab";

export type {
  PrivateBookingItem,
  SentimentItem,
  QuestionItem,
};

interface StudioOperationsWorkspaceProps {
  initialTab?: string;
  privateBookings: PrivateBookingItem[];
  sentimentFeedbacks: SentimentItem[];
  anonymousQuestions: QuestionItem[];
}

export function StudioOperationsWorkspace({
  initialTab = "coaching",
  privateBookings,
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

  // Counts & Revenue for tabs & summary strip
  const pendingCoachingCount = privateBookings.filter((b) => b.status === "PENDING").length;
  const pendingCoachingRevenue = privateBookings
    .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalPricePounds || 0), 0);

  const unansweredQCount = anonymousQuestions.filter((q) => q.status !== "ANSWERED").length;

  return (
    <div className="space-y-6">
      {/* Tonight's Desk & Revenue Summary Strip */}
      <div
        data-testid="tonights-desk-summary-strip"
        className="grid gap-3 sm:max-w-md"
      >
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
              Pending Coaching Revenue
            </span>
            <Badge variant="outline" className="text-xs font-mono">
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
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("coaching")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "coaching"
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-ivory-muted hover:bg-surface-2 hover:text-ivory"
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Private Coaching</span>
          {pendingCoachingCount > 0 && (
            <Badge className="bg-rose-600 text-white text-xs h-4 px-1.5 font-bold">
              {pendingCoachingCount}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "qa"
              ? "bg-surface-3 text-ivory ring-1 ring-gold/40 shadow-xs font-bold"
              : "bg-surface-1 text-ivory-muted hover:bg-surface-2 hover:text-ivory"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Beginner Sentiment & Q&A</span>
          {unansweredQCount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs h-4 px-1.5 font-bold">
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

      {/* Tab 2: Beginner Sentiment & Anonymous Q&A */}
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
