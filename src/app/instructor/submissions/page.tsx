import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Role, SubmissionStatus } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import {
  QueueSubmissionItem,
  VideoGradingWorkspace,
} from "@/components/instructor/video-grading-workspace";

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
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Verify Instructor or Admin RBAC
  const currentUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  });

  if (
    !currentUser ||
    (currentUser.role !== Role.INSTRUCTOR && currentUser.role !== Role.ADMIN)
  ) {
    redirect("/dashboard");
  }

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Student Level-Up Assessments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review technique videos, provide timing and frame feedback, and unlock
          higher class tiers for students.
        </p>
      </div>

      <VideoGradingWorkspace initialSubmissions={submissionsWithSignedUrls} />
    </main>
  );
}
