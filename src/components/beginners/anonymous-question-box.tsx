"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Send,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { submitAnonymousQuestionAction } from "@/actions/beginner.actions";

type QuestionCategory =
  | "FOOTWEAR"
  | "RHYTHM"
  | "PARTNER_ANXIETY"
  | "VENUE_ARRIVING"
  | "GENERAL";

const COMMON_QUESTIONS = [
  {
    category: "RHYTHM" as QuestionCategory,
    question: "What if I have two left feet and can't find the beat?",
    answer:
      "Maestro Enrique: Nobody is born with Cuban rhythm! In Level 0, we count out loud ('1-2-3, 5-6-7') and tap feet in a simple march. In 20 minutes, your body syncs naturally.",
  },
  {
    category: "PARTNER_ANXIETY" as QuestionCategory,
    question: "Do I have to bring a partner, or will I be the only single one?",
    answer:
      "Sofia (Floor Ambassador): Over 75% of dancers arrive solo! We rotate in a circle every 60 seconds, so everyone dances with everyone with zero awkwardness.",
  },
  {
    category: "FOOTWEAR" as QuestionCategory,
    question: "I don't have dance shoes yet. What should I wear on day 1?",
    answer:
      "David (Rhythm Guide): Any smooth-soled shoes, flat canvas sneakers (like Toms/Converse), or leather loafers work great. Just avoid heavy running trainers that stick to the floor.",
  },
];

export function AnonymousQuestionBox() {
  const [selectedCategory, setSelectedCategory] =
    useState<QuestionCategory>("GENERAL");
  const [questionText, setQuestionText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [reassurance, setReassurance] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim().length < 5) {
      setErrorMessage("Please type at least 5 characters for your question.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await submitAnonymousQuestionAction({
        category: selectedCategory,
        question: questionText,
        email: emailText || undefined,
      });

      if (res.success && res.data) {
        toast.success("Question received safely!", {
          description: "Our instructors and ambassadors are here to support your dance journey.",
        });
        setReassurance(res.data.reassurance);
        setQuestionText("");
        setEmailText("");
      } else {
        const errorText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Unable to submit question.";
        toast.error(errorText);
        setErrorMessage(errorText);
      }
    });
  };

  return (
    <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/[0.04] via-background to-amber-500/[0.03] shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-600 text-white font-bold text-[10px]">
            <Lock className="mr-1 h-3 w-3" />
            100% Anonymous
          </Badge>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
            Zero Judgment Ask Box
          </span>
        </div>
        <CardTitle className="text-base sm:text-lg font-bold">
          Nervous About Your First Class? Ask Anything
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Wondering about sweat, two left feet, dress code, or entering the studio? Ask our teaching team below. No account name or identity is attached.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 text-xs">
        {/* Instant Common Answers Accordion */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Most Common First-Timer Fears:
          </span>
          <div className="grid gap-2 sm:grid-cols-3">
            {COMMON_QUESTIONS.map((cq) => (
              <div
                key={cq.question}
                className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 flex flex-col justify-between"
              >
                <p className="font-bold text-foreground text-[11px] leading-snug">
                  &ldquo;{cq.question}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {cq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Custom Question Form */}
        {reassurance ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] p-4 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Question Received & Reassurance from Maestro Enrique:</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed pl-6">
              &ldquo;{reassurance}&rdquo;
            </p>
            <div className="pt-2 pl-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReassurance(null)}
                className="text-xs h-7"
              >
                Ask Another Question
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border/80 bg-background/50 p-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground block">
                Select Question Category:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "RHYTHM", label: "🎵 Rhythm & Steps" },
                  { id: "FOOTWEAR", label: "👟 Shoes & Clothes" },
                  { id: "PARTNER_ANXIETY", label: "🤝 Coming Alone" },
                  { id: "VENUE_ARRIVING", label: "📍 Arriving & Parking" },
                  { id: "GENERAL", label: "💬 General Question" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as QuestionCategory)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="anon-question-input" className="text-[11px] font-bold text-foreground block">
                Your Anonymous Question:
              </label>
              <textarea
                id="anon-question-input"
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Is it ok if I can only stay for the first hour of class? What should I do if I feel dizzy?"
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
              <input
                type="email"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Optional email if you want a direct personal reply"
                className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground w-full sm:max-w-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              />

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 shrink-0 shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Ask Anonymously
                  </>
                )}
              </Button>
            </div>

            {errorMessage && (
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
