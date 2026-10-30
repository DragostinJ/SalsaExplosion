import type { MetadataRoute } from "next";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  const now = new Date();

  const routes = [
    "",
    "/dashboard/schedule",
    "/events",
    "/events/made-in-cuba-dance-weekend-2026",
    "/pricing",
    "/venues",
    "/music",
    ...TIMBA_SONG_ANATOMY_DATA.map((song) => `/music/${song.id}`),
    "/shop",
    "/about",
    "/how-it-works",
    "/private-lessons",
    "/review",
    "/terms",
    "/llms.txt",
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
