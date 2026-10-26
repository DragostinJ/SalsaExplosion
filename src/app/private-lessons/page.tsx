import { BackButton } from "@/components/navigation/back-button";
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

      {/* Hero Header — "The Place" Havana Nocturne Architecture */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-[#070605] p-6 sm:p-10 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-[11px] font-black uppercase tracking-widest text-amber-300">
          <span>MAESTRO-LEVEL MENTORSHIP &amp; PRIVATE COACHING</span>
          <span className="text-zinc-400 font-bold">BOH STUDIOS • BOURNEMOUTH BH2 5LR</span>
        </div>

        <div className="mt-5 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none text-white">
            1-on-1 Private Lessons &amp;{" "}
            <span className="font-display italic font-normal text-amber-300 normal-case">
              Coaching
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
            Accelerate your social dancing, master complex Rueda calls, or prepare an unforgettable wedding first dance under the personal direction of Maestro Enrique Perez Valdes and Salsa Explosion faculty (Moe Flex, Justyna, Arturas, Jim).
          </p>
        </div>
      </div>

      {/* Private Lessons Booking Wizard with Initial Bookings */}
      <PrivateLessonsClient initialBookings={initialBookings} />
    </main>
  );
}
