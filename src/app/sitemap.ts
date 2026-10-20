import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  const now = new Date();

  const routes = [
    "",
    "/dashboard/schedule",
    "/events",
    "/pricing",
    "/private-lessons",
    "/venues",
    "/music",
    "/about",
    "/how-it-works",
    "/dashboard/rueda",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" || route === "/dashboard/schedule" ? ("daily" as const) : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route === "/dashboard/schedule" || route === "/events"
        ? 0.9
        : 0.8,
  }));
}
