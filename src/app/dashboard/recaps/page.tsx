import { redirect } from "next/navigation";
import { Video, Sparkles, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import {
  getMyAttendedClassRecapsAction,
  getAllPublishedClassRecapsAction,
} from "@/actions/recap.actions";
import { ClassRecapVault } from "@/components/recaps/class-recap-vault";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Class Recaps & Attended Figures | Salsa Explosion",
  description:
    "Review end-of-class recap videos, Cuban salsa combinations, and instructor notes from every class you attended.",
};

export default async function ClassRecapsPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // 1. Fetch Student's Attended Class Recaps
  const myRecapsRes = await getMyAttendedClassRecapsAction();
  const myRecaps = myRecapsRes.success ? myRecapsRes.data : [];

  // 2. Fetch All Studio Recaps for Curriculum Preview
  const allRecapsRes = await getAllPublishedClassRecapsAction();
  const allStudioRecaps = allRecapsRes.success ? allRecapsRes.data : [];

  // 3. If Staff, fetch classes so they can attach videos
  const isStaff = user.role === "INSTRUCTOR" || user.role === "ADMIN";
  const activeClassesForStaff = isStaff
    ? await prisma.classSession.findMany({
        where: { isCancelled: false },
        orderBy: { startTime: "desc" },
        take: 15,
        select: { id: true, title: true, minLevel: true },
      })
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          End-of-Class Video Vault
        </Badge>
      </div>

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Class Recaps & Attended Figures
            </h1>
            <Badge className="bg-amber-500 text-zinc-950 font-bold">
              <Video className="mr-1 h-3.5 w-3.5" />
              {myRecaps.length} Saved Recaps
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Never forget a routine again! Watch your maestros demonstrate the Cuban combinations practiced at the end of each class, check figure names, and use 0.75x slow-motion to master footwork.
          </p>
        </div>

        <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold shrink-0">
          <Award className="mr-1.5 h-4 w-4 text-amber-600" />
          4-Tier Syllabus Vault
        </Badge>
      </div>

      {/* Interactive Class Recap Vault Component */}
      <ClassRecapVault
        initialRecaps={myRecaps}
        allStudioRecaps={allStudioRecaps}
        userRole={user.role}
        activeClassesForStaff={activeClassesForStaff}
      />
    </main>
  );
}
