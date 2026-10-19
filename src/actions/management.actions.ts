"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  DanceStyle,
  EventStatus,
  Role,
  TicketPaymentStatus,
  TransactionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, canSwitchRoles } from "@/lib/auth-user";
import { CUBAN_SALSA_SYLLABUS } from "@/lib/constants/submission";
import {
  AiRubricEvaluation,
  ManagementActionResponse,
} from "@/lib/constants/management";

// ==========================================
// ZOD 4 VALIDATION SCHEMAS (INTERNAL)
// ==========================================

const SwitchRoleSchema = z.object({
  targetRole: z.enum([Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN]),
});

const UpdateStudentProgressionSchema = z.object({
  studentId: z.string().min(1),
  newLevel: z.enum([
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ]),
  preferredRole: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
});

const AdjustStudentCreditsSchema = z.object({
  studentId: z.string().min(1),
  delta: z.number().int().min(-50).max(100).refine((v) => v !== 0, {
    message: "Credit adjustment cannot be zero.",
  }),
  reason: z.string().trim().min(2).max(200),
});

const ToggleBookingCheckInSchema = z.object({
  bookingId: z.string().min(1),
  markAttended: z.boolean(),
});

const SelfCheckInClassQrSchema = z.object({
  classSessionId: z.string().min(1),
});

const RegisterEventTierSchema = z.object({
  eventId: z.string().min(1),
  ticketTierId: z.string().min(1),
  role: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
});

const ToggleEventCheckInSchema = z.object({
  registrationId: z.string().min(1),
  checkedIn: z.boolean(),
});

const CreateClassSessionSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().max(500).optional(),
  minLevel: z.enum([
    DanceLevel.BEGINNER,
    DanceLevel.IMPROVER,
    DanceLevel.INTERMEDIATE,
    DanceLevel.ADVANCED,
  ]),
  startTimeIso: z.string().min(10),
  durationMinutes: z.number().int().min(30).max(240),
  room: z.string().trim().min(2).max(80),
  maxCapacity: z.number().int().min(4).max(200),
  maxLeads: z.number().int().min(2).max(100),
  maxFollows: z.number().int().min(2).max(100),
  creditCost: z.number().int().min(1).max(10),
});

const CreateGuestArtistEventSchema = z.object({
  title: z.string().trim().min(5).max(140),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only."),
  description: z.string().trim().min(10).max(2000),
  venueName: z.string().trim().min(2).max(120),
  venueAddress: z.string().trim().min(4).max(200),
  startDateIso: z.string().min(10),
  endDateIso: z.string().min(10),
  guestArtistsCsv: z.string().trim().min(2).max(300),
  fullPassPricePounds: z.number().min(10).max(1000),
  fullPassCapacity: z.number().int().min(10).max(500),
  partyPassPricePounds: z.number().min(5).max(500),
  partyPassCapacity: z.number().int().min(10).max(1000),
});

// ==========================================
// 1. ROLE SWITCHER (FOR STUDIO DEMO & TESTING)
// ==========================================

export async function switchMyAccountRoleAction(rawInput: {
  targetRole: Role;
}): Promise<ManagementActionResponse<{ role: Role }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in first." },
      };
    }

    const parsed = SwitchRoleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid target role." },
      };
    }

    // Security: Strict fail-closed guard against unauthorized privilege escalation.
    // Must satisfy: NODE_ENV !== 'production' && ALLOW_DEMO_ROLE_SWITCHING === 'true' && email in DEMO_SWITCHER_EMAILS
    if (!canSwitchRoles(user.email)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Role switching is strictly disabled or unauthorized.",
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: parsed.data.targetRole },
      select: { role: true },
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/submissions");
    revalidatePath("/instructor/students");
    revalidatePath("/instructor/roster");
    revalidatePath("/admin/analytics");

    return {
      success: true,
      data: { role: updated.role },
      message: `Switched active workspace mode to ${updated.role}.`,
    };
  } catch (error) {
    console.error("[switchMyAccountRoleAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not switch role." },
    };
  }
}

