import { getSiteOrigin } from "@/lib/safe-url";
import type { MetadataRoute } from "next";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { upcomingCanonicalEvents } from "@/lib/academy-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteOrigin();
  const now = new Date();

  const routes = [
    "",
    "/classes",
    "/events",
    ...upcomingCanonicalEvents().map((event) => `/events/${event.slug}`),
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
