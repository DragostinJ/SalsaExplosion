import { redirect } from "next/navigation";
import type { DanceLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import {
  getMyAttendedClassRecapsAction,
  getAllPublishedClassRecapsAction,
} from "@/actions/recap.actions";
import { ClassRecapVault } from "@/components/recaps/class-recap-vault";
import { PageHeader } from "@/components/layout/page-header";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";

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

  let loadFailed = isFallbackUser(user);

  // 1. Fetch Student's Attended Class Recaps
  const myRecapsRes = await getMyAttendedClassRecapsAction();
  if (!myRecapsRes.success) {
    loadFailed = true;
  }
  const myRecaps = myRecapsRes.success ? myRecapsRes.data : [];

  // 2. Fetch All Studio Recaps for Curriculum Preview
  const allRecapsRes = await getAllPublishedClassRecapsAction();
  if (!allRecapsRes.success) {
    loadFailed = true;
  }
  const allStudioRecaps = allRecapsRes.success ? allRecapsRes.data : [];

  // 3. If Staff, fetch classes so they can attach videos
  const isStaff = user.role === "INSTRUCTOR" || user.role === "ADMIN";
  let activeClassesForStaff: Array<{ id: string; title: string; minLevel: DanceLevel }> = [];
  if (isStaff) {
    try {
      activeClassesForStaff = await prisma.classSession.findMany({
        where: { isCancelled: false },
        orderBy: { startTime: "desc" },
        take: 15,
        select: { id: true, title: true, minLevel: true },
      });
    } catch (err) {
      loadFailed = true;
      console.error("[ClassRecapsPage:activeClasses]", err);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {loadFailed && <DataUnavailableNotice />}
      <PageHeader
        title="Class Recaps &"
        titleHighlight="Attended Figures"
        description="Never forget a routine again! Watch your maestros demonstrate the Cuban combinations practiced at the end of each class, check figure names, and use 0.75x slow-motion to master footwork."
        badge={`${myRecaps.length} Saved Recaps`}
        eyebrow="STUDENT CLASS RECAPS • 4-TIER SYLLABUS"
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
      />

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
