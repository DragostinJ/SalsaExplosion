"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AuditAction,
  DanceRole,
  EventStatus,
  Role,
  TicketPaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";
import type { ManagementActionResponse } from "@/lib/constants/management";

const RegisterEventTierSchema = z.object({
  eventId: z.string().min(1),
  ticketTierId: z.string().min(1),
  role: z.enum([DanceRole.LEAD, DanceRole.FOLLOW, DanceRole.SOLO]),
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
  // fallback-guard
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "BOOKING",
    async (): Promise<
      ManagementActionResponse<{
        registrationId: string;
        qrCodeHash: string;
        tierName: string;
      }>
    > => {
      try {
        if (!user) {
          return {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Please sign in to register for this event.",
            },
          };
        }
        if (isFallbackUser(user)) {
          return {
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: SERVICE_UNAVAILABLE_MESSAGE,
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

        // Safety net: canonical / fallback mock tier check
        if (
          ticketTierId.startsWith("tier-") ||
          ticketTierId.startsWith("canonical-") ||
          eventId.startsWith("canonical-")
        ) {
          return {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "This event isn't open for online booking yet.",
            },
          };
        }

        const result = await prisma.$transaction(async (tx) => {
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
        const SAFE_ERRORS = [
          "Ticket tier not found.",
          "You already hold an active pass for this tier!",
          "This ticket tier is completely sold out.",
          "Lead spots for this tier are currently full to maintain partner balance.",
          "Follow spots for this tier are currently full to maintain partner balance.",
          "Direct registration is only available for free tiers or RSVPs. Paid passes must be purchased via Stripe checkout.",
        ];
        const rawMsg = error instanceof Error ? error.message : "";
        const isSafe = SAFE_ERRORS.includes(rawMsg);
        if (!isSafe) {
          console.error("[registerForEventTierAction]", error);
        }
        return {
          success: false,
          error: {
            code: "REGISTRATION_ERROR",
            message: isSafe
              ? rawMsg
              : "Could not complete registration. Please try again or contact studio reception.",
          },
        };
      }
    }
  );
}

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
    // fallback-guard
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
    if (isFallbackUser(actor)) {
      return {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: SERVICE_UNAVAILABLE_MESSAGE,
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
    if (endDate < startDate) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Event end date cannot be earlier than start date.",
        },
      };
    }
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

    await recordAuditLog({
      actorId: actor.id,
      action: AuditAction.EVENT_MUTATION,
      targetType: "EVENT",
      targetId: created.id,
      metadata: {
        mutation: "CREATE_CONGRESS_EVENT",
        title: created.title,
        slug: created.slug,
        fullPassCapacity: parsed.data.fullPassCapacity,
        partyPassCapacity: parsed.data.partyPassCapacity,
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
