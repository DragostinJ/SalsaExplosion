import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { AdminNav } from "@/components/navigation/admin-nav";
import { StudioOperationsWorkspace } from "@/components/admin/studio-operations-workspace";

export const metadata: Metadata = {
  title: "Studio Desk Operations | Salsa Explosion Admin",
  description: "Fulfill private lesson requests, manage merchandise click & collect, pair dancers on the waitlist, and respond to beginner student sentiment.",
};

interface AdminOperationsPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdminOperationsPage({
  searchParams,
}: AdminOperationsPageProps) {
  await requireRole(STAFF_ROLES);
  const { tab } = await searchParams;

  const [
    privateBookings,
    merchReservations,
    waitlistEntries,
    sentimentFeedbacks,
    anonymousQuestions,
  ] = await Promise.all([
    prisma.privateLessonBooking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.merchReservation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.partnerWaitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.postClassFeedback.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        classSession: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.anonymousQuestion.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main id="main-content" tabIndex={-1} className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <AdminNav />

      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Studio Desk Operations Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Centralized command center to confirm 1-on-1 private coaching, hand out reserved studio gear, pair dance partners, and address beginner questions.
        </p>
      </div>

      <StudioOperationsWorkspace
        initialTab={tab || "coaching"}
        privateBookings={privateBookings}
        merchReservations={merchReservations}
        waitlistEntries={waitlistEntries}
        sentimentFeedbacks={sentimentFeedbacks}
        anonymousQuestions={anonymousQuestions}
      />
    </main>
  );
}
