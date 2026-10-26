import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Fast-Track Door Check-In",
  robots: {
    index: false,
    follow: false,
  },
};
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { BackButton } from "@/components/navigation/back-button";
import { QrCheckInCard } from "@/components/schedule/qr-checkin-card";
import { reportError } from "@/lib/monitoring";

interface CheckInPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function StudentQrCheckInPage({
  params,
}: CheckInPageProps) {
  const { sessionId } = await params;
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  let classSession = null;
  try {
    classSession = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: {
          select: { firstName: true, lastName: true },
        },
        bookings: {
          where: { userId: user.id },
          select: { id: true, status: true, danceRole: true },
        },
      },
    });
  } catch (err) {
    reportError("StudentQrCheckInPage:classSession", err);
  }

  if (!classSession) {
    notFound();
  }

  const existingBooking = classSession.bookings[0] ?? null;

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <BackButton
          fallbackUrl="/instructor/roster"
          label="Back to Studio Roster"
        />
      </div>

      <QrCheckInCard
        session={{
          id: classSession.id,
          title: classSession.title,
          room: classSession.room,
          startTimeIso: classSession.startTime.toISOString(),
          minLevel: classSession.minLevel,
          instructorName: `${classSession.instructor.firstName} ${classSession.instructor.lastName}`,
        }}
        existingBooking={existingBooking}
        preferredRole={user.preferredRole}
      />
    </main>
  );
}
