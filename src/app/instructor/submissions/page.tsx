import type { Metadata } from "next";
import { SubmissionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Instructor Assessment Queue",
  robots: {
    index: false,
    follow: false,
  },
};
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { getSupabaseAdmin, isSupabaseStorageConfigured } from "@/lib/storage";
import { reportError } from "@/lib/monitoring";
import {
  QueueSubmissionItem,
  VideoGradingWorkspace,
} from "@/components/instructor/video-grading-workspace";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

export default async function InstructorSubmissionsPage() {
  // Access first: nothing else runs for someone who isn't staff
  await requireRole(STAFF_ROLES);

  // Without storage keys (e.g. a Vercel project missing SUPABASE_SERVICE_ROLE_KEY) the queue still
  // opens; private videos fall back to the sample clip and the page says why.
  const storageReady = isSupabaseStorageConfigured();
  const supabaseAdmin = storageReady ? getSupabaseAdmin() : null;

  // Fetch oldest PENDING submissions first (FIFO queue)
  const queue = await prisma.videoSubmission.findMany({
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
  })
    .then((rows) => ({ rows, failed: false }))
    .catch((err: unknown) => {
      reportError("InstructorSubmissionsPage:findMany", err);
      return { rows: [], failed: true };
    });
  const rawSubmissions = queue.rows;
  const loadFailed = queue.failed;

  // Generate 1-hour Signed Playback URLs for each private video path
  const submissionsWithSignedUrls: QueueSubmissionItem[] = await Promise.all(
    rawSubmissions.map(async (sub) => {
      let signedVideoUrl = sub.videoUrl;

      if (!sub.videoUrl.startsWith("http")) {
        const data = supabaseAdmin
          ? (await supabaseAdmin.storage.from("assessments").createSignedUrl(sub.videoUrl, 3600)).data
          : null;
        signedVideoUrl = data?.signedUrl ?? MEDIA_MANIFEST.videos.sampleStudentSubmission;
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

      {loadFailed && (
        <p role="alert" className="border-4 border-ink bg-poster-mustard p-4 text-sm font-bold text-ink">
          The submission queue couldn&apos;t load right now. Refresh in a minute; if it keeps happening, check the database
          connection on Vercel.
        </p>
      )}
      {!storageReady && (
        <p role="note" className="border-2 border-ink bg-paper p-3 text-xs font-semibold text-ink">
          Video storage isn&apos;t configured on this deployment (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY), so
          uploaded videos show a sample clip here.
        </p>
      )}

      <VideoGradingWorkspace initialSubmissions={submissionsWithSignedUrls} />
    </main>
  );
}