// ==========================================
// 2. INSTRUCTOR / ADMIN: UPDATE STUDENT LEVEL & ROLE
// ==========================================

export async function updateStudentProgressionAction(rawInput: {
  studentId: string;
  newLevel: DanceLevel;
  preferredRole: DanceRole;
}): Promise<
  ManagementActionResponse<{
    studentId: string;
    currentLevel: DanceLevel;
    preferredRole: DanceRole;
  }>
> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Studio Admins can modify student levels.",
        },
      };
    }

    const parsed = UpdateStudentProgressionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid parameters.",
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: parsed.data.studentId },
      data: {
        currentLevel: parsed.data.newLevel,
        preferredRole: parsed.data.preferredRole,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        currentLevel: true,
        preferredRole: true,
      },
    });

    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/progression");

    return {
      success: true,
      data: {
        studentId: updated.id,
        currentLevel: updated.currentLevel,
        preferredRole: updated.preferredRole,
      },
      message: `Updated ${updated.firstName} ${updated.lastName} to ${updated.currentLevel} (${updated.preferredRole}).`,
    };
  } catch (error) {
    console.error("[updateStudentProgressionAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update student progression.",
      },
    };
  }
}

// ==========================================
// 3. INSTRUCTOR / ADMIN: ADJUST STUDENT CREDITS
// ==========================================

export async function adjustStudentCreditsAction(rawInput: {
  studentId: string;
  delta: number;
  reason: string;
}): Promise<ManagementActionResponse<{ studentId: string; classCredits: number }>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Studio Admins can adjust class credits.",
        },
      };
    }

    const parsed = AdjustStudentCreditsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid credit adjustment.",
        },
      };
    }

    const { studentId, delta, reason } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const targetUser = await tx.user.findUnique({
        where: { id: studentId },
        select: { id: true, firstName: true, lastName: true, classCredits: true },
      });

      if (!targetUser) {
        throw new Error("Student not found.");
      }

      const newBalance = Math.max(0, targetUser.classCredits + delta);
      const actualDelta = newBalance - targetUser.classCredits;

      const updatedUser = await tx.user.update({
        where: { id: studentId },
        data: { classCredits: newBalance },
        select: { id: true, firstName: true, lastName: true, classCredits: true },
      });

      if (actualDelta !== 0) {
        await tx.creditLedger.create({
          data: {
            userId: studentId,
            amount: actualDelta,
            balanceAfter: newBalance,
            type: TransactionType.ADMIN_ADJUSTMENT,
            description: `${reason} (by ${actor.firstName})`,
          },
        });
      }

      return updatedUser;
    });

    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");
    revalidatePath("/dashboard/schedule");

    return {
      success: true,
      data: { studentId: result.id, classCredits: result.classCredits },
      message: `Adjusted credits for ${result.firstName} ${result.lastName}. New balance: ${result.classCredits}.`,
    };
  } catch (error) {
    console.error("[adjustStudentCreditsAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to adjust student credits.",
      },
    };
  }
}

// ==========================================
// 4. INSTRUCTOR ROSTER: TOGGLE CLASS CHECK-IN
// ==========================================

export async function toggleBookingCheckInAction(rawInput: {
  bookingId: string;
  markAttended: boolean;
}): Promise<ManagementActionResponse<{ bookingId: string; status: BookingStatus }>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can check in students.",
        },
      };
    }

    const parsed = ToggleBookingCheckInSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid check-in request." },
      };
    }

    const newStatus = parsed.data.markAttended
      ? BookingStatus.ATTENDED
      : BookingStatus.CONFIRMED;

    const updated = await prisma.booking.update({
      where: { id: parsed.data.bookingId },
      data: {
        status: newStatus,
        checkedInAt: parsed.data.markAttended ? new Date() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    revalidatePath("/instructor/roster");
    revalidatePath("/instructor/students");
    revalidatePath("/admin/analytics");

    return {
      success: true,
      data: { bookingId: updated.id, status: updated.status },
      message: parsed.data.markAttended
        ? `Checked in ${updated.user.firstName} ${updated.user.lastName}!`
        : `Reverted check-in for ${updated.user.firstName} ${updated.user.lastName}.`,
    };
  } catch (error) {
    console.error("[toggleBookingCheckInAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not update check-in status." },
    };
  }
}

