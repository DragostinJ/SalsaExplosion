import { redirect } from "next/navigation";
import {
  BookingStatus,
  SubmissionStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { Users, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { StudentProgressionRow } from "@/lib/constants/management";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { StudentProgressionDirectory } from "@/components/instructor/student-progression-directory";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Student Progression & Credit Directory | RitmoFlow Instructor",
  description:
    "View student Cuban Salsa levels, promote dancers in real time, balance Lead/Follow roles, and manage class credits.",
};

export default async function InstructorStudentsPage() {
  const currentUser = await getOrProvisionCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }

  const allUsers = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: {
      subscription: true,
      bookings: {
        select: { status: true },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        select: { status: true },
      },
    },
  });

  const now = new Date();

  const serializedStudents: StudentProgressionRow[] = allUsers.map((u) => {
    const hasActiveSubscription =
      u.subscription !== null &&
      u.subscription.status === SubscriptionStatus.ACTIVE &&
      u.subscription.currentPeriodEnd > now;

    const totalBookingsCount = u.bookings.filter(
      (b) =>
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.ATTENDED
    ).length;

    const attendedClassesCount = u.bookings.filter(
      (b) => b.status === BookingStatus.ATTENDED
    ).length;

    const pendingSubmissionsCount = u.submissions.filter(
      (s) => s.status === SubmissionStatus.PENDING
    ).length;

    const approvedSubmissionsCount = u.submissions.filter(
      (s) => s.status === SubmissionStatus.APPROVED
    ).length;

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatarUrl: u.avatarUrl,
      role: u.role,
      currentLevel: u.currentLevel,
      preferredRole: u.preferredRole,
      classCredits: u.classCredits,
      hasActiveSubscription,
      totalBookingsCount,
      attendedClassesCount,
      pendingSubmissionsCount,
      approvedSubmissionsCount,
      latestSubmissionStatus: u.submissions[0]?.status ?? null,
      createdAt: u.createdAt.toISOString(),
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <InstructorNav />

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Student Progression & Studio Directory
            </h1>
            <Badge className="bg-emerald-600 text-white font-semibold">
              <Users className="mr-1 h-3.5 w-3.5" />
              {serializedStudents.length} Dancers
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every student&apos;s Cuban Salsa syllabus tier, promote levels after in-class evaluations, switch Lead/Follow roles, and issue door passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold">
            <Award className="mr-1.5 h-4 w-4 text-amber-500" />
            4-Tier Casino Curriculum
          </Badge>
        </div>
      </div>

      <StudentProgressionDirectory initialStudents={serializedStudents} />
    </main>
  );
}
