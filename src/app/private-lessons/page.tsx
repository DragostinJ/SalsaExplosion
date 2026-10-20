import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm text-xs font-bold">
              <Award className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
              Maestro-Level Mentorship
            </Badge>
            <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-xs font-semibold">
              BOH Studios, Bournemouth
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight drop-shadow-sm">
            1-on-1 Private Lessons & Coaching
          </h1>

          <p className="text-base sm:text-lg text-amber-50/95 leading-relaxed font-normal">
            Accelerate your social dancing, master complex Rueda calls, or prepare an unforgettable wedding first dance under the personal direction of Maestro Enrique Perez Valdes.
          </p>
        </div>
      </div>

      {/* Private Lessons Booking Wizard with Initial Bookings */}
      <PrivateLessonsClient initialBookings={initialBookings} />
    </main>
  );
}
