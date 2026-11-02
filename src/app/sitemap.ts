import type { MetadataRoute } from "next";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { getPublishedMoves } from "@/lib/moves/move-library";
import { upcomingCanonicalEvents } from "@/lib/academy-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  const now = new Date();

  const routes = [
    "",
    "/dashboard/schedule",
    "/events",
    ...upcomingCanonicalEvents().map((event) => `/events/${event.slug}`),
    "/pricing",
    "/venues",
    "/music",
    "/dashboard/rueda",
    "/dashboard/rueda/tarjetas",
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
      route === "" || route === "/dashboard/schedule" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/dashboard/schedule" || route === "/events" || route === "/llms.txt"
        ? 0.9
        : 0.8,
  }));
}
