import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  const now = new Date();

  const routes = [
    "",
    "/dashboard/schedule",
    "/dashboard/rueda",
    "/dashboard/wallet",
    "/dashboard/referrals",
    "/events",
    "/events/made-in-cuba-dance-weekend-2026",
    "/pricing",
    "/private-lessons",
    "/venues",
    "/music",
    "/about",
    "/how-it-works",
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