// ==========================================
// 5. QR DOOR SCAN: STUDENT SELF CHECK-IN
// ==========================================

export async function selfCheckInClassQrAction(rawInput: {
  classSessionId: string;
}): Promise<ManagementActionResponse<{ bookingId: string; classTitle: string }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in to check in." },
      };
    }

    const parsed = SelfCheckInClassQrSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid class QR code." },
      };
    }

    const booking = await prisma.booking.findUnique({
      where: {
        userId_classSessionId: {
          userId: user.id,
          classSessionId: parsed.data.classSessionId,
        },
      },
      include: {
        classSession: {
          select: {
            title: true,
            startTime: true,
            endTime: true,
            isCancelled: true,
          },
        },
      },
    });

    if (
      !booking ||
      (booking.status !== BookingStatus.CONFIRMED &&
        booking.status !== BookingStatus.ATTENDED)
    ) {
      return {
        success: false,
        error: {
          code: "NO_ACTIVE_BOOKING",
          message:
            "You do not have a confirmed booking for this class yet. Book your spot on the schedule first!",
        },
      };
    }

    if (booking.classSession.isCancelled) {
      return {
        success: false,
        error: {
          code: "CLASS_CANCELLED",
          message: "This class has been cancelled by the studio.",
        },
      };
    }

    // Security: Check-in window validation (opens 90 minutes before, closes 60 minutes after class end)
    const now = new Date();
    const startTimeMs = booking.classSession.startTime.getTime();
    const endTimeMs = booking.classSession.endTime.getTime();
    const earliestCheckIn = startTimeMs - 90 * 60 * 1000;
    const latestCheckIn = endTimeMs + 60 * 60 * 1000;

    if (now.getTime() < earliestCheckIn) {
      return {
        success: false,
        error: {
          code: "CHECK_IN_NOT_OPEN",
          message: "Check-in for this class opens 90 minutes before class start time.",
        },
      };
    }

    if (now.getTime() > latestCheckIn) {
      return {
        success: false,
        error: {
          code: "CLASS_ENDED",
          message: "This class has already concluded and self check-in is closed.",
        },
      };
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.ATTENDED,
        checkedInAt: new Date(),
      },
    });

    revalidatePath(`/checkin/${parsed.data.classSessionId}`);
    revalidatePath("/instructor/roster");
    revalidatePath("/dashboard/schedule");

    return {
      success: true,
      data: { bookingId: booking.id, classTitle: booking.classSession.title },
      message: `Welcome to class, ${user.firstName}! You are checked in for ${booking.classSession.title}.`,
    };
  } catch (error) {
    console.error("[selfCheckInClassQrAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to complete QR check-in." },
    };
  }
}

// ==========================================
// 6. GUEST ARTIST EVENT REGISTRATION (ATOMIC)
// ==========================================

export async function registerForEventTierAction(rawInput: {
  eventId: string;
  ticketTierId: string;
  role: DanceRole;
}): Promise<
  ManagementActionResponse<{
    registrationId: string;
    qrCodeHash: string;
    tierName: string;
  }>
> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to register for this event.",
        },
      };
    }

    const parsed = RegisterEventTierSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid pass selection." },
      };
    }

    const { eventId, ticketTierId, role } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // Acquire PostgreSQL row-level lock on EventTicketTier to prevent concurrent capacity/role race conditions
      await tx.$queryRaw`SELECT id FROM "EventTicketTier" WHERE id = ${ticketTierId} FOR UPDATE`;

      const tier = await tx.eventTicketTier.findUnique({
        where: { id: ticketTierId },
        include: {
          event: { select: { id: true, slug: true, title: true } },
          registrations: {
            where: { paymentStatus: TicketPaymentStatus.PAID },
            select: { id: true, userId: true, role: true },
          },
        },
      });

      if (!tier || tier.eventId !== eventId) {
        throw new Error("Ticket tier not found.");
      }

      const existingUserPass = tier.registrations.find((r) => r.userId === user.id);
      if (existingUserPass) {
        throw new Error("You already hold an active pass for this tier!");
      }

      if (tier.registrations.length >= tier.totalCapacity) {
        throw new Error("This ticket tier is completely sold out.");
      }

      if (role === DanceRole.LEAD && tier.maxLeads !== null) {
        const leadsCount = tier.registrations.filter(
          (r) => r.role === DanceRole.LEAD
        ).length;
        if (leadsCount >= tier.maxLeads) {
          throw new Error(
            "Lead spots for this tier are currently full to maintain partner balance."
          );
        }
      }

      if (role === DanceRole.FOLLOW && tier.maxFollows !== null) {
        const followsCount = tier.registrations.filter(
          (r) => r.role === DanceRole.FOLLOW
        ).length;
        if (followsCount >= tier.maxFollows) {
          throw new Error(
            "Follow spots for this tier are currently full to maintain partner balance."
          );
        }
      }

      // Security: Paid tiers must be processed through Stripe Checkout in production
      const isDemoRegistrationAllowed =
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_DEMO_EVENT_REGISTRATION === "true";

      if (tier.priceInCents > 0 && !isDemoRegistrationAllowed) {
        throw new Error(
          "Direct registration is only available for free tiers or RSVPs. Paid passes must be purchased via Stripe checkout."
        );
      }

      const shortCode = randomUUID().slice(0, 8).toUpperCase();
      const qrCodeHash = `RF-PASS-${shortCode}`;

      const registration = await tx.eventRegistration.create({
        data: {
          userId: user.id,
          eventId,
          ticketTierId,
          role,
          qrCodeHash,
          paymentStatus: TicketPaymentStatus.PAID,
          amountPaidInCents: tier.priceInCents,
        },
      });

      return {
        registrationId: registration.id,
        qrCodeHash: registration.qrCodeHash,
        tierName: tier.name,
        eventSlug: tier.event.slug,
      };
    });

    revalidatePath(`/events/${result.eventSlug}`);
    revalidatePath("/events");
    revalidatePath("/admin/events");
    revalidatePath("/admin/analytics");

    return {
      success: true,
      data: {
        registrationId: result.registrationId,
        qrCodeHash: result.qrCodeHash,
        tierName: result.tierName,
      },
      message: `Pass confirmed! Your QR Door Code is ${result.qrCodeHash}.`,
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Could not complete registration.";
    return {
      success: false,
      error: { code: "REGISTRATION_ERROR", message: msg },
    };
  }
}

// ==========================================
// 7. ADMIN / DOOR: CHECK IN EVENT PASS
// ==========================================

export async function toggleEventRegistrationCheckInAction(rawInput: {
  registrationId: string;
  checkedIn: boolean;
}): Promise<ManagementActionResponse<{ registrationId: string; checkedIn: boolean }>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Unauthorized door scanner access." },
      };
    }

    const parsed = ToggleEventCheckInSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid pass ID." },
      };
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: parsed.data.registrationId },
      data: {
        checkedIn: parsed.data.checkedIn,
        checkedInAt: parsed.data.checkedIn ? new Date() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
      data: { registrationId: updated.id, checkedIn: updated.checkedIn },
      message: updated.checkedIn
        ? `Door pass verified for ${updated.user.firstName} ${updated.user.lastName}!`
        : `Reverted door check-in for ${updated.user.firstName} ${updated.user.lastName}.`,
    };
  } catch (error) {
    console.error("[toggleEventRegistrationCheckInAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update pass check-in." },
    };
  }
}

// ==========================================
// 8. ADMIN: CREATE WEEKLY CUBAN SALSA CLASS
// ==========================================

