import { prisma } from "@/lib/prisma";
import { reportError } from "@/lib/monitoring";
import { ParsedEventCard, ParsedEventCardSchema } from "@/lib/validations/ai-studio.schema";

/**
 * Persistent store for AI-extracted, staff-approved event announcements shown on /events.
 * Backed by the PublishedAnnouncement table so every serverless instance sees the same list.
 */

const MAX_LIVE_ANNOUNCEMENTS = 50;

/** Reads live announcements. Fails soft to an empty list so /events still renders. */
export async function getPublishedEvents(): Promise<ParsedEventCard[]> {
  try {
    const rows = await prisma.publishedAnnouncement.findMany({
      orderBy: { updatedAt: "desc" },
      take: MAX_LIVE_ANNOUNCEMENTS,
      select: { card: true },
    });

    // Re-validate stored JSON so a malformed row can never reach the page
    return rows.flatMap((row) => {
      const parsed = ParsedEventCardSchema.safeParse(row.card);
      return parsed.success ? [parsed.data] : [];
    });
  } catch (err) {
    reportError("published-events-store:getPublishedEvents", err);
    return [];
  }
}

/** Upserts an announcement, replacing any older card with the same title. Returns the live count. */
export async function addPublishedEvent(
  event: ParsedEventCard,
  publishedById: string
): Promise<number> {
  await prisma.$transaction([
    prisma.publishedAnnouncement.deleteMany({
      where: { title: event.title, id: { not: event.id } },
    }),
    prisma.publishedAnnouncement.upsert({
      where: { id: event.id },
      create: { id: event.id, title: event.title, card: event, publishedById },
      update: { title: event.title, card: event, publishedById },
    }),
  ]);
  return prisma.publishedAnnouncement.count();
}

/** Removes an announcement. Returns the live count. */
export async function removePublishedEvent(eventId: string): Promise<number> {
  await prisma.publishedAnnouncement.deleteMany({ where: { id: eventId } });
  return prisma.publishedAnnouncement.count();
}
