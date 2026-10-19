import { unstable_cache } from "next/cache";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Cached fetcher for published public events.
 * Cached for 60 seconds or invalidated via tag "public-events".
 */
export const getCachedUpcomingEvents = (limit: number = 3) =>
  unstable_cache(
    async () => {
      return prisma.event.findMany({
        where: { status: EventStatus.PUBLISHED },
        orderBy: { startDate: "asc" },
        take: limit,
        include: {
          ticketTiers: {
            orderBy: { priceInCents: "asc" },
          },
        },
      });
    },
    [`cached-upcoming-events-${limit}`],
    {
      revalidate: 60,
      tags: ["public-events"],
    }
  )();

/**
 * Cached fetcher for upcoming active class sessions.
 * Cached for 60 seconds or invalidated via tag "public-classes".
 */
export const getCachedNextClasses = (limit: number = 3) =>
  unstable_cache(
    async () => {
      const now = new Date();
      return prisma.classSession.findMany({
        where: {
          startTime: { gt: now },
          isCancelled: false,
        },
        orderBy: { startTime: "asc" },
        take: limit,
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          bookings: {
            where: {
              status: { in: ["CONFIRMED", "ATTENDED"] },
            },
            select: {
              id: true,
              danceRole: true,
            },
          },
        },
      });
    },
    [`cached-next-classes-${limit}`],
    {
      revalidate: 60,
      tags: ["public-classes"],
    }
  )();
