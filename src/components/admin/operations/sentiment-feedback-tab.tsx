"use client";

import { Loader2, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { QuestionItem, SentimentItem } from "./types";

interface SentimentFeedbackTabProps {
  sentimentFeedbacks: SentimentItem[];
  anonymousQuestions: QuestionItem[];
  unansweredQCount: number;
  replyTexts: Record<string, string>;
  isPending: boolean;
  onReplyTextChange: (questionId: string, text: string) => void;
  onReplyQuestion: (questionId: string) => void;
}

export function SentimentFeedbackTab({
  sentimentFeedbacks,
  anonymousQuestions,
  unansweredQCount,
  replyTexts,
  isPending,
  onReplyTextChange,
  onReplyQuestion,
}: SentimentFeedbackTabProps) {
  return (
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
                        ? "bg-emerald-500/10 text-emerald-400"
                        : fb.sentiment === "A_BIT_OVERWHELMED"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-sky-500/10 text-sky-400"
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
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
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
                      onChange={(e) => onReplyTextChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-accent-tangerine"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={isPending || !replyTexts[q.id]?.trim()}
                        onClick={() => onReplyQuestion(q.id)}
                        className="bg-brand hover:bg-brand-hover text-white text-xs font-bold h-8"
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
  );
}
