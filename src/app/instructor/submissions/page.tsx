import { SubmissionStatus } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import {
  QueueSubmissionItem,
  VideoGradingWorkspace,
} from "@/components/instructor/video-grading-workspace";
import { InstructorNav } from "@/components/navigation/instructor-nav";

function getSupabaseAdmin() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl =
    envUrl && !envUrl.includes("[")
      ? envUrl
      : "https://placeholder-project.supabase.co";
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key";

  return createClient(supabaseUrl, supabaseServiceKey);
}

export default async function InstructorSubmissionsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  await requireRole(STAFF_ROLES);

  // Fetch oldest PENDING submissions first (FIFO queue)
  const rawSubmissions = await prisma.videoSubmission.findMany({
    where: { status: SubmissionStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: 30,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Generate 1-hour Signed Playback URLs for each private video path
  const submissionsWithSignedUrls: QueueSubmissionItem[] = await Promise.all(
    rawSubmissions.map(async (sub) => {
      let signedVideoUrl = sub.videoUrl;

      if (!sub.videoUrl.startsWith("http")) {
        const { data } = await supabaseAdmin.storage
          .from("assessments")
          .createSignedUrl(sub.videoUrl, 3600);

        if (data?.signedUrl) {
          signedVideoUrl = data.signedUrl;
        } else {
          signedVideoUrl =
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
        }
      }

      return {
        id: sub.id,
        style: sub.style,
        currentLevel: sub.currentLevel,
        targetLevel: sub.targetLevel,
        signedVideoUrl,
        studentNotes: sub.studentNotes,
        createdAt: sub.createdAt.toISOString(),
        student: sub.student,
      };
    })
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <InstructorNav />

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Student Level-Up Assessments & AI Co-Pilot
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review technique videos, run AI syllabus pre-grading, provide timing and frame feedback, and unlock higher class tiers for students.
        </p>
      </div>

      <VideoGradingWorkspace initialSubmissions={submissionsWithSignedUrls} />
    </main>
  );
}
