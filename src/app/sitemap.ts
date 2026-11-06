import { getSiteOrigin } from "@/lib/safe-url";
import type { MetadataRoute } from "next";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { upcomingCanonicalEvents } from "@/lib/academy-data";
import { prisma } from "@/lib/prisma";

/** Most events live in the database, with the canonical list as the fallback if it can't be read */
async function upcomingEventSlugs(now: Date): Promise<string[]> {
  const canonical = upcomingCanonicalEvents(now).map((event) => event.slug);
  try {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED", endDate: { gte: now } },
      select: { slug: true },
    });
    return [...new Set([...canonical, ...events.map((event) => event.slug)])];
  } catch {
    return canonical;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();
  const now = new Date();

  const routes = [
    "",
    "/classes",
    "/events",
    ...(await upcomingEventSlugs(now)).map((slug) => `/events/${slug}`),
    "/pricing",
    "/venues",
    "/music",
    "/rueda",
    "/rueda/tarjetas",
    "/moves",
    ...getPublishedMoves().map((move) => `/moves/${move.id}`),
    ...TIMBA_SONG_ANATOMY_DATA.map((song) => `/music/${song.id}`),
    "/about",
    "/how-it-works",
    "/private-lessons",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" || route === "/classes" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/classes" || route === "/events" || route === "/llms.txt"
        ? 0.9
        : 0.8,
  }));
}
