import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import {
  PrivateLessonsClient,
  SerializedPrivateLessonBooking,
} from "@/components/lessons/private-lessons-client";

export const metadata = {
  title: "1-on-1 Private Lessons & Coaching | Salsa Explosion Bournemouth",
  description:
    "Book bespoke private dance coaching with Cuban Maestro Enrique Perez Valdes, Moe Flex, Justyna, Arturas, or Jim at BOH Studios Bournemouth.",
};

export default async function PrivateLessonsPage() {
  const user = await getOrProvisionCurrentUser();

  let initialBookings: SerializedPrivateLessonBooking[] = [];
  if (user) {
    const rawBookings = await prisma.privateLessonBooking.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
    });

    initialBookings = rawBookings.map((b) => ({
      id: b.id,
      instructorName: b.instructorName,
      focusTopic: b.focusTopic,
      packageType: b.packageType,
      preferredSlot: b.preferredSlot,
      totalPricePounds: b.totalPricePounds,
      status: b.status,
      createdAtIso: b.createdAt.toISOString(),
    }));
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header — "The Place" Havana Nocturne Architecture */}
      <PageHeader
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
        eyebrowLeft="MAESTRO-LEVEL MENTORSHIP & PRIVATE COACHING"
        eyebrowRight="BOH STUDIOS • BOURNEMOUTH BH2 5LR"
        title="1-on-1 Private Lessons &"
        highlight="Coaching"
        description="Accelerate your social dancing, master complex Rueda calls, or prepare an unforgettable wedding first dance under the personal direction of Maestro Enrique Perez Valdes and Salsa Explosion faculty (Moe Flex, Justyna, Arturas, Jim)."
      />

      {/* Private Lessons Booking Wizard with Initial Bookings */}
      <PrivateLessonsClient initialBookings={initialBookings} />
    </main>
  );
}
