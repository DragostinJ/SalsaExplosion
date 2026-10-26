import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Progression & Curriculum",
  description:
    "Track your Cuban dance journey through the 2027 curriculum gears, skill trees, and instructor video feedback.",
  robots: {
    index: false,
    follow: false,
  },
};
import { DanceLevel, SubmissionStatus } from "@prisma/client";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Award,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";
import { StudentVideoUploadDropzone } from "@/components/progression/video-upload-dropzone";
import { PromotionCertificateCard } from "@/components/progression/promotion-certificate-card";
import { AttendanceMilestonesCard } from "@/components/progression/attendance-milestones-card";
import { reportError } from "@/lib/monitoring";
import { ProgressionJourneyTabs } from "@/components/progression/progression-journey-tabs";
import { CubanCurriculumSkillTree } from "@/components/progression/cuban-curriculum-skill-tree";
import { CubanDanceGearsMatrix } from "@/components/progression/cuban-dance-gears-matrix";
import { PRISMA_TO_CURRICULUM_LEVEL_MAP } from "@/lib/constants/cuban-curriculum-2027";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProgressionPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all historical submissions and attendance inside defensive try/catch
  let submissions: Array<{
    id: string;
    videoUrl: string;
    targetLevel: DanceLevel;
    currentLevel: DanceLevel;
    status: SubmissionStatus;
    feedback: string | null;
    createdAt: Date;
    studentNotes: string | null;
    instructor: { firstName: string | null; lastName: string | null } | null;
  }> = [];
  let attendedBookings: Array<{
    classSession: { startTime: Date };
  }> = [];

  let loadFailed = isFallbackUser(user);

  try {
    const [subs, bookings] = await Promise.all([
      prisma.videoSubmission.findMany({
        where: { studentId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          userId: user.id,
          status: "ATTENDED",
        },
        include: {
          classSession: {
            select: { startTime: true },
          },
        },
        orderBy: {
          classSession: { startTime: "desc" },
        },
      }),
    ]);
    submissions = subs;
    attendedBookings = bookings;
  } catch (err) {
    loadFailed = true;
    reportError("ProgressionPage:queries", err);
  }

  const pendingSubmission = submissions.find(
    (s) => s.status === SubmissionStatus.PENDING
  );

  const approvedCount = submissions.filter(
    (s) => s.status === SubmissionStatus.APPROVED
  ).length;

  // Calculate streak in active weeks
  const weekSet = new Set<string>();
  for (const b of attendedBookings) {
    const d = new Date(b.classSession.startTime);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNum = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    weekSet.add(`${d.getFullYear()}-W${weekNum}`);
  }
  const streakWeeks = weekSet.size;

  let hasCongressPass = false;
  try {
    const congressReg = await prisma.eventRegistration.findFirst({
      where: {
        userId: user.id,
        paymentStatus: "PAID",
      },
    });
    hasCongressPass = Boolean(congressReg);
  } catch (regErr) {
    loadFailed = true;
    reportError("ProgressionPage:congressReg", regErr);
  }

  const isMaxLevel = user.currentLevel === DanceLevel.ADVANCED;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl space-y-6 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      {loadFailed && <DataUnavailableNotice />}
      {/* Header — Havana Architecture */}
      <PageHeader
        title="Cuban Salsa"
        titleHighlight="Progression"
        description="Track your dance milestones, submit technique videos for review, and unlock higher-tier classes."
        badge="Casino & Rueda"
        eyebrow="STUDENT MASTERY ROADMAP • 4 SYLLABUS TIERS"
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2 text-xs font-medium text-stone-200">
            <Award className="h-4 w-4 text-gold" />
            <span>Current Level:</span>
            <Badge variant="gold" className="font-bold text-xs">
              {user.currentLevel}
            </Badge>
          </div>
        }
      />

      {/* 3-Tab Student Journey: Syllabus Checklist, Milestones, and Optional Video Feedback */}
      <ProgressionJourneyTabs
        currentLevel={user.currentLevel}
        submissionCount={submissions.length}
        syllabusTabContent={
          <div className="space-y-6">
            <CubanCurriculumSkillTree
              defaultLevel={PRISMA_TO_CURRICULUM_LEVEL_MAP[user.currentLevel] ?? "Beginner"}
              studentName={user.firstName}
            />

            <CubanDanceGearsMatrix initiallyCollapsed={true} />
          </div>
        }
        milestonesTabContent={
          <div className="space-y-6">
            {/* Verified Dancer Milestone Certificate / Social Badge */}
            <PromotionCertificateCard
              studentName={`${user.firstName} ${user.lastName}`}
              currentLevel={user.currentLevel}
              preferredRole={user.preferredRole}
              approvedCount={approvedCount}
            />

            {/* Dancer Attendance Milestones & Streaks Card */}
            <AttendanceMilestonesCard
              attendedCount={attendedBookings.length}
              streakWeeks={streakWeeks}
              currentLevel={user.currentLevel}
              hasCongressPass={hasCongressPass}
            />
          </div>
        }
        videoFeedbackTabContent={
          <div className="space-y-6">
            {/* State 1: Max Level Reached */}
            {isMaxLevel ? (
              <Card className="border-amber-500/40 bg-amber-500/[0.03]">
                <CardHeader className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-xl">
                      Master Casino Dancer (Advanced)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Congratulations! You have unlocked all Cuban Salsa levels at Salsa Explosion. You are eligible to book every class on the schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/dashboard/schedule">
                      Browse Full Schedule
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : pendingSubmission ? (
              /* State 2: Active Pending Submission */
              <Card className="border-primary/40 bg-primary/[0.02]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        Assessment Awaiting Review
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">In Review Queue</Badge>
                  </div>
                  <CardDescription>
                    Your technique video for <strong>{pendingSubmission.targetLevel}</strong> was submitted on{" "}
                    {new Date(pendingSubmission.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    . A studio instructor is currently reviewing your rhythm and frame.
                  </CardDescription>
                </CardHeader>
                {pendingSubmission.studentNotes && (
                  <CardContent>
                    <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                      <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                        Your Notes:
                      </span>
                      <p className="mt-1 text-sm">{pendingSubmission.studentNotes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ) : (
              /* State 3: Ready for Video Submission */
              <StudentVideoUploadDropzone currentLevel={user.currentLevel} />
            )}

            {/* Historical Submissions Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight">
                Assessment History ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
                <Card className="border-dashed py-12 text-center">
                  <CardContent>
                    <p className="text-sm font-medium">No past submissions yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      When you submit level-up videos, instructor feedback and grading history will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isApproved = sub.status === SubmissionStatus.APPROVED;
                    const isRejected = sub.status === SubmissionStatus.REJECTED;

                    return (
                      <Card key={sub.id} className="transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isApproved ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : isRejected ? (
                                <XCircle className="h-5 w-5 text-destructive" />
                              ) : (
                                <Clock className="h-5 w-5 text-primary" />
                              )}
                              <CardTitle className="text-base">
                                {sub.currentLevel} → {sub.targetLevel}
                              </CardTitle>
                              <Badge
                                variant={
                                  isApproved
                                    ? "default"
                                    : isRejected
                                      ? "destructive"
                                      : "secondary"
                                }
                                className={
                                  isApproved
                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                    : ""
                                }
                              >
                                {sub.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </CardHeader>

                        {(sub.feedback || sub.studentNotes) && (
                          <CardContent className="space-y-3 pt-0 text-xs">
                            {sub.studentNotes && (
                              <div className="rounded-md border bg-muted/20 p-2.5">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                  Student Note:
                                </span>
                                <p className="mt-0.5 text-xs text-foreground">
                                  {sub.studentNotes}
                                </p>
                              </div>
                            )}

                            {sub.feedback && (
                              <div
                                className={`rounded-md border p-3 ${
                                  isApproved
                                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                                    : "border-destructive/30 bg-destructive/5 text-destructive"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>
                                    Instructor Feedback
                                    {sub.instructor
                                      ? ` from ${sub.instructor.firstName} ${sub.instructor.lastName}`
                                      : ""}
                                    :
                                  </span>
                                </div>
                                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed">
                                  {sub.feedback}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        }
      />
    </main>
  );
}
