"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  User as UserIcon,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DanceLevel, DanceStyle, SubmissionStatus } from "@prisma/client";
import { gradeSubmissionAction } from "@/actions/grading.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==========================================
// TYPES & PROPS
// ==========================================

export interface QueueSubmissionItem {
  id: string;
  style: DanceStyle;
  currentLevel: DanceLevel;
  targetLevel: DanceLevel;
  signedVideoUrl: string; // Generated server-side via Supabase createSignedUrl
  studentNotes: string | null;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface VideoGradingWorkspaceProps {
  initialSubmissions: QueueSubmissionItem[];
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25] as const;

const RUBRIC_QUICK_TAGS = [
  "Watch on-beat timing (counts 1 & 5)",
  "Keep tension in the frame during turns",
  "Complete weight transfer before stepping",
  "Clean Enchufla & Dile Que No execution",
  "Strong Cuban motion & ribcage isolation",
  "Maintain grounding through the basic step",
] as const;

const STYLE_LABELS: Record<DanceStyle, string> = {
  CUBAN_SALSA: "Cuban Salsa",
};

// ==========================================
// COMPONENT
// ==========================================

export function VideoGradingWorkspace({
  initialSubmissions,
}: VideoGradingWorkspaceProps) {
  const [submissions, setSubmissions] =
    React.useState<QueueSubmissionItem[]>(initialSubmissions);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSubmissions[0]?.id ?? null
  );
  const [feedback, setFeedback] = React.useState<string>("");
  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [statusBanner, setStatusBanner] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const activeSubmission = React.useMemo(
    () => submissions.find((s) => s.id === selectedId) ?? null,
    [submissions, selectedId]
  );

  // Sync playback rate when video or speed state changes
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, selectedId]);

  const handleSelectSubmission = (id: string) => {
    setSelectedId(id);
    setFeedback("");
    setStatusBanner(null);
    setPlaybackRate(1);
  };

  const handleAppendRubric = (snippet: string) => {
    setFeedback((prev) => {
      const trimmed = prev.trim();
      return trimmed.length === 0 ? `• ${snippet}` : `${trimmed}\n• ${snippet}`;
    });
  };

  const handleReplayLast5Seconds = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    void videoRef.current.play();
  };

  const handleGrade = (decision: "APPROVED" | "REJECTED") => {
    if (!activeSubmission) return;
    setStatusBanner(null);

    startTransition(async () => {
      const response = await gradeSubmissionAction({
        submissionId: activeSubmission.id,
        decision:
          decision === "APPROVED"
            ? SubmissionStatus.APPROVED
            : SubmissionStatus.REJECTED,
        feedback,
      });

      if (!response.success) {
        setStatusBanner({
          type: "error",
          text: response.error.message,
        });
        return;
      }

      // Remove graded item from local queue and auto-advance to next student
      const remaining = submissions.filter((s) => s.id !== activeSubmission.id);
      setSubmissions(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setFeedback("");
      setStatusBanner({
        type: "success",
        text: response.message,
      });
    });
  };

  if (submissions.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20 py-16 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">All Caught Up!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            There are no pending student level-up videos in the queue right now.
          </p>
          {statusBanner?.type === "success" && (
            <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {statusBanner.text}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {statusBanner && (
        <div
          role="alert"
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
            statusBanner.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {statusBanner.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: PENDING QUEUE LIST (4 COLS) */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Queue ({submissions.length})
            </h2>
          </div>

          <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
            {submissions.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSubmission(item.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {item.student.firstName[0]}
                        {item.student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">
                          {item.student.firstName} {item.student.lastName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {STYLE_LABELS[item.style]}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {item.currentLevel} → {item.targetLevel}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Submitted{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: VIDEO PLAYER & GRADING FORM (8 COLS) */}
        {activeSubmission && (
          <div className="space-y-6 lg:col-span-8">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/90">
                        {STYLE_LABELS[activeSubmission.style]}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <span>{activeSubmission.currentLevel}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {activeSubmission.targetLevel}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="mt-2 flex items-center gap-2 text-xl">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      {activeSubmission.student.firstName}{" "}
                      {activeSubmission.student.lastName}
                    </CardTitle>
                    <CardDescription>
                      {activeSubmission.student.email}
                    </CardDescription>
                  </div>

                  {/* Playback Speed & Instant Rewind Controls */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReplayLast5Seconds}
                      title="Rewind 5 seconds to re-watch footwork"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      -5s
                    </Button>
                    <div className="flex items-center rounded-md border bg-background p-0.5">
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setPlaybackRate(speed)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            playbackRate === speed
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* HTML5 Supabase Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <video
                  ref={videoRef}
                  key={activeSubmission.signedVideoUrl}
                  src={activeSubmission.signedVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>

              <CardContent className="space-y-5 pt-6">
                {/* Student Notes */}
                {activeSubmission.studentNotes && (
                  <div className="rounded-lg border bg-muted/40 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Student Note
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      {activeSubmission.studentNotes}
                    </p>
                  </div>
                )}

                {/* Quick Rubric Chips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Quick Technique Snippets (Click to insert)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RUBRIC_QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAppendRubric(tag)}
                        className="rounded-full border bg-secondary/40 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructor Feedback Textarea */}
                <div className="space-y-2">
                  <label
                    htmlFor="instructor-feedback"
                    className="text-sm font-medium leading-none"
                  >
                    Instructor Feedback{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Required for rejections, minimum 15 characters)
                    </span>
                  </label>
                  <Textarea
                    id="instructor-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isPending}
                    rows={4}
                    placeholder={`Write specific feedback on ${activeSubmission.student.firstName}'s timing, posture, frame, and musicality...`}
                    className="resize-y"
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">
                    {feedback.trim().length} / 2000 characters
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => handleGrade("REJECTED")}
                  className="w-full sm:w-auto"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Request Retry (Reject)
                </Button>

                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade("APPROVED")}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Approve & Promote to {activeSubmission.targetLevel}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