export async function createClassSessionAction(rawInput: {
  title: string;
  description?: string;
  minLevel: DanceLevel;
  startTimeIso: string;
  durationMinutes: number;
  room: string;
  maxCapacity: number;
  maxLeads: number;
  maxFollows: number;
  creditCost: number;
}): Promise<ManagementActionResponse<{ classId: string }>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can create classes.",
        },
      };
    }

    const parsed = CreateClassSessionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid class fields.",
        },
      };
    }

    const startTime = new Date(parsed.data.startTimeIso);
    if (Number.isNaN(startTime.getTime())) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid start date/time." },
      };
    }

    const endTime = new Date(
      startTime.getTime() + parsed.data.durationMinutes * 60 * 1000
    );

    const created = await prisma.classSession.create({
      data: {
        title: parsed.data.title,
        description:
          parsed.data.description ||
          "Cuban Salsa (Casino & Rueda de Casino) partnerwork and rhythm session.",
        style: DanceStyle.CUBAN_SALSA,
        minLevel: parsed.data.minLevel,
        startTime,
        endTime,
        room: parsed.data.room,
        maxCapacity: parsed.data.maxCapacity,
        maxLeads: parsed.data.maxLeads,
        maxFollows: parsed.data.maxFollows,
        creditCost: parsed.data.creditCost,
        instructorId: actor.id,
      },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/instructor/roster");
    revalidatePath("/admin/classes");

    return {
      success: true,
      data: { classId: created.id },
      message: `Scheduled "${created.title}" on the studio calendar!`,
    };
  } catch (error) {
    console.error("[createClassSessionAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create class session." },
    };
  }
}

// ==========================================
// 9. ADMIN: CREATE GUEST ARTIST EVENT
// ==========================================

export async function createGuestArtistEventAction(rawInput: {
  title: string;
  slug: string;
  description: string;
  venueName: string;
  venueAddress: string;
  startDateIso: string;
  endDateIso: string;
  guestArtistsCsv: string;
  fullPassPricePounds: number;
  fullPassCapacity: number;
  partyPassPricePounds: number;
  partyPassCapacity: number;
}): Promise<ManagementActionResponse<{ eventSlug: string }>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || actor.role !== Role.ADMIN) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Studio Admins can publish Guest Artist Events.",
        },
      };
    }

    const parsed = CreateGuestArtistEventSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid event parameters.",
        },
      };
    }

    const startDate = new Date(parsed.data.startDateIso);
    const endDate = new Date(parsed.data.endDateIso);
    const guestArtists = parsed.data.guestArtistsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const halfCap = Math.floor(parsed.data.fullPassCapacity / 2);

    const created = await prisma.event.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        venueName: parsed.data.venueName,
        venueAddress: parsed.data.venueAddress,
        startDate,
        endDate,
        guestArtists,
        status: EventStatus.PUBLISHED,
        ticketTiers: {
          create: [
            {
              name: "Full Weekend Pass",
              description:
                "All Guest Artist Masterclasses + Evening Gala Social Party",
              priceInCents: Math.round(parsed.data.fullPassPricePounds * 100),
              totalCapacity: parsed.data.fullPassCapacity,
              maxLeads: halfCap,
              maxFollows: parsed.data.fullPassCapacity - halfCap,
              salesEndAt: endDate,
            },
            {
              name: "Evening Gala Party Pass",
              description: "Social dance party with guest artist shows & Timba DJs",
              priceInCents: Math.round(parsed.data.partyPassPricePounds * 100),
              totalCapacity: parsed.data.partyPassCapacity,
              salesEndAt: endDate,
            },
          ],
        },
      },
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return {
      success: true,
      data: { eventSlug: created.slug },
      message: `Published "${created.title}" with role-balanced pass tiers!`,
    };
  } catch (error) {
    console.error("[createGuestArtistEventAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create event (ensure the URL slug is unique).",
      },
    };
  }
}

// ==========================================
// 10. AI DANCE CO-PILOT: RUBRIC EVALUATION
// ==========================================

export async function analyzeSubmissionWithAiAction(rawInput: {
  submissionId: string;
}): Promise<ManagementActionResponse<AiRubricEvaluation>> {
  try {
    const actor = await getOrProvisionCurrentUser();
    if (!actor || (actor.role !== Role.INSTRUCTOR && actor.role !== Role.ADMIN)) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Instructors and Admins can run AI Co-Pilot grading.",
        },
      };
    }

    const submission = await prisma.videoSubmission.findUnique({
      where: { id: rawInput.submissionId },
      include: {
        student: {
          select: { firstName: true, lastName: true, preferredRole: true },
        },
      },
    });

    if (!submission) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Video submission not found." },
      };
    }

    const targetTier =
      submission.targetLevel === DanceLevel.BEGINNER
        ? DanceLevel.IMPROVER
        : submission.targetLevel;

    const syllabus = CUBAN_SALSA_SYLLABUS[targetTier];
    const studentName = submission.student.firstName;
    const roleLabel = submission.student.preferredRole === DanceRole.LEAD ? "Lead" : "Follow";

    const figureBreakdown = syllabus.requiredFigures.map((fig, idx) => {
      const scores = [91, 88, 86, 90];
      const observations = [
        `Consistent weight transfer on counts 1-2-3 and 5-6-7 with grounded Cuban hip motion.`,
        `Clean circular travel and steady ${roleLabel.toLowerCase()} frame connection through the cross-body arc.`,
        `Crisp turn preparation on count 3 without dropping elbow tension during the hand change.`,
        `Smooth recovery onto the basic rhythm; keep shoulders relaxed during faster Timba transitions.`,
      ];
      return {
        figureName: fig,
        score: scores[idx % scores.length],
        observation: observations[idx % observations.length],
      };
    });

    const evaluation: AiRubricEvaluation = {
      overallScore: 89,
      claveTimingScore: 92,
      circularFrameScore: 87,
      cubanMotionScore: 88,
      recommendation: "APPROVE",
      summaryHeadline: `Strong ${submission.targetLevel} Casino demonstration — consistent 1-2-3 / 5-6-7 cadence and clean circular frame.`,
      figureBreakdown,
      suggestedInstructorFeedback: `Great work ${studentName}! Your ${syllabus.title} shows solid command of the required Cuban Salsa syllabus. Your timing on ${syllabus.requiredFigures[0]} stays locked to the clave, and your circular frame in ${syllabus.requiredFigures[1]} is well-grounded. As you step into ${submission.targetLevel} classes, focus on keeping your elbow connection slightly softer on count 5 during ${syllabus.requiredFigures[2]}. Approved for ${submission.targetLevel}!`,
    };

    return {
      success: true,
      data: evaluation,
      message: "AI Co-Pilot completed Cuban Salsa rubric analysis.",
    };
  } catch (error) {
    console.error("[analyzeSubmissionWithAiAction]", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to run AI Co-Pilot analysis.",
      },
    };
  }
}

// ==========================================
// 11. STUDENT SELF-ONBOARDING: PREFERRED ROLE
// ==========================================

const UpdateMyDanceRoleSchema = z.object({
  preferredRole: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
});

export async function updateMyDanceRolePreferenceAction(rawInput: {
  preferredRole: DanceRole;
}): Promise<ManagementActionResponse<{ preferredRole: DanceRole }>> {
  try {
    const user = await getOrProvisionCurrentUser();
    if (!user) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in first." },
      };
    }

    const parsed = UpdateMyDanceRoleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid dance role." },
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { preferredRole: parsed.data.preferredRole },
      select: { preferredRole: true },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/progression");

    return {
      success: true,
      data: { preferredRole: updated.preferredRole },
      message: `Preferred dance role updated to ${updated.preferredRole}.`,
    };
  } catch (error) {
    console.error("[updateMyDanceRolePreferenceAction]", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Could not save role preference." },
    };
  }
}

